/**
 * PostgreSQL 迁移执行器
 * 用法:
 *   npx ts-node migrate.ts
 *   npx ts-node migrate.ts --dry-run
 *   npx ts-node migrate.ts --rollback
 */
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function getPool(): Promise<Pool> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置。请先在 Railway 控制台配置 PostgreSQL。');
  }
  return new Pool({ connectionString });
}

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations ORDER BY filename'
  );
  return new Set(result.rows.map(r => r.filename));
}

async function runMigrations(dryRun = false): Promise<void> {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(pool);
    const applied = await getAppliedMigrations(pool);
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const pending = files.filter(f => !applied.has(f));

    if (pending.length === 0) {
      console.log('✅ 所有迁移已完成，无待执行迁移。');
      return;
    }

    console.log(`📋 待执行迁移: ${pending.length} 个`);
    for (const f of pending) {
      console.log(`   - ${f}`);
    }

    if (dryRun) {
      console.log('\n🔍 演练模式，不执行实际迁移。');
      return;
    }

    for (const filename of pending) {
      const filepath = path.join(MIGRATIONS_DIR, filename);
      const sql = fs.readFileSync(filepath, 'utf-8');

      console.log(`\n⬆️  执行迁移: ${filename}`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [filename]
        );
        await client.query('COMMIT');
        console.log(`✅ 迁移完成: ${filename}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ 迁移失败: ${filename}`);
        console.error(err);
        throw err;
      }
    }

    console.log('\n🎉 所有迁移执行完毕。');
  } finally {
    client.release();
    await pool.end();
  }
}

// 仅迁移数据（不重建表结构），用于从 SQL.js 数据迁移
async function migrateDataOnly(): Promise<void> {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    console.log('📦 数据迁移模式（保留现有表结构）...');
    // 示例：迁移 orders 表的 transaction_id 列（如果不存在则添加）
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'transaction_id'
        ) THEN
          ALTER TABLE orders ADD COLUMN transaction_id VARCHAR(255);
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'pay_type'
        ) THEN
          ALTER TABLE orders ADD COLUMN pay_type VARCHAR(20);
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'paid_at'
        ) THEN
          ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'notes'
        ) THEN
          ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT '';
        END IF;
      END $$;
    `);
    console.log('✅ 数据迁移列添加完成。');
  } finally {
    client.release();
    await pool.end();
  }
}

const args = process.argv.slice(2);
if (args.includes('--dry-run')) {
  runMigrations(true).catch(e => { console.error(e); process.exit(1); });
} else if (args.includes('--data-only')) {
  migrateDataOnly().catch(e => { console.error(e); process.exit(1); });
} else {
  runMigrations(false).catch(e => { console.error(e); process.exit(1); });
}
