"use client"

import { useState, memo, useCallback } from "react"
import { format } from "date-fns"
import { RunningActivity } from "@/lib/db/models/strava"
import { fetchRecentActivities } from "@/app/actions/strava"

interface RecentActivitiesProps {
  initialActivities: RunningActivity[]
  totalCount: number
  userId: string // Passed for key uniqueness if needed
}

// Memoized activity item component (rerender-memo)
const ActivityItem = memo(function ActivityItem({ activity }: { activity: RunningActivity }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{activity.name}</h4>
          <p className="text-sm text-foreground/60">
            {format(new Date(activity.start_date!), 'PPP p')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-foreground">{(Number(activity.distance) / 1000).toFixed(2)} km</p>
        <p className="text-sm text-foreground/60">
          {Math.floor(Number(activity.moving_time) / 60)}m {(Number(activity.moving_time) % 60)}s
        </p>
      </div>
    </div>
  );
});

export function RecentActivities({ initialActivities, totalCount }: RecentActivitiesProps) {
  const [activities, setActivities] = useState<RunningActivity[]>(initialActivities)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const limit = 5
  
  const totalPages = Math.ceil(totalCount / limit)

  // Use useCallback for stable reference (rerender-functional-setstate)
  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return
    
    setIsLoading(true)
    try {
      const result = await fetchRecentActivities(newPage, limit)
      // Use functional setState for stable reference
      setActivities(() => result.activities)
      setPage(() => newPage)
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      alert("Failed to load activities. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [totalPages, isLoading])

  return (
    <div className="card-premium h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
      </div>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-4 min-h-[250px]">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-foreground/10 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-foreground/60">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            No activities found.
          </p>
        </div>
      )}
    </div>
  )
}
