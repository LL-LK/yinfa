/**
 * PostgreSQL 数据库适配器
 * 提供与 SQL.js 相同的 dbQuery / dbExecute 接口
 * 当环境变量 DATABASE_URL 存在时自动启用
 */
import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export function initDatabase(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未设置，无法初始化 PostgreSQL');
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err);
  });
  console.log('[DB] PostgreSQL 连接池已初始化');
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Set DATABASE_URL environment variable.');
  }
  return pool;
}

/**
 * 参数化查询辅助函数，返回行数组
 * PostgreSQL 使用 $1, $2 占位符而非 :name
 * 自动将 :name 格式转换为 $N 格式
 */
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const { text, values } = convertParams(sql, params);
    const result = await client.query(text, values);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * 参数化执行 INSERT/UPDATE/DELETE
 */
export async function dbExecute(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<void> {
  const client = await getPool().connect();
  try {
    const { text, values } = convertParams(sql, params);
    await client.query(text, values);
  } finally {
    client.release();
  }
}

/**
 * 将 SQL.js 的 :name 参数格式转换为 PostgreSQL 的 $N 格式
 * SQL.js:  SELECT * FROM users WHERE id = :id
 * PostgreSQL: SELECT * FROM users WHERE id = $1
 */
function convertParams(
  sql: string,
  params: Record<string, unknown>
): { text: string; values: unknown[] } {
  const keys = Object.keys(params);
  let text = sql;
  const values: unknown[] = [];

  keys.forEach((key, index) => {
    const placeholder = `:${key}`;
    const pos = text.indexOf(placeholder);
    if (pos !== -1) {
      const before = text.slice(0, pos);
      const after = text.slice(pos + placeholder.length);
      text = `${before} $${index + 1}${after}`;
      values.push(params[key]);
    }
  });

  return { text, values };
}

/**
 * 事务支持
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export const isPostgres = true;