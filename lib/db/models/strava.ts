/**
 * Strava Connection Model
 * Types and database functions for Strava OAuth connections
 */

import { pool } from '../db';
import { 
  stravaConnectionCache, 
  leaderboardCache, 
  userStatsCache,
  getCacheKey,
  invalidateUserCache 
} from '../cache';

export interface StravaConnection {
  id: number;
  user_id: string;
  strava_user_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  athlete_data: any;
  connected_at: Date;
  updated_at: Date;
}

export interface StravaConnectionInput {
  user_id: string;
  strava_user_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  athlete_data?: any;
}

export interface RunningActivity {
  id: number;
  user_id: string;
  strava_activity_id: number;
  name: string | null;
  distance: number | null;
  moving_time: number | null;
  elapsed_time: number | null;
  total_elevation_gain: number | null;
  activity_type: string | null;
  start_date: Date | null;
  start_date_local: Date | null;
  timezone: string | null;
  average_speed: number | null;
  max_speed: number | null;
  average_heartrate: number | null;
  max_heartrate: number | null;
  calories: number | null;
  map_polyline: string | null;
  raw_data: any;
  created_at: Date;
  updated_at: Date;
}

/**
 * Save or update Strava connection
 */
export async function upsertStravaConnection(
  data: StravaConnectionInput
): Promise<StravaConnection> {
  const query = `
    INSERT INTO strava_connections (
      user_id, strava_user_id, access_token, refresh_token, 
      expires_at, athlete_data
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id)
    DO UPDATE SET
      strava_user_id = EXCLUDED.strava_user_id,
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      athlete_data = EXCLUDED.athlete_data,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    data.user_id,
    data.strava_user_id,
    data.access_token,
    data.refresh_token,
    data.expires_at,
    data.athlete_data ? JSON.stringify(data.athlete_data) : null,
  ];

  try {
    const result = await pool.query<StravaConnection>(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting Strava connection:', error);
    throw error;
  }
}

/**
 * Get Strava connection by user ID
 * Uses LRU cache with 30-minute TTL for cross-request caching
 */
export async function getStravaConnectionByUserId(
  user_id: string
): Promise<StravaConnection | null> {
  // Check cache first
  const cached = stravaConnectionCache.get(user_id);
  if (cached !== undefined) {
    return cached;
  }

  const query = 'SELECT * FROM strava_connections WHERE user_id = $1';

  try {
    const result = await pool.query<StravaConnection>(query, [user_id]);
    const connection = result.rows[0] || null;
    
    // Cache the result
    stravaConnectionCache.set(user_id, connection);
    
    return connection;
  } catch (error) {
    console.error('Error getting Strava connection:', error);
    throw error;
  }
}

/**
 * Delete Strava connection (disconnect)
 * Also invalidates the user cache
 */
export async function deleteStravaConnection(user_id: string): Promise<boolean> {
  const query = 'DELETE FROM strava_connections WHERE user_id = $1';

  try {
    const result = await pool.query(query, [user_id]);
    
    // Invalidate cache on deletion
    invalidateUserCache(user_id);
    
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting Strava connection:', error);
    throw error;
  }
}

/**
 * Save running activity from Strava
 */
export async function saveRunningActivity(
  user_id: string,
  activity: any
): Promise<RunningActivity> {
  const query = `
    INSERT INTO running_activities (
      user_id, strava_activity_id, name, distance, moving_time,
      elapsed_time, total_elevation_gain, activity_type,
      start_date, start_date_local, timezone, average_speed,
      max_speed, average_heartrate, max_heartrate, calories,
      map_polyline, raw_data
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    ON CONFLICT (strava_activity_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      distance = EXCLUDED.distance,
      moving_time = EXCLUDED.moving_time,
      elapsed_time = EXCLUDED.elapsed_time,
      total_elevation_gain = EXCLUDED.total_elevation_gain,
      activity_type = EXCLUDED.activity_type,
      average_speed = EXCLUDED.average_speed,
      max_speed = EXCLUDED.max_speed,
      average_heartrate = EXCLUDED.average_heartrate,
      max_heartrate = EXCLUDED.max_heartrate,
      calories = EXCLUDED.calories,
      map_polyline = EXCLUDED.map_polyline,
      raw_data = EXCLUDED.raw_data,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    user_id,
    activity.id,
    activity.name,
    activity.distance,
    activity.moving_time,
    activity.elapsed_time,
    activity.total_elevation_gain,
    activity.type,
    activity.start_date,
    activity.start_date_local,
    activity.timezone,
    activity.average_speed,
    activity.max_speed,
    activity.average_heartrate,
    activity.max_heartrate,
    activity.calories,
    activity.map?.summary_polyline,
    JSON.stringify(activity),
  ];

  try {
    const result = await pool.query<RunningActivity>(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving running activity:', error);
    throw error;
  }
}

/**
 * Get running activities for a user
 */
/**
 * Get running activities for a user with pagination
 */
export async function getRunningActivities(
  user_id: string,
  page: number = 1,
  limit: number = 10
): Promise<{ activities: RunningActivity[], total: number }> {
  const offset = (page - 1) * limit;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM running_activities
    WHERE user_id = $1
  `;

  const dataQuery = `
    SELECT id, user_id, strava_activity_id, name, distance, moving_time, 
           elapsed_time, total_elevation_gain, activity_type, start_date, 
           start_date_local, average_speed, max_speed, calories
    FROM running_activities 
    WHERE user_id = $1 
    ORDER BY start_date DESC 
    LIMIT $2 OFFSET $3
  `;

  try {
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, [user_id]),
      pool.query<RunningActivity>(dataQuery, [user_id, limit, offset])
    ]);
    
    return {
      activities: dataResult.rows,
      total: Number.parseInt(countResult.rows[0].total, 10)
    };
  } catch (error) {
    console.error('Error getting running activities:', error);
    throw error;
  }
}

/**
 * Get running statistics for a user
 * Uses LRU cache with 30-minute TTL for cross-request caching
 */
export async function getRunningStats(user_id: string) {
  // Check cache first
  const cached = userStatsCache.get(user_id);
  if (cached !== undefined) {
    return cached;
  }

  const query = `
    SELECT 
      COUNT(*) as total_runs,
      COALESCE(SUM(distance), 0) as total_distance,
      COALESCE(SUM(moving_time), 0) as total_time,
      COALESCE(AVG(average_speed), 0) as avg_speed,
      COALESCE(SUM(total_elevation_gain), 0) as total_elevation
    FROM running_activities 
    WHERE user_id = $1
  `;

  try {
    const result = await pool.query(query, [user_id]);
    const stats = result.rows[0];
    
    // Cache the result
    userStatsCache.set(user_id, stats);
    
    return stats;
  } catch (error) {
    console.error('Error getting running stats:', error);
    throw error;
  }
}

/**
 * Get running activities using cursor-based pagination (more efficient for large datasets)
 */
export async function getRunningActivitiesCursor(
  user_id: string,
  cursor?: string, // ISO date string of last activity's start_date
  limit: number = 10
): Promise<{ activities: RunningActivity[], nextCursor: string | null }> {
  const dataQuery = cursor 
    ? `
      SELECT id, user_id, strava_activity_id, name, distance, moving_time, 
             elapsed_time, total_elevation_gain, activity_type, start_date, 
             start_date_local, average_speed, max_speed, calories
      FROM running_activities 
      WHERE user_id = $1 AND start_date < $3
      ORDER BY start_date DESC 
      LIMIT $2
    `
    : `
      SELECT id, user_id, strava_activity_id, name, distance, moving_time, 
             elapsed_time, total_elevation_gain, activity_type, start_date, 
             start_date_local, average_speed, max_speed, calories
      FROM running_activities 
      WHERE user_id = $1
      ORDER BY start_date DESC 
      LIMIT $2
    `;

  try {
    const params = cursor ? [user_id, limit + 1, cursor] : [user_id, limit + 1];
    const result = await pool.query<RunningActivity>(dataQuery, params);
    
    const hasMore = result.rows.length > limit;
    const activities = hasMore ? result.rows.slice(0, limit) : result.rows;
    const nextCursor = hasMore && activities.length > 0 
      ? activities.at(-1)?.start_date?.toISOString() || null
      : null;
    
    return { activities, nextCursor };
  } catch (error) {
    console.error('Error getting running activities with cursor:', error);
    throw error;
  }
}

/**
 * Get Strava connection by Strava user ID (for webhooks)
 */
export async function getStravaConnectionByStravaUserId(
  strava_user_id: number
): Promise<StravaConnection | null> {
  const query = 'SELECT * FROM strava_connections WHERE strava_user_id = $1';

  try {
    const result = await pool.query<StravaConnection>(query, [strava_user_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting Strava connection by Strava user ID:', error);
    throw error;
  }
}

/**
 * Refresh Strava access token
 */
export async function refreshStravaToken(
  connection: StravaConnection
): Promise<StravaConnection> {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Strava token');
    }

    const data = await response.json();

    // Update connection with new tokens
    const updatedConnection = await upsertStravaConnection({
      user_id: connection.user_id,
      strava_user_id: connection.strava_user_id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(data.expires_at * 1000),
      athlete_data: connection.athlete_data,
    });

    return updatedConnection;
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    throw error;
  }
}

/**
 * Delete running activity by Strava activity ID
 */
export async function deleteRunningActivity(
  strava_activity_id: number
): Promise<boolean> {
  const query = 'DELETE FROM running_activities WHERE strava_activity_id = $1';

  try {
    const result = await pool.query(query, [strava_activity_id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting running activity:', error);
    throw error;
  }
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(connection: StravaConnection): boolean {
  return new Date(connection.expires_at) <= new Date();
}

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  name: string;
  image: string | null;
  total_distance: number;
  total_runs: number;
};

/**
 * Get leaderboard data
 * Uses LRU cache with 5-minute TTL (more dynamic data)
 */
export async function getLeaderboard(
  period: 'week' | 'month' | 'year' = 'week',
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  // Check cache first
  const cacheKey = getCacheKey('leaderboard', period, limit);
  const cached = leaderboardCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  // Determine date filter based on period
  let dateFilter = '';
  switch (period) {
    case 'week':
      // Start of current week (Monday)
      dateFilter = "DATE_TRUNC('week', NOW())";
      break;
    case 'month':
      // Start of current month
      dateFilter = "DATE_TRUNC('month', NOW())";
      break;
    case 'year':
      // Start of current year
      dateFilter = "DATE_TRUNC('year', NOW())";
      break;
  }

  const query = `
    SELECT 
      u.id as user_id,
      u.name,
      u.image,
      COALESCE(SUM(ra.distance), 0) as total_distance,
      COUNT(ra.id) as total_runs
    FROM users u
    JOIN running_activities ra ON u.id = ra.user_id
    WHERE ra.start_date >= ${dateFilter}
    GROUP BY u.id, u.name, u.image
    ORDER BY total_distance DESC
    LIMIT $1
  `;

  try {
    const result = await pool.query(query, [limit]);
    
    // Add rank/index
    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      user_id: row.user_id,
      name: row.name || 'Anonymous',
      image: row.image,
      total_distance: Number(row.total_distance),
      total_runs: Number(row.total_runs)
    }));
    
    // Cache the result
    const cacheKey = getCacheKey('leaderboard', period, limit);
    leaderboardCache.set(cacheKey, leaderboard);
    
    return leaderboard;
  } catch (error) {
    console.error(`Error getting ${period} leaderboard:`, error);
    return [];
  }
}
