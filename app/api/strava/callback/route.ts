import { NextRequest, NextResponse } from 'next/server';
import { upsertStravaConnection } from '@/lib/db/models/strava';
import { getUserById, getUserByEmail } from '@/lib/db/models/user';

/**
 * Strava OAuth Callback Handler
 * GET /api/strava/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the user_id
    const error = searchParams.get('error');

    if (error) {
      console.error('Strava OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?strava_error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?strava_error=missing_params`
      );
    }

    // State should be in format "user_id:email"
    const [user_id, user_email] = state.split(':');

    // Verify user exists in database - try by ID first, then by email
    console.log('Looking up user with ID:', user_id);
    let user = await getUserById(user_id);
    
    if (!user && user_email) {
      console.log('User not found by ID, trying email:', user_email);
      user = await getUserByEmail(user_email);
    }
    
    if (!user) {
      console.error('User not found with ID:', user_id, 'or email:', user_email);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?strava_error=user_not_found`
      );
    }
    console.log('User found:', user.email);

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Save Strava connection to database using the actual user ID from database
    await upsertStravaConnection({
      user_id: user.id,
      strava_user_id: tokenData.athlete.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000),
      athlete_data: tokenData.athlete,
    });

    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?strava_connected=true`
    );
  } catch (error) {
    console.error('Error in Strava OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?strava_error=connection_failed`
    );
  }
}

