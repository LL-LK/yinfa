import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

// PostgreSQL pool类型内联，避免编译时需要安装 pg 模块
type PgPool = any;
type PgClient = any;

let db: Database | null = null;
let pgPool: PgPool | null = null;
let usePostgres = false;
let pgQueryFn: ((sql: string, params: Record<string, unknown>) => Promise<Record<string, unknown>[]>) | null = null;
let pgExecuteFn: ((sql: string, params: Record<string, unknown>) => Promise<void>) | null = null;

const isProduction = process.env.NODE_ENV === 'production';
const dataDir = isProduction
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH || '/app', 'data')
  : path.join(__dirname, '..', '..', '..', 'data');
const dbPath = path.join(dataDir, 'shop.db');
const backupDir = path.join(dataDir, 'backups');
const MAX_BACKUPS = 24;
const BACKUP_INTERVAL_MS = 60 * 60 * 1000;
let backupTimer: ReturnType<typeof setInterval> | null = null;

export function isUsingPostgres(): boolean {
  return usePostgres;
}

export async function initDatabase(): Promise<Database> {
  // 优先尝试 PostgreSQL（当 DATABASE_URL 环境变量存在时）
  if (process.env.DATABASE_URL) {
    try {
      const { Pool } = await import('pg');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      // 测试连接
      const testClient = await pgPool.connect();
      testClient.release();
      usePostgres = true;

      // PostgreSQL 参数转换: :name → $N
      const convertParams = (sql: string, params: Record<string, unknown>): { text: string; values: unknown[] } => {
        const keys = Object.keys(params);
        let text = sql;
        const values: unknown[] = [];
        keys.forEach((key, index) => {
          const placeholder = `:${key}`;
          let pos = 0;
          while ((pos = text.indexOf(placeholder, pos)) !== -1) {
            const before = pos === 0 ? ' ' : text[pos - 1];
            const afterPos = pos + placeholder.length;
            const after = afterPos >= text.length ? ' ' : text[afterPos];
            if (!/[a-zA-Z0-9_]/.test(before) && !/[a-zA-Z0-9_]/.test(after)) {
              text = text.slice(0, pos) + `$${index + 1}` + text.slice(afterPos);
              values.push(params[key]);
            }
            pos += placeholder.length;
          }
        });
        return { text, values };
      };

      pgQueryFn = async (sql: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
        const { text, values } = convertParams(sql, params);
        const result = await pgPool!.query(text, values);
        return result.rows as Record<string, unknown>[];
      };

      pgExecuteFn = async (sql: string, params: Record<string, unknown> = {}): Promise<void> => {
        const { text, values } = convertParams(sql, params);
        await pgPool!.query(text, values);
      };

      logger.info('[DB] PostgreSQL 已启用（Railway）');
      return null as unknown as Database; // PostgreSQL 模式下返回 null，路由使用 pgQueryFn/pgExecuteFn
    } catch (e) {
      logger.warn({ err: e }, '[DB] PostgreSQL 连接失败，回退到 SQL.js');
      usePostgres = false;
    }
  }

  // SQL.js 初始化（开发和生产无 DATABASE_URL 时）
  const SQL = await initSqlJs();
  if (db) return db; // 已初始化

  ensureDataDir();

  if (fs.existsSync(dbPath)) {
    try {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      logger.info('Database loaded from file: ' + dbPath);
    } catch (e) {
      logger.warn({ err: e }, 'Failed to load database file, trying backup');
      db = tryLoadFromBackup(SQL);
      if (!db) {
        logger.warn('No backup available, creating new database');
        db = new SQL.Database();
        createTables(db);
        insertSampleData(db);
      }
    }
  } else {
    logger.info('No database file found, trying backup');
    db = tryLoadFromBackup(SQL);
    if (!db) {
      db = new SQL.Database();
      createTables(db);
      insertSampleData(db);
      logger.info('Database created with sample data');
    }
  }

  saveDatabase();
  startBackupTimer();
  return db;
}

/**
 * PostgreSQL 参数化查询（异步，替代 SQL.js 同步 dbQuery）
 * 使用方式与 dbQuery 相同：await dbQuery(sql, { paramName: value })
 */
