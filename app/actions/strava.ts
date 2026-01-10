"use server"

import { auth } from "@/auth"
import { getRunningActivities } from "@/lib/db/models/strava"

export async function fetchRecentActivities(page: number, limit: number = 10) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  // Note: ideally we should double check the DB user ID here like in the dashboard defaults
  // but for pagination of existing view, session ID is usually sufficient if they are connected.
  // Using session ID for simplicity in pagination action.
  return await getRunningActivities(session.user.id, page, limit);
}
