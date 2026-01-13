
import 'dotenv/config';
import { pool, query } from './src/server/db.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    try {
        console.log('🔄 Applying Admin Panel migration...');
        const migrationPath = path.join(__dirname, 'migrations', 'add_admin_panel.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        await query(sql);
        console.log('✅ Migration applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
migrate();
