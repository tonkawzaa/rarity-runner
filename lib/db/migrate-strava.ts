/**
 * Strava Database Migration Script
 * Run this to create Strava connection and activities tables
 */

// Load environment variables
import { config } from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load .env.local
config({ path: '.env.local' });

async function runMigration() {
  // Import pool after environment variables are loaded
  const { pool } = await import('./db');
  
  try {
    console.log('🚀 Starting Strava database migration...\n');
    
    // Read and execute the Strava schema
    const schemaPath = path.join(__dirname, 'schema', 'strava.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('✅ Strava tables created successfully!\n');
    console.log('📊 Created tables:');
    console.log('  1. strava_connections');
    console.log('     - Stores OAuth tokens and athlete data');
    console.log('  2. running_activities');
    console.log('     - Stores running activity data from Strava\n');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('strava_connections', 'running_activities')
      ORDER BY table_name;
    `);
    
    if (result.rows.length === 2) {
      console.log('✅ Verification successful: All tables exist');
      console.log(`   - ${result.rows[0].table_name}`);
      console.log(`   - ${result.rows[1].table_name}`);
    } else {
      console.log('⚠️  Warning: Could not verify all tables');
    }
    
    console.log('\n🎉 Migration completed!\n');
    
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
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { runMigration };
