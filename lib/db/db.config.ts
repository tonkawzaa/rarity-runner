/**
 * Database Configuration
 * 
 * This file centralizes all database configuration settings.
 * All sensitive credentials are loaded from environment variables.
 */

import { PoolConfig } from 'pg';

/**
 * Validate required environment variables
 * This is called lazily when the pool is created, not during module import
 */
function validateEnvVars(): void {
  const requiredEnvVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

/**
 * Get PostgreSQL Pool Configuration
 * 
 * Security features:
 * - All credentials from environment variables
 * - Connection pooling for efficient resource management
 * - Idle timeout to close unused connections
 * - Maximum connection limit to prevent overload
 */
export function getDbConfig(): PoolConfig {
  // Validate environment variables when config is requested
  validateEnvVars();
  
  return {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    
    // Pool configuration for optimal performance and security
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection fails
    
    // SSL configuration (uncomment for production with SSL)
    // SSL configuration - Required for Neon
    ssl: {
      rejectUnauthorized: true,
    },
  };
}

/**
 * Database name for reference
 */
export const DB_NAME = process.env.POSTGRES_DB;

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV !== 'production';

