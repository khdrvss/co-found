/**
 * Database optimization migration script
 * Adds indexes and constraints for better performance
 * Run this script with: npm run migrate:optimize
 */

import { pool, query } from './src/server/db';

async function optimizeDatabase() {
  try {
    console.log('🔄 Starting database optimization...\n');

    // 1. Add indexes on frequently queried columns
    console.log('📊 Adding indexes...');

    // Index on users.email for login queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users(email);
    `);
    console.log('  ✅ Index on users.email');

    // Index on profiles.user_id for profile lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
      ON profiles(user_id);
    `);
    console.log('  ✅ Index on profiles.user_id');

    // Index on projects.user_id for project lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id 
      ON projects(user_id);
    `);
    console.log('  ✅ Index on projects.user_id');

    // Index on projects.created_at for sorting
    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_created_at 
      ON projects(created_at DESC);
    `);
    console.log('  ✅ Index on projects.created_at');

    // Index on profiles.created_at for sorting
    await query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
      ON profiles(created_at DESC);
    `);
    console.log('  ✅ Index on profiles.created_at');

    // Composite index for private messages
    await query(`
      CREATE INDEX IF NOT EXISTS idx_private_messages_sender_receiver 
      ON private_messages(sender_id, receiver_id);
    `);
    console.log('  ✅ Composite index on private_messages(sender_id, receiver_id)');

    // Index on private messages for time-based queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_private_messages_created_at 
      ON private_messages(created_at DESC);
    `);
    console.log('  ✅ Index on private_messages.created_at');

    // Index on projects.recommended for filtering
    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_recommended 
      ON projects(recommended);
    `);
    console.log('  ✅ Index on projects.recommended');

    // Index on projects.category for filtering
    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_category 
      ON projects(category);
    `);
    console.log('  ✅ Index on projects.category');

    // Index on projects.viloyat for location filtering
    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_viloyat 
      ON projects(viloyat);
    `);
    console.log('  ✅ Index on projects.viloyat');

    // Index on profiles.viloyat for location filtering
    await query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_viloyat 
      ON profiles(viloyat);
    `);
    console.log('  ✅ Index on profiles.viloyat');

    // 2. Add unique constraints
    console.log('\n🔐 Adding unique constraints...');

    // Check if constraint exists before adding
    const constraintCheck = await query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'profiles' AND column_name = 'user_id' 
        AND constraint_name LIKE '%unique%'
      )
    `);

    if (!constraintCheck.rows[0].exists) {
      await query(`
        ALTER TABLE profiles 
        ADD CONSTRAINT unique_profiles_user_id UNIQUE(user_id);
      `);
      console.log('  ✅ Unique constraint on profiles.user_id');
    } else {
      console.log('  ⏭️  Unique constraint already exists on profiles.user_id');
    }

    // 3. Create composite indexes for common JOIN operations
    console.log('\n⚡ Adding composite indexes for common queries...');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_created 
      ON projects(user_id, created_at DESC);
    `);
    console.log('  ✅ Composite index on projects(user_id, created_at)');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_available_created 
      ON profiles(available, created_at DESC);
    `);
    console.log('  ✅ Composite index on profiles(available, created_at)');

    // 4. Analyze tables to update query planner statistics
    console.log('\n📈 Analyzing tables...');

    await query('ANALYZE users;');
    console.log('  ✅ Analyzed users table');

    await query('ANALYZE profiles;');
    console.log('  ✅ Analyzed profiles table');

    await query('ANALYZE projects;');
    console.log('  ✅ Analyzed projects table');

    await query('ANALYZE private_messages;');
    console.log('  ✅ Analyzed private_messages table');

    // 5. Display index information
    console.log('\n📋 Created indexes summary:');

    const indexes = await query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'profiles', 'projects', 'private_messages')
      ORDER BY tablename, indexname;
    `);

    indexes.rows.forEach((index: any) => {
      console.log(`  • ${index.tablename}.${index.indexname}`);
    });

    console.log('\n✅ Database optimization completed successfully!');
    console.log('📊 Indexes will improve query performance, especially for:');
    console.log('   • User login and profile lookups');
    console.log('   • Project filtering and sorting');
    console.log('   • Private message queries');
    console.log('   • Location-based filtering');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    await pool.end();
    process.exit(1);
  }
}

optimizeDatabase();
