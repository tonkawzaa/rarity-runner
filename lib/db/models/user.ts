/**
 * User Model
 * Types and database functions for user data
 */

import { cache } from 'react';
import { pool } from '../db';

const USER_COLUMNS = 'id, email, name, image, email_verified, created_at, updated_at, last_login';

/**
 * User interface matching database schema
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login: Date;
}

/**
 * Input type for creating/updating user
 */
export interface UserInput {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  email_verified?: boolean;
}

/**
 * Create or update user in database.
 * Single atomic statement: conflicts on email (the stable unique key for Google OAuth).
 * ID is updated on conflict to handle Google account ID rotation.
 * Custom uploaded images are preserved on re-login.
 */
export async function upsertUser(userData: UserInput): Promise<User> {
  const { id, email, name, image, email_verified } = userData;

  const query = `
    INSERT INTO users (id, email, name, image, email_verified, last_login)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (email)
    DO UPDATE SET
      id            = EXCLUDED.id,
      name          = EXCLUDED.name,
      image         = CASE
                        WHEN users.profile_image_data IS NOT NULL THEN users.image
                        ELSE EXCLUDED.image
                      END,
      email_verified = EXCLUDED.email_verified,
      last_login    = NOW(),
      updated_at    = NOW()
    RETURNING ${USER_COLUMNS};
  `;

  try {
    const result = await pool.query<User>(query, [id, email, name ?? null, image ?? null, email_verified ?? false]);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}


/**
 * Get user by ID — memoized per request to avoid repeated DB hits
 */
export const getUserById = cache(async function getUserById(id: string): Promise<User | null> {
  const query = `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`;
  try {
    const result = await pool.query<User>(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
});

/**
 * Get user by email — memoized per request to avoid repeated DB hits
 */
export const getUserByEmail = cache(async function getUserByEmail(email: string): Promise<User | null> {
  const query = `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`;
  try {
    const result = await pool.query<User>(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
});

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(id: string): Promise<void> {
  const query = `
    UPDATE users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE id = $1;
  `;
  
  try {
    await pool.query(query, [id]);
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<boolean> {
  const query = 'DELETE FROM users WHERE id = $1';
  
  try {
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Get all registered users
 * @param limit Optional limit for number of users to return
 * @returns Array of users ordered by creation date (newest first)
 */
export async function getAllUsers(limit?: number): Promise<User[]> {
  let query = `SELECT ${USER_COLUMNS} FROM users ORDER BY created_at DESC`;
  const values: any[] = [];
  
  if (limit) {
    query += ' LIMIT $1';
    values.push(limit);
  }
  
  try {
    const result = await pool.query<User>(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Update user's profile image — stores the URL path in image and base64 data separately
 */
export async function updateUserImage(
  userId: string,
  imageUrl: string,
  profileImageData: string
): Promise<User | null> {
  const query = `
    UPDATE users
    SET image = $1, profile_image_data = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING ${USER_COLUMNS};
  `;
  try {
    const result = await pool.query<User>(query, [imageUrl, profileImageData, userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user image:', error);
    throw error;
  }
}

/**
 * Fetch raw base64 image data for serving via /api/profile/image/[userId]
 */
export async function getUserProfileImageData(userId: string): Promise<string | null> {
  try {
    const result = await pool.query(
      'SELECT profile_image_data FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.profile_image_data ?? null;
  } catch (error) {
    console.error('Error getting profile image data:', error);
    throw error;
  }
}
