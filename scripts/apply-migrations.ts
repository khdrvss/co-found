import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function main() {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  // Ensure migrations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS applied_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  for (const file of files) {
    const already = await client.query('SELECT 1 FROM applied_migrations WHERE filename = $1', [file]);
    if (already.rows.length > 0) {
      console.log(`Skipping already applied migration: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`Applying migration: ${file}`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO applied_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied migration: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed to apply migration ${file}:`, err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('All migrations applied');
}

main().catch((err) => { console.error(err); process.exit(1); });
