import { Suspense } from "react"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getUserByEmail } from "@/lib/db/models/user"
import { AnimatedSection } from "@/components/AnimatedSection"
import { StatsAndActivitiesSection, LeaderboardSection, MembersSection } from "./DashboardSections"
import { StatsSkeleton, LeaderboardSkeleton, MembersSkeleton } from "./DashboardSkeletons"

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  // Get profile image from DB (lightweight query, needed for header)
  const dbUser = session.user?.email ? await getUserByEmail(session.user.email) : null;
  const profileImage = dbUser?.image || session.user?.image || null;

  return (
    <div className="min-h-screen w-full liquid-glass-bg">
      {/* Header — renders immediately, no heavy data needed */}
      <header className="glass-nav sticky top-0 z-50">
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
                {profileImage && (
                  <Link href="/profile" className="block hover:scale-105 transition-transform cursor-pointer">
                    <Image
                      src={profileImage}
                      alt={session.user?.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-primary-400 hover:border-primary-500 transition-colors"
                    />
                  </Link>
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
        {/* Welcome Section — renders immediately */}
        <AnimatedSection className="card-premium mb-8">
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
        </AnimatedSection>

        {/* Stats + Strava Connection + Activities — streams when user data resolves */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsAndActivitiesSection session={session} />
        </Suspense>

        {/* Leaderboard + Podium — streams independently */}
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardSection />
        </Suspense>

        {/* Members — streams independently */}
        <Suspense fallback={<MembersSkeleton />}>
          <MembersSection />
        </Suspense>
      </main>
    </div>
  )
}
