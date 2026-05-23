"use server"

import { auth } from "@/auth"
import { getRunningActivitiesCursor } from "@/lib/db/models/strava"
import { getUserByEmail } from "@/lib/db/models/user"

export async function fetchRecentActivities(cursor: string | null, limit: number = 5) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  let userId = session.user.id;
  if (session.user.email) {
    const dbUser = await getUserByEmail(session.user.email);
    if (dbUser) userId = dbUser.id;
  }

  if (!userId) throw new Error("Unauthorized")

  return await getRunningActivitiesCursor(userId, cursor ?? undefined, limit);
}
