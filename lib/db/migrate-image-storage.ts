/**
 * Migration: Separate profile image data from users table
 *
 * Adds profile_image_data column and moves existing base64 blobs out of the
 * image column so bulk queries (leaderboard, members list) don't carry image
 * payloads. The image column is updated to a URL path that is served by
 * /api/profile/image/[userId].
 *
 * Run once:
 *   npx tsx lib/db/migrate-image-storage.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const { pool } = await import('./db');

  try {
    console.log('Adding profile_image_data column...');
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_image_data TEXT;
    `);

    console.log('Migrating existing base64 images...');
    const { rowCount } = await pool.query(`
      UPDATE users
      SET
        profile_image_data = image,
        image = '/api/profile/image/' || id
      WHERE image LIKE 'data:%';
    `);
    console.log(`Migrated ${rowCount ?? 0} user(s) with custom profile images.`);

    console.log('Migration complete.');
    await pool.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
