import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

let db: Database | null = null;
const dbPath = path.join(__dirname, '..', '..', 'data', 'shop.db');

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('Database loaded from file');
  } else {
    db = new SQL.Database();
    createTables(db);
    insertSampleData(db);
    console.log('Database created with sample data');
  }

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
  `);
}

function insertSampleData(database: Database): void {
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('景点门票', 'tickets', 1)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('酒店住宿', 'hotels', 2)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('旅游团', 'tours', 3)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('特色美食', 'food', 4)`);
  database.run(`INSERT INTO categories (name, slug, "order") VALUES ('纪念品', 'souvenirs', 5)`);

  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '故宫门票', '北京故宫成人票', 60.00, 100, '/image/1.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '长城门票', '八达岭长城成人票', 45.00, 200, '/image/2.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (1, '颐和园门票', '颐和园成人票', 30.00, 150, '/image/3.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (2, '北京饭店', '五星级豪华酒店', 800.00, 20, '/image/4.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (2, '王府井酒店', '四星级商务酒店', 450.00, 30, '/image/5.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (3, '北京一日游', '经典线路包含午餐', 299.00, 50, '/image/6.jpg', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (4, '北京烤鸭', '全聚德招牌烤鸭', 198.00, 100, '/image/72.png', 1)`);
  database.run(`INSERT INTO products (category_id, name, description, price, stock, image_url, is_active) VALUES (5, '故宫书签', '精美金属书签', 38.00, 500, '/image/82.png', 1)`);

  ensureDataDir();
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'shop.db'), buffer);
}

function ensureDataDir(): void {
  const dataDir = path.join(__dirname, '..', '..', 'data');
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
    fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'shop.db'), buffer);
  }
}