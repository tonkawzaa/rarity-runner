import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Strava OAuth - Initiate Authorization
 * GET /api/strava/connect
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clientId = process.env.STRAVA_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/strava/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Strava client ID not configured' },
        { status: 500 }
      );
    }

    // Strava OAuth authorization URL
    const authUrl = new URL('https://www.strava.com/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'read,activity:read_all,activity:write');
    authUrl.searchParams.append('state', session.user.id); // Pass user ID as state

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating Strava OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Strava' },
      { status: 500 }
    );
  }
}
