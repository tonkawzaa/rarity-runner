/**
 * Database Setup Utility
 * 
 * This script creates the database if it doesn't exist
 * Run: npx tsx lib/db/setup-db.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function setupDatabase() {
  console.log('🔧 Setting up PostgreSQL database...\n');
  
  // Connect to postgres database (default) to create our database
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    // Check if database exists
    const dbName = process.env.POSTGRES_DB;
    console.log(`Checking if database "${dbName}" exists...`);
    
    const result = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists\n`);
    } else {
      console.log(`Creating database "${dbName}"...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully\n`);
    }

    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