export async function dbQuery(sql: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
  if (usePostgres && pgQueryFn) {
    return pgQueryFn(sql, params);
  }
  // SQL.js 同步模式（兼容未迁移的路由）
  const database = getDatabase();
  const stmt = database.prepare(sql);
  if (Object.keys(params).length > 0) {
    const bindObj: Record<string, unknown> = {};
    Object.keys(params).forEach((key, i) => {
      bindObj[`$${i + 1}`] = params[key];
    });
    // SQL.js 使用 $1, $2 格式绑定
    const keys = Object.keys(params);
    let idx = 0;
    const rewritten = sql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, () => {
      return `$${++idx}`;
    });
    const stmt2 = database.prepare(rewritten);
    keys.forEach((key, i) => stmt2.bind({ [`$${i + 1}`]: params[key] as import('sql.js').SqlValue }));
    const rows: Record<string, unknown>[] = [];
    while (stmt2.step()) rows.push(stmt2.getAsObject() as Record<string, unknown>);
    stmt2.free();
    return rows;
  }
  const result = database.exec(sql);
  if (result.length === 0) return [];
  return result[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    result[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

/**
 * PostgreSQL 参数化执行（异步，替代 SQL.js 同步 dbExecute）
 */
export async function dbExecute(sql: string, params: Record<string, unknown> = {}): Promise<void> {
  if (usePostgres && pgExecuteFn) {
    return pgExecuteFn(sql, params);
  }
  // SQL.js 同步模式
  const database = getDatabase();
  if (Object.keys(params).length > 0) {
    const keys = Object.keys(params);
    let idx = 0;
    const rewritten = sql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, () => {
      return `$${++idx}`;
    });
    keys.forEach((key, i) => database.run(rewritten, { [`$${i + 1}`]: params[key] as import('sql.js').SqlValue }));
    return;
  }
  database.run(sql);
}

function createTables(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      "order" INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      image_url TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      nickname TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line TEXT NOT NULL,
      city TEXT DEFAULT '',
      postal_code TEXT DEFAULT '',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_no TEXT UNIQUE NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT DEFAULT '',
      is_primary INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      blood_pressure TEXT DEFAULT '',
      heart_rate TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      record_date TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_profiles(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
}

function insertSampleData(database: Database): void {
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('漓江景点', 'scenic', 1)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('酒店住宿', 'hotels', 2)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('桂林美食', 'food', 3)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('旅游线路', 'tours', 4)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('桂林特产', 'souvenirs', 5)`);

  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '漓江精华游船票', '乘船游览漓江精华段，欣赏黄布倒影、九马画山等经典景观，全程约4小时', 215.00, 200, '/image/b1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '象鼻山公园门票', '桂林城徽象鼻山，山形酷似大象饮水，适合老年游客漫步游览，约2小时', 55.00, 300, '/image/b2.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '阳朔西街自由行', '中西文化交融的古街，石板路两侧店铺林立，可品尝地道桂林美食', 0.00, 999, '/image/b3.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '龙脊梯田观光', '壮观的梯田景观，建议青壮年游客前往，老年人请量力而行', 180.00, 150, '/image/b1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '两江四湖夜游船', '乘船夜游桂林市区水系，灯光璀璨，适合全家出行，约2.5小时', 220.00, 100, '/image/b2.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '芦笛岩溶洞', '著名溶洞景观，钟乳石千姿百态，洞内恒温约20°C，雨天游览好去处', 90.00, 180, '/image/b3.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '杨堤码头竹筏漂流', '漓江精华段起点，乘竹筏漂流至九马画山，欣赏两岸如画美景，约2小时', 160.00, 120, '/image/b1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (2, '桂林漓江大瀑布酒店', '五星级景观酒店，毗邻两江四湖，提供老年人专属无障碍房间', 680.00, 50, '/image/b2.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (2, '阳朔悦榕庄', '高端度假酒店，环境清幽，适合静养休闲', 1200.00, 30, '/image/b3.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (3, '桂林米粉体验套餐', '正宗桂林米粉+锅烧+卤牛肉，配一碗大骨汤', 38.00, 500, '/image/food-icon.webp', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (3, '啤酒鱼套餐', '阳朔名菜，漓江鲜鱼配啤酒烹制，鱼肉鲜嫩', 88.00, 100, '/image/b1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (4, '桂林阳朔三日游', '含漓江游船+阳朔西街+龙脊梯田，全程导游陪同，适合老年团', 799.00, 60, '/image/b1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (5, '桂林山水画扇', '手工绘制漓江风景折扇，精美雅致', 68.00, 500, '/image/b2.jpg', 1)`);

  ensureDataDir();
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

export function saveDatabase(): void {
  if (db) {
    ensureDataDir();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function tryLoadFromBackup(SQL: any): Database | null {
  if (!fs.existsSync(backupDir)) return null;

  try {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('shop_backup_') && f.endsWith('.db'))
      .sort()
      .reverse();

    for (const file of files) {
      try {
        const backupPath = path.join(backupDir, file);
        const buffer = fs.readFileSync(backupPath);
        const backupDb = new SQL.Database(buffer);
        logger.info('Database restored from backup: ' + file);
        return backupDb;
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function createBackup(): void {
  if (!db) return;

  try {
    ensureDataDir();
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `shop_backup_${timestamp}.db`);
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(backupFile, buffer);
    logger.info('Database backup created: ' + path.basename(backupFile));

    cleanupOldBackups();
  } catch (e) {
    logger.error({ err: e }, 'Database backup failed');
  }
}

function cleanupOldBackups(): void {
  try {
    if (!fs.existsSync(backupDir)) return;

    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('shop_backup_') && f.endsWith('.db'))
      .sort();

    while (files.length > MAX_BACKUPS) {
      const oldFile = files.shift()!;
      fs.unlinkSync(path.join(backupDir, oldFile));
      logger.info('Old backup removed: ' + oldFile);
    }
  } catch (e) {
    logger.error({ err: e }, 'Backup cleanup failed');
  }
}

function startBackupTimer(): void {
  if (backupTimer) return;

  createBackup();

  backupTimer = setInterval(() => {
    createBackup();
  }, BACKUP_INTERVAL_MS);

  logger.info('Database auto-backup scheduled every ' + (BACKUP_INTERVAL_MS / 3600000) + ' hour(s)');
}

export function stopBackupTimer(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}