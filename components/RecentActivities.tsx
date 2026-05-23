"use client"

import { useState, memo, useCallback } from "react"
import { format } from "date-fns"
import { RunningActivity } from "@/lib/db/models/strava"
import { fetchRecentActivities } from "@/app/actions/strava"

interface RecentActivitiesProps {
  initialActivities: RunningActivity[]
  initialNextCursor: string | null
}

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

export function RecentActivities({ initialActivities, initialNextCursor }: Readonly<RecentActivitiesProps>) {
  const [activities, setActivities] = useState<RunningActivity[]>(initialActivities)
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]) // stack of "previous page" cursors
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasPrev = cursorStack.length > 1
  const hasNext = nextCursor !== null

  const navigate = useCallback(async (cursor: string | null, pushToStack: boolean) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const result = await fetchRecentActivities(cursor)
      setActivities(result.activities)
      setNextCursor(result.nextCursor)
      setError(null)
      if (pushToStack) {
        setCursorStack((s) => [...s, cursor])
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err)
      setError("Failed to load activities. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const handleNext = useCallback(() => {
    if (nextCursor) navigate(nextCursor, true)
  }, [nextCursor, navigate])

  const handlePrev = useCallback(() => {
    if (cursorStack.length < 2) return
    const newStack = cursorStack.slice(0, -1)
    const prevCursor = newStack[newStack.length - 1]
    setCursorStack(newStack)
    navigate(prevCursor, false)
  }, [cursorStack, navigate])

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

          {error && (
            <p className="text-sm text-red-600 text-center py-2">{error}</p>
          )}

          {(hasPrev || hasNext) && (
            <div className="flex items-center justify-between pt-4 border-t border-foreground/10 mt-6">
              <button
                onClick={handlePrev}
                disabled={!hasPrev || isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext || isLoading}
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
