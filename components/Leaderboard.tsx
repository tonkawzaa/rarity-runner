"use client"

import { useState, memo } from "react"
import Image from "next/image"
import { LeaderboardEntry } from "@/lib/db/models/strava"

interface LeaderboardProps {
  readonly data: {
    month: LeaderboardEntry[];
    year: LeaderboardEntry[];
  }
}

type Period = 'month' | 'year'

// Hoisted outside component for stable reference (rendering-hoist-jsx)
const LEADERBOARD_TABS: { id: Period; label: string }[] = [
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

// Memoized list item component (rerender-memo)
const LeaderboardItem = memo(function LeaderboardItem({ 
  entry, 
  index 
}: { 
  entry: LeaderboardEntry; 
  index: number 
}) {
  return (
    <div 
      className={`
        flex items-center justify-between p-3 rounded-xl transition-colors
        ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20' : 'bg-foreground/5 hover:bg-foreground/10'}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`
          w-8 h-8 flex items-center justify-center rounded-full font-bold
          ${index === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' : 
            index === 1 ? 'bg-gray-400 text-white' :
            index === 2 ? 'bg-amber-700 text-white' : 'bg-foreground/10 text-foreground/60'}
        `}>
          {entry.rank}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          {entry.image ? (
            <Image
              src={entry.image}
              alt={entry.name}
              width={32}
              height={32}
              className="rounded-full border-2 border-white dark:border-gray-800"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
              {entry.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-foreground">
              {entry.name}
              {index === 0 && <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">👑 Leader</span>}
            </p>
            <p className="text-xs text-foreground/50">{entry.total_runs} runs</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="font-bold text-foreground">
          {(entry.total_distance / 1000).toFixed(1)} <span className="text-xs font-normal text-foreground/60">km</span>
        </p>
      </div>
    </div>
  );
});

export function Leaderboard({ data }: Readonly<LeaderboardProps>) {
  const [activePeriod, setActivePeriod] = useState<Period>('month')
  
  const activeData = data[activePeriod]

  return (
    <div className="card-premium">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground">Leaderboard</h3>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-foreground/5 rounded-xl">
          {LEADERBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePeriod(tab.id)}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activePeriod === tab.id 
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' 
                  : 'text-foreground/60 hover:text-foreground'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {activeData.length > 0 ? (
          activeData.map((entry, index) => (
            <LeaderboardItem key={entry.user_id} entry={entry} index={index} />
          ))
        ) : (
          <div className="text-center py-8 text-foreground/50 text-sm">
            No runs recorded for this period yet.
          </div>
        )}
      </div>
    </div>
  )
}
