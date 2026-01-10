/**
 * Database Migration Script
 * Run this to create the users table in your PostgreSQL database
 */

// Load environment variables first
import { config } from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load .env.local
config({ path: '.env.local' });

async function runMigration() {
  // Import pool after environment variables are loaded
  const { pool } = await import('./db');
  
  try {
    console.log('🚀 Starting database migration...');
    
    // Read and execute the users table schema
    const schemaPath = path.join(__dirname, 'schema', 'users.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('✅ Users table created successfully!');
    console.log('📊 Table schema:');
    console.log('  - id: VARCHAR(255) PRIMARY KEY');
    console.log('  - email: VARCHAR(255) UNIQUE NOT NULL');
    console.log('  - name: VARCHAR(255)');
    console.log('  - image: TEXT');
    console.log('  - email_verified: BOOLEAN');
    console.log('  - created_at: TIMESTAMP');
    console.log('  - updated_at: TIMESTAMP (auto-updated)');
    console.log('  - last_login: TIMESTAMP');
    
    // Verify table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verification successful: users table exists');
    } else {
      console.log('⚠️  Warning: Could not verify table creation');
    }
    
    // Close pool
    const { closePool } = await import('./db');
    await closePool();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { runMigration };
