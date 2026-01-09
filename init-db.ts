import 'dotenv/config';
import { pool, query } from './src/server/db.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
    try {
        console.log('🔄 Initializing database...');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        await query(schema);

        console.log('✅ Database initialized successfully!');
        console.log('📊 Tables created:');
        console.log('  - users');
        console.log('  - profiles');
        console.log('  - projects');
        console.log('  - bookmarks');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        await pool.end();
        process.exit(1);
    }
}

initDatabase();
