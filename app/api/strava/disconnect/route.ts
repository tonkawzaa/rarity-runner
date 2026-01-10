import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { deleteStravaConnection } from '@/lib/db/models/strava';

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

    // Delete Strava connection from database
    await deleteStravaConnection(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Strava:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Strava' },
      { status: 500 }
    );
  }
}
