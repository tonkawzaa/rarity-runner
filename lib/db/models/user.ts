/**
 * User Model
 * Types and database functions for user data
 */

import { pool } from '../db';

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
 * Create or update user in database
 * Uses UPSERT (INSERT ... ON CONFLICT) to handle existing users
 */
export async function upsertUser(userData: UserInput): Promise<User> {
  const { id, email, name, image, email_verified } = userData;

  // First, check if a user with this email exists but different ID
  const existingUserQuery = 'SELECT id FROM users WHERE email = $1 AND id != $2';
  
  try {
    const existingResult = await pool.query(existingUserQuery, [email, id]);
    
    if (existingResult.rows.length > 0) {
      // Email exists with different ID - update that user's ID
      const updateQuery = `
        UPDATE users 
        SET id = $1, name = $2, image = $3, email_verified = $4, last_login = NOW(), updated_at = NOW()
        WHERE email = $5
        RETURNING *;
      `;
      const result = await pool.query<User>(updateQuery, [id, name || null, image || null, email_verified || false, email]);
      return result.rows[0];
    }
    
    // Normal UPSERT on ID
    const query = `
      INSERT INTO users (id, email, name, image, email_verified, last_login)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        email_verified = EXCLUDED.email_verified,
        last_login = NOW(),
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [id, email, name || null, image || null, email_verified || false];
    const result = await pool.query<User>(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}


/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE id = $1';
  
  try {
    const result = await pool.query<User>(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE email = $1';
  
  try {
    const result = await pool.query<User>(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

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
