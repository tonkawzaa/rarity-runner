import { NextRequest, NextResponse } from 'next/server';
import { 
  saveRunningActivity, 
  getStravaConnectionByStravaUserId,
  refreshStravaToken,
  deleteRunningActivity,
  isTokenExpired
} from '@/lib/db/models/strava';

/**
 * Strava Webhook Handler
 * 
 * Handles two types of requests:
 * 1. GET - Webhook subscription validation
 * 2. POST - Activity update events
 * 
 * Documentation: https://developers.strava.com/docs/webhooks/
 */

/**
 * GET - Webhook Subscription Validation
 * Strava sends this to verify your webhook endpoint
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook subscription
  const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'RARITY_RUNNER_WEBHOOK';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook validated successfully');
    return NextResponse.json({ 'hub.challenge': challenge });
  } else {
    console.error('Webhook validation failed');
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
}

/**
 * POST - Activity Event Handler
 * Receives notifications when activities are created/updated/deleted
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    console.log('Received Strava webhook event:', event);

    // Event structure:
    // {
    //   object_type: "activity" | "athlete",
    //   object_id: 123456789,
    //   aspect_type: "create" | "update" | "delete",
    //   owner_id: 987654321,
    //   subscription_id: 12345,
    //   event_time: 1516126040
    // }

    // Only process activity events
    if (event.object_type !== 'activity') {
      return NextResponse.json({ message: 'Event ignored - not an activity' });
    }

    // Handle different event types
    switch (event.aspect_type) {
      case 'create':
      case 'update':
        // Fetch full activity details from Strava
        await handleActivityCreateOrUpdate(event);
        break;

      case 'delete':
        // Handle activity deletion
        await handleActivityDelete(event);
        break;

      default:
        console.log('Unknown aspect_type:', event.aspect_type);
    }

    return NextResponse.json({ message: 'Event processed successfully' });

  } catch (error) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Fetch activity details from Strava and save to database
 */
async function handleActivityCreateOrUpdate(event: any) {
  const { object_id: activityId, owner_id: stravaUserId } = event;

  try {
    // Find user by Strava ID
    let connection = await getStravaConnectionByStravaUserId(stravaUserId);

    if (!connection) {
      console.log('No user found for Strava ID:', stravaUserId);
      return;
    }

    // Check if token is expired and refresh if needed
    if (isTokenExpired(connection)) {
      console.log('Access token expired, refreshing...');
      connection = await refreshStravaToken(connection);
    }

    // Fetch activity details from Strava API
    const activity = await fetchStravaActivity(connection.access_token, activityId);

    if (!activity) {
      console.log('Failed to fetch activity:', activityId);
      return;
    }

    // Only save running activities
    const runningTypes = ['Run', 'TrailRun', 'VirtualRun'];
    if (runningTypes.includes(activity.type)) {
      await saveRunningActivity(connection.user_id, activity);
      console.log('Saved running activity:', activityId);
    } else {
      console.log('Skipped non-running activity:', activity.type);
    }

  } catch (error) {
    console.error('Error handling activity create/update:', error);
    throw error;
  }
}

/**
 * Handle activity deletion
 */
async function handleActivityDelete(event: any) {
  const { object_id: activityId } = event;

  try {
    const deleted = await deleteRunningActivity(activityId);
    if (deleted) {
      console.log('Activity deleted successfully:', activityId);
    } else {
      console.log('Activity not found:', activityId);
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
}

/**
 * Fetch activity details from Strava API
 */
async function fetchStravaActivity(accessToken: string, activityId: number) {
  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activity from Strava:', error);
    return null;
  }
}
