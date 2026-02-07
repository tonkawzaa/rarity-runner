import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  getStravaConnectionByUserId, 
  getRunningStats,
  getRunningActivities 
} from "@/lib/db/models/strava"
import { getUserByEmail } from "@/lib/db/models/user"
import { DisconnectButton } from "@/components/DisconnectButton"
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection"
import { ProfileImageUpload } from "@/components/ProfileImageUpload"

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

  // If not found by ID, try by email (handle NextAuth ID inconsistencies)
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

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  // Resolve user and Strava connection
  const { userId, dbUser, stravaConnection } = await resolveUserAndStravaConnection(session);

  // Get profile image - prefer custom uploaded image from DB over session image
  const profileImage = dbUser?.image || session.user?.image || null;

  // Fetch stats if connected
  const stats = stravaConnection && userId ? await getRunningStats(userId) : null;
  const activitiesResult = stravaConnection && userId ? await getRunningActivities(userId, 1, 5) : null;

  const formattedStats = stats ? {
    total_distance: Number(stats.total_distance) || 0,
    total_time: Number(stats.total_time) || 0,
    avg_speed: Number(stats.avg_speed) || 0,
    total_runs: Number(stats.total_runs) || 0
  } : null;

  // Unit Conversions
  const totalDistanceKm = formattedStats ? (formattedStats.total_distance / 1000).toFixed(1) : "0";
  const totalTimeHrs = formattedStats ? (formattedStats.total_time / 3600).toFixed(1) : "0";
  const formattedPace = formattedStats ? formatPace(formattedStats.avg_speed) : "--";

  return (
    <div className="min-h-screen w-full liquid-glass-bg">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-foreground/60 font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <AnimatedSection className="card-premium mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture with Upload */}
            <div className="relative">
              <ProfileImageUpload
                currentImage={profileImage}
                userName={session.user?.name || "User"}
              />
              {/* Status Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-lg">
                Active Runner
              </div>
            </div>
            
            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {session.user?.name}
              </h1>
              <p className="text-foreground/60 mb-4">
                {session.user?.email}
              </p>
              
              {/* Connection Status */}
              {stravaConnection ? (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    <span className="text-sm font-medium">
                      {stravaConnection.athlete_data?.firstname} {stravaConnection.athlete_data?.lastname}
                    </span>
                  </div>
                  <DisconnectButton className="px-4 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors" />
                </div>
              ) : (
                <a
                  href="/api/strava/connect"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                  Connect Strava
                </a>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Stats Overview */}
        {formattedStats && (
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StaggerItem className="card-premium text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {totalDistanceKm}
              </div>
              <div className="text-xs text-foreground/60 uppercase tracking-wide mt-1">KM</div>
            </StaggerItem>
            
            <StaggerItem className="card-premium text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {totalTimeHrs}
              </div>
              <div className="text-xs text-foreground/60 uppercase tracking-wide mt-1">Hours</div>
            </StaggerItem>
            
            <StaggerItem className="card-premium text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formattedPace}
              </div>
              <div className="text-xs text-foreground/60 uppercase tracking-wide mt-1">Avg Pace</div>
            </StaggerItem>
            
            <StaggerItem className="card-premium text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {formattedStats.total_runs}
              </div>
              <div className="text-xs text-foreground/60 uppercase tracking-wide mt-1">Runs</div>
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* Recent Activities */}
        <AnimatedSection className="card-premium" delay={0.2}>
          <h2 className="text-xl font-bold mb-6 text-foreground">Recent Activities</h2>
          
          {activitiesResult && activitiesResult.activities.length > 0 ? (
            <div className="space-y-4">
              {activitiesResult.activities.slice(0, 5).map((activity: any, index: number) => (
                <div 
                  key={activity.activity_id || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{activity.name || "Run"}</p>
                      <p className="text-sm text-foreground/60">
                        {new Date(activity.start_date).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {(activity.distance / 1000).toFixed(2)} km
                    </p>
                    <p className="text-sm text-foreground/60">
                      {Math.floor(activity.moving_time / 60)} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-6 rounded-2xl bg-linear-to-br from-primary-500/10 to-accent-500/10 mb-4">
                <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-foreground/60">
                {stravaConnection 
                  ? "No activities yet. Start running to see your activities here!"
                  : "Connect Strava to see your activities"}
              </p>
            </div>
          )}
        </AnimatedSection>
      </main>
    </div>
  )
}
