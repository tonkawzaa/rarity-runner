import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function Dashboard() {
  const session = await auth()
  
  // Redirect to home if not authenticated
  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-foreground/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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
            <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">0 km</p>
            <p className="text-sm text-foreground/50">No runs yet</p>
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
            <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0 hrs</p>
            <p className="text-sm text-foreground/50">No runs yet</p>
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
            <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">-- min/km</p>
            <p className="text-sm text-foreground/50">No runs yet</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-premium">
          <h3 className="text-xl font-bold mb-6 text-foreground">Recent Activity</h3>
          
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 mb-4">
              <svg className="w-16 h-16 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-foreground">No runs recorded yet</h4>
            <p className="text-foreground/60 mb-6 max-w-md mx-auto">
              Start tracking your runs to see your progress and statistics here. Your running journey begins now!
            </p>
            <button className="btn-primary">
              Log Your First Run
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
