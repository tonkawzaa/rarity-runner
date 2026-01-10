/**
 * Database Connection Pool and Utilities
 * 
 * This module provides a secure PostgreSQL connection pool and utility functions
 * for executing database queries safely.
 * 
 * Security features:
 * - Connection pooling for resource management
 * - Parameterized queries to prevent SQL injection
 * - Error handling and logging
 * - Automatic connection cleanup
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { getDbConfig, isDevelopment } from './db.config';
import { DbQueryResult, QueryParams, PoolStatus, DbError } from './types';

/**
 * PostgreSQL connection pool
 * Singleton pattern ensures only one pool instance exists
 */
let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getDbConfig());
    
    // Handle pool errors
    pool.on('error', (err: DbError) => {
      console.error('Unexpected database pool error:', err);
    });
    
    // Log pool connection in development
    if (isDevelopment) {
      pool.on('connect', () => {
        console.log('New database connection established');
      });
    }
  }
  
  return pool;
}

/**
 * Execute a parameterized query
 * 
 * IMPORTANT: Always use parameterized queries to prevent SQL injection
 * 
 * Example:
 * ```typescript
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 * ```
 * 
 * @param text - SQL query with parameter placeholders ($1, $2, etc.)
 * @param params - Array of parameter values
 * @returns Query result
 */
export async function query<T extends QueryResult = DbQueryResult>(
  text: string,
  params?: QueryParams
): Promise<T> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<any>(text, params);
    const duration = Date.now() - start;
    
    // Log query in development mode
    if (isDevelopment) {
      console.log('Query executed:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }
    
    return result as T;
  } catch (error) {
    const dbError = error as DbError;
    console.error('Database query error:', {
      message: dbError.message,
      code: dbError.code,
      detail: dbError.detail,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * 
 * Example:
 * ```typescript
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO ...');
 *   await client.query('UPDATE ...');
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 * ```
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a function within a transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 * 
 * @param callback - Function to execute within transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get pool status information
 */
export function getPoolStatus(): PoolStatus {
  const pool = getPool();
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Close all connections in the pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    if (isDevelopment) {
      console.log('Database pool closed');
    }
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now, version() as version');
    if (isDevelopment) {
      console.log('Database connection test successful:', {
        time: result.rows[0].now,
        version: result.rows[0].version.split(',')[0],
      });
    }
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Export default query function
export default { query, getClient, transaction, testConnection, closePool, getPoolStatus };
