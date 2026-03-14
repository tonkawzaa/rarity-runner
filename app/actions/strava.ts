"use server"

import { auth } from "@/auth"
import { getRunningActivities } from "@/lib/db/models/strava"
import { getUserByEmail } from "@/lib/db/models/user"

export async function fetchRecentActivities(page: number, limit: number = 10) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  // Resolve user ID through DB lookup (same as dashboard)
  let userId = session.user.id;
  if (session.user.email) {
    const dbUser = await getUserByEmail(session.user.email);
    if (dbUser) {
      userId = dbUser.id;
    }
  }

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return await getRunningActivities(userId, page, limit);
}
