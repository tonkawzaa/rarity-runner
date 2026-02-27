/**
 * Dashboard Suspense Skeleton Components
 * Lightweight fallbacks for each Suspense boundary
 */

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse"></div>
            <div className="w-9 h-9 rounded-lg bg-foreground/10 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-foreground/15 rounded-md mb-2 animate-pulse"></div>
          <div className="h-4 w-20 bg-foreground/10 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <>
      {/* Podium Skeleton */}
      <div className="mb-8 card-premium">
        <div className="flex justify-center items-end gap-4 h-48 pb-4">
          <div className="w-20 bg-foreground/10 rounded-t-xl h-24 animate-pulse"></div>
          <div className="w-20 bg-foreground/15 rounded-t-xl h-32 animate-pulse"></div>
          <div className="w-20 bg-foreground/10 rounded-t-xl h-20 animate-pulse"></div>
        </div>
      </div>

      {/* Leaderboard + Activities Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard Skeleton */}
        <div className="card-premium h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/15 animate-pulse"></div>
              <div className="h-6 w-32 bg-foreground/15 rounded-md animate-pulse"></div>
            </div>
            <div className="w-32 h-8 bg-foreground/10 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-foreground/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-foreground/15 animate-pulse"></div>
                  <div className="w-8 h-8 rounded-full bg-foreground/15 animate-pulse"></div>
                  <div className="h-4 w-24 bg-foreground/15 rounded-sm animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-foreground/10 rounded-sm animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="card-premium h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/15 animate-pulse"></div>
              <div className="h-6 w-32 bg-foreground/15 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-foreground/5 border border-foreground/10">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 w-40 bg-foreground/15 rounded-md animate-pulse"></div>
                  <div className="h-4 w-20 bg-foreground/10 rounded-sm animate-pulse"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j}>
                      <div className="h-3 w-12 bg-foreground/10 rounded-sm mb-1 animate-pulse"></div>
                      <div className="h-5 w-16 bg-foreground/15 rounded-sm animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function RecentActivitiesSkeleton() {
  return (
    <div className="card-premium h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground/15 animate-pulse"></div>
          <div className="h-6 w-32 bg-foreground/15 rounded-md animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-foreground/5 border border-foreground/10">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 w-40 bg-foreground/15 rounded-md animate-pulse"></div>
              <div className="h-4 w-20 bg-foreground/10 rounded-sm animate-pulse"></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <div className="h-3 w-12 bg-foreground/10 rounded-sm mb-1 animate-pulse"></div>
                  <div className="h-5 w-16 bg-foreground/15 rounded-sm animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MembersSkeleton() {
  return (
    <div className="mt-8">
      <div className="card-premium">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/15 animate-pulse"></div>
            <div>
              <div className="h-6 w-24 bg-foreground/15 rounded-md mb-1 animate-pulse"></div>
              <div className="h-3 w-32 bg-foreground/10 rounded-sm animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-foreground/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground/15 animate-pulse"></div>
                <div>
                  <div className="h-4 w-32 bg-foreground/15 rounded-sm mb-1 animate-pulse"></div>
                  <div className="h-3 w-40 bg-foreground/10 rounded-sm animate-pulse"></div>
                </div>
              </div>
              <div className="h-3 w-20 bg-foreground/10 rounded-sm animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
