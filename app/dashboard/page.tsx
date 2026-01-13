import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { 
  getStravaConnectionByUserId, 
  getRunningStats, 
  getRunningActivities,
  getLeaderboard 
} from "@/lib/db/models/strava"
import { getUserByEmail, getAllUsers } from "@/lib/db/models/user"
import { DisconnectButton } from "@/components/DisconnectButton"
import { Leaderboard } from "@/components/Leaderboard"
import { RecentActivities } from "@/components/RecentActivities"
import { Members } from "@/components/Members"

export default async function Dashboard() {
  const session = await auth()
  
  // Redirect to home if not authenticated
  if (!session) {
    redirect("/")
  }

  // Check if Strava is connected - try by user ID first, then by email
  let stravaConnection = null;
  let userId = session.user?.id;

  if (userId) {
    stravaConnection = await getStravaConnectionByUserId(userId);
  }
  
  // If not found by ID, try by email (handle NextAuth ID inconsistencies)
  if (!stravaConnection && session.user?.email) {
    const user = await getUserByEmail(session.user.email);
    if (user) {
      userId = user.id; // Update to the correct DB user ID
      stravaConnection = await getStravaConnectionByUserId(user.id);
    }
  }

  // Fetch stats and activities if connected
  let stats = {
    total_distance: 0,
    total_time: 0,
    avg_speed: 0,
    total_runs: 0
  };
  let activitiesObj = { activities: [], total: 0 };
  let formattedPace = "--";

  if (stravaConnection && userId) {
    const [fetchedStats, fetchedActivities] = await Promise.all([
      getRunningStats(userId),
      // Fetch page 1, 10 items
      getRunningActivities(userId, 1, 10) 
    ]);
    
    if (fetchedStats) {
      stats = {
        total_distance: Number(fetchedStats.total_distance) || 0,
        total_time: Number(fetchedStats.total_time) || 0,
        avg_speed: Number(fetchedStats.avg_speed) || 0,
        total_runs: Number(fetchedStats.total_runs) || 0
      };

      // Calculate Pace (min/km) from Speed (m/s)
      if (stats.avg_speed > 0) {
        const paceDecimal = (1000 / stats.avg_speed) / 60;
        const paceMin = Math.floor(paceDecimal);
        const paceSec = Math.round((paceDecimal - paceMin) * 60);
        formattedPace = `${paceMin}'${paceSec.toString().padStart(2, '0')}"`;
      }
    }

    if (fetchedActivities) {
      activitiesObj = fetchedActivities as any;
    }
  }

  // Fetch Leaderboard Data and All Users (Parallel Fetching)
  const [leaderboardWeek, leaderboardMonth, leaderboardYear, allUsers] = await Promise.all([
    getLeaderboard('week', 10),
    getLeaderboard('month', 10),
    getLeaderboard('year', 10),
    getAllUsers(),
  ]);

  // Unit Conversions
  const totalDistanceKm = (stats.total_distance / 1000).toFixed(1);
  const totalTimeHrs = (stats.total_time / 3600).toFixed(1);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-foreground/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 h-10 w-10 flex items-center justify-center overflow-hidden">
                <img src="/rarity-pony-cartoon.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Rarity Runner
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-primary-400"
                  />
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-foreground">{session.user?.name}</p>
                  <p className="text-xs text-foreground/60">{session.user?.email}</p>
                </div>
              </div>
              
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="card-premium mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">
                Welcome back, {session.user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-foreground/60">
                Ready to track your running progress?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl animate-float">🏃‍♂️</div>
            </div>
          </div>
        </div>

        {/* Strava Connection Section */}
        <div className="card-premium mb-8">
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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Distance */}
          <div className="card-premium">
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
          </div>

          {/* Total Time */}
          <div className="card-premium">
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
          </div>

          {/* Average Pace */}
          <div className="card-premium">
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
          </div>
        </div>

        {/* Leaderboard and Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <Leaderboard 
            data={{
              week: leaderboardWeek,
              month: leaderboardMonth,
              year: leaderboardYear
            }}
          />

          {/* Recent Activity */}
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
                  <a
                    href="/api/strava/connect"
                    className="btn-primary inline-block"
                  >
                    Connect Strava Now
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="mt-8">
          <Members users={allUsers} />
        </div>
      </main>
    </div>
  )
}
