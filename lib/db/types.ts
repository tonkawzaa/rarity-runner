/**
 * Database Type Definitions
 * 
 * TypeScript types and interfaces for database operations
 */

import { QueryResult, QueryResultRow } from 'pg';

/**
 * Generic query result type
 */
export type DbQueryResult<T extends QueryResultRow = any> = QueryResult<T>;

/**
 * Database error type
 */
export interface DbError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

/**
 * Connection pool status
 */
export interface PoolStatus {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

/**
 * Query parameters type
 */
export type QueryParams = any[];
