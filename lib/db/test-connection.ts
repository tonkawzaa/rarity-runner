/**
 * Database Connection Test
 * 
 * Simple test file to verify PostgreSQL connection
 * Run this file to test the database connection
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

// Imports will be dynamic to ensure env vars are loaded first

async function runTest() {
  console.log('🔍 Testing PostgreSQL Database Connection...\n');
  
  // Dynamically import db module to ensure env vars are loaded
  const { testConnection, query, getPoolStatus, closePool } = await import('./db');
  
  try {
    // Test 1: Basic connection test
    console.log('Test 1: Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Connection test failed');
      process.exit(1);
    }
    console.log('✅ Connection test passed\n');
    
    // Test 2: Query database version and current time
    console.log('Test 2: Querying database info...');
    const result = await query('SELECT version() as version, NOW() as current_time');
    console.log('✅ Database version:', result.rows[0].version.split(',')[0]);
    console.log('✅ Current time:', result.rows[0].current_time);
    console.log('');
    
    // Test 3: Check pool status
    console.log('Test 3: Checking connection pool status...');
    const poolStatus = getPoolStatus();
    console.log('✅ Pool status:', poolStatus);
    console.log('');
    
    // Test 4: Test parameterized query
    console.log('Test 4: Testing parameterized query...');
    const paramResult = await query(
      'SELECT $1::text as message, $2::int as number',
      ['Hello from Rarity Runner!', 42]
    );
    console.log('✅ Parameterized query result:', paramResult.rows[0]);
    console.log('');
    
    console.log('🎉 All tests passed successfully!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Clean up: close the pool
    await closePool();
    console.log('Database pool closed');
  }
}

// Run the test
runTest();
