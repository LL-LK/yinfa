import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

let db: Database | null = null;
const isProduction = process.env.NODE_ENV === 'production';
const dataDir = isProduction 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH || '/app', 'data')
  : path.join(__dirname, '..', '..', '..', 'data');
const dbPath = path.join(dataDir, 'shop.db');
const backupDir = path.join(dataDir, 'backups');
const MAX_BACKUPS = 24;
const BACKUP_INTERVAL_MS = 60 * 60 * 1000;
let backupTimer: ReturnType<typeof setInterval> | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  // 确保数据目录存在
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
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (3, '桂林米粉体验套餐', '正宗桂林米粉+锅烧+卤牛肉，配一碗大骨汤', 38.00, 500, '/image/72.png', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (3, '啤酒鱼套餐', '阳朔名菜，漓江鲜鱼配啤酒烹制，鱼肉鲜嫩', 88.00, 100, '/image/11.png', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (4, '桂林阳朔三日游', '含漓江游船+阳朔西街+龙脊梯田，全程导游陪同，适合老年团', 799.00, 60, '/image/b1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (5, '桂林山水画扇', '手工绘制漓江风景折扇，精美雅致', 68.00, 500, '/image/82.png', 1)`);

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