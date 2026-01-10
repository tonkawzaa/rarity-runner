import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { deleteStravaConnection } from '@/lib/db/models/strava';
import { getUserByEmail } from '@/lib/db/models/user';

/**
 * Disconnect Strava Account
 * POST /api/strava/disconnect
 */
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId = session.user.id;
    console.log('[Disconnect] Attempting to disconnect for Session User ID:', userId);

    // Robust user lookup: Try to ensure we have the correct database User ID
    // Sometimes session ID might differ from DB ID if they got out of sync
    const userByEmail = session.user.email ? await getUserByEmail(session.user.email) : null;
    
    if (userByEmail && userByEmail.id !== userId) {
      console.log('[Disconnect] User ID mismatch. Session:', userId, 'DB:', userByEmail.id);
      console.log('[Disconnect] Using DB User ID for consistency.');
      userId = userByEmail.id;
    }

    // Delete Strava connection from database
    const deleted = await deleteStravaConnection(userId);
    
    console.log('[Disconnect] Connection deleted:', deleted);

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Error disconnecting Strava:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Strava' },
      { status: 500 }
    );
  }
}
