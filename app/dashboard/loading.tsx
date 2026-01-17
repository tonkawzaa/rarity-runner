export default function DashboardLoading() {
  return (
    <div className="min-h-screen w-full liquid-glass-bg">
      {/* Header Skeleton */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 animate-pulse"></div>
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
                <div className="hidden sm:block text-right">
                  <div className="h-4 w-24 bg-white/20 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-32 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-20 h-9 bg-white/20 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section Skeleton */}
        <div className="glass-card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-64 bg-white/20 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 w-48 bg-white/10 rounded-sm animate-pulse"></div>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Strava Connection Skeleton */}
        <div className="glass-card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 animate-pulse"></div>
              <div>
                <div className="h-6 w-40 bg-white/20 rounded-md mb-2 animate-pulse"></div>
                <div className="h-4 w-56 bg-white/10 rounded-sm animate-pulse"></div>
              </div>
            </div>
            <div className="w-32 h-10 bg-white/20 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                <div className="w-9 h-9 rounded-lg bg-white/10 animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-white/20 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Podium Skeleton */}
         <div className="mb-8 glass-card">
           <div className="flex justify-center items-end gap-4 h-48 pb-4">
               <div className="w-20 bg-white/10 rounded-t-xl h-24 animate-pulse"></div>
               <div className="w-20 bg-white/20 rounded-t-xl h-32 animate-pulse"></div>
               <div className="w-20 bg-white/10 rounded-t-xl h-20 animate-pulse"></div>
           </div>
         </div>

        {/* Leaderboard and Recent Activity Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard Skeleton */}
          <div className="glass-card h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 animate-pulse"></div>
                <div className="h-6 w-32 bg-white/20 rounded-md animate-pulse"></div>
              </div>
              <div className="w-32 h-8 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white/20 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
                    <div className="h-4 w-24 bg-white/20 rounded-sm animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-white/10 rounded-sm animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="glass-card h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 animate-pulse"></div>
                <div className="h-6 w-32 bg-white/20 rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-5 w-40 bg-white/20 rounded-md animate-pulse"></div>
                    <div className="h-4 w-20 bg-white/10 rounded-sm animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j}>
                        <div className="h-3 w-12 bg-white/10 rounded-sm mb-1 animate-pulse"></div>
                        <div className="h-5 w-16 bg-white/20 rounded-sm animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Members Skeleton */}
        <div className="mt-8">
           <div className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 animate-pulse"></div>
                   <div>
                    <div className="h-6 w-24 bg-white/20 rounded-md mb-1 animate-pulse"></div>
                    <div className="h-3 w-32 bg-white/10 rounded-sm animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
                      <div>
                        <div className="h-4 w-32 bg-white/20 rounded-sm mb-1 animate-pulse"></div>
                        <div className="h-3 w-40 bg-white/10 rounded-sm animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-3 w-20 bg-white/10 rounded-sm animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
        </div>

      </main>
    </div>
  )
}
