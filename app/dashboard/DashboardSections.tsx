/**
 * Dashboard Async Server Components
 * Each section fetches its own data independently for Suspense streaming
 */

import {
  getStravaConnectionByUserId,
  getRunningStats,
  getRunningActivities,
  getLeaderboard,
  type LeaderboardEntry,
} from "@/lib/db/models/strava"
import { getUserByEmail, getAllUsers } from "@/lib/db/models/user"
import { DisconnectButton } from "@/components/DisconnectButton"
import { Leaderboard } from "@/components/Leaderboard"
import { RecentActivities } from "@/components/RecentActivities"
import { Members } from "@/components/Members"
import { PodiumCard } from "@/components/PodiumCard"
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection"

// Helper: Format pace from speed (m/s) to min/km string
function formatPace(avgSpeed: number): string {
  if (avgSpeed <= 0) return "--";
  const paceDecimal = (1000 / avgSpeed) / 60;
  const paceMin = Math.floor(paceDecimal);
  const paceSec = Math.round((paceDecimal - paceMin) * 60);
  return `${paceMin}'${paceSec.toString().padStart(2, '0')}"`;
}

// Helper: Resolve user ID, database user, and Strava connection
async function resolveUserAndStravaConnection(session: { user?: { id?: string; email?: string | null } }) {
  let userId = session.user?.id;
  let dbUser = null;
  let stravaConnection = userId ? await getStravaConnectionByUserId(userId) : null;

  if (session.user?.email) {
    dbUser = await getUserByEmail(session.user.email);
    if (dbUser) {
      userId = dbUser.id;
      if (!stravaConnection) {
        stravaConnection = await getStravaConnectionByUserId(dbUser.id);
      }
    }
  }

  return { userId, dbUser, stravaConnection };
}

/**
 * Stats + Strava Connection + Recent Activities Section
 * Depends on user session for data fetching
 */
export async function StatsAndActivitiesSection({ 
  session 
}: { 
  session: { user?: { id?: string; email?: string | null; name?: string | null; image?: string | null } } 
}) {
  const { userId, stravaConnection } = await resolveUserAndStravaConnection(session);

  // Fetch stats and activities in parallel if connected
  let stats = { total_distance: 0, total_time: 0, avg_speed: 0, total_runs: 0 };
  let activitiesObj: { activities: any[]; total: number } = { activities: [], total: 0 };
  let formattedPace = "--";

  if (stravaConnection && userId) {
    const [fetchedStats, fetchedActivities] = await Promise.all([
      getRunningStats(userId),
      getRunningActivities(userId, 1, 10),
    ]);

    stats = fetchedStats ? {
      total_distance: Number(fetchedStats.total_distance) || 0,
      total_time: Number(fetchedStats.total_time) || 0,
      avg_speed: Number(fetchedStats.avg_speed) || 0,
      total_runs: Number(fetchedStats.total_runs) || 0,
    } : stats;

    activitiesObj = fetchedActivities || activitiesObj;
    formattedPace = formatPace(stats.avg_speed);
  }

  const totalDistanceKm = (stats.total_distance / 1000).toFixed(1);
  const totalTimeHrs = (stats.total_time / 3600).toFixed(1);

  return (
    <>
      {/* Strava Connection Section */}
      <AnimatedSection className="card-premium mb-8" delay={0.1}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {stravaConnection ? 'Strava Connected' : 'Connect to Strava'}
              </h3>
              {stravaConnection ? (
                <p className="text-sm text-foreground/60">
                  Connected as {stravaConnection.athlete_data?.firstname} {stravaConnection.athlete_data?.lastname}
                </p>
              ) : (
                <p className="text-sm text-foreground/60">
                  Sync your running activities automatically
                </p>
              )}
            </div>
          </div>
          
          {stravaConnection ? (
            <DisconnectButton className="px-6 py-3 rounded-xl text-sm font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all duration-200 hover:scale-105" />
          ) : (
            <a
              href="/api/strava/connect"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-200 hover:scale-105 inline-block"
            >
              Connect Strava
            </a>
          )}
        </div>
      </AnimatedSection>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Distance */}
        <StaggerItem className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Total Distance</h3>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {totalDistanceKm} km
          </p>
          <p className="text-sm text-foreground/50">
            {stats.total_runs} runs tracked
          </p>
        </StaggerItem>

        {/* Total Time */}
        <StaggerItem className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Total Time</h3>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {totalTimeHrs} hrs
          </p>
          <p className="text-sm text-foreground/50">Moving time</p>
        </StaggerItem>

        {/* Average Pace */}
        <StaggerItem className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Average Pace</h3>
            <div className="p-2 rounded-lg bg-green-500/10">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formattedPace} <span className="text-lg text-foreground/60 font-medium">/km</span>
          </p>
          <p className="text-sm text-foreground/50">All activities</p>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Activities (placed here since it needs userId) */}
      {activitiesObj.total > 0 ? (
        <RecentActivities
          initialActivities={activitiesObj.activities}
          totalCount={activitiesObj.total}
          userId={userId || ''}
        />
      ) : (
        <div className="card-premium h-fit">
          <h3 className="text-xl font-bold mb-6 text-foreground">Recent Activity</h3>
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 mb-4">
              <svg className="w-16 h-16 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-foreground">No runs recorded yet</h4>
            <p className="text-foreground/60 mb-6 max-w-md mx-auto">
              {stravaConnection
                ? "Your Strava activities will appear here automatically!"
                : "Connect your Strava account to start tracking your runs!"}
            </p>
            {!stravaConnection && (
              <a href="/api/strava/connect" className="btn-primary inline-block">
                Connect Strava Now
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Leaderboard + Podium Section
 * Fetches leaderboard data independently
 */
export async function LeaderboardSection() {
  const [leaderboardMonth, leaderboardLastMonth, leaderboardYear] = await Promise.all([
    getLeaderboard('month', 10),
    getLeaderboard('last_month', 10),
    getLeaderboard('year', 10),
  ]);

  return (
    <>
      {/* Podium Top 3 Runners */}
      <AnimatedSection className="mb-8" delay={0.2}>
        <PodiumCard
          thisMonth={
            leaderboardMonth.slice(0, 3).map((item: LeaderboardEntry, index: number) => ({
              position: (index + 1) as 1 | 2 | 3,
              username: item.name?.split(' ')[0] || 'Runner',
              image: item.image,
              totalDistance: `${(item.total_distance / 1000).toFixed(1)} km`,
            }))
          }
          lastMonth={
            leaderboardLastMonth.slice(0, 3).map((item: LeaderboardEntry, index: number) => ({
              position: (index + 1) as 1 | 2 | 3,
              username: item.name?.split(' ')[0] || 'Runner',
              image: item.image,
              totalDistance: `${(item.total_distance / 1000).toFixed(1)} km`,
            }))
          }
        />
      </AnimatedSection>

      {/* Leaderboard */}
      <Leaderboard
        data={{
          month: leaderboardMonth,
          year: leaderboardYear,
        }}
      />
    </>
  );
}

/**
 * Members Section
 * Fetches all users independently
 */
export async function MembersSection() {
  const allUsers = await getAllUsers();

  return (
    <AnimatedSection className="mt-8" delay={0.3}>
      <Members users={allUsers} />
    </AnimatedSection>
  );
}
