"use client"

import { memo } from "react"
import Image from "next/image"
import { User } from "@/lib/db/models/user"
import { formatDistanceToNow } from "date-fns"

interface MembersProps {
  users: User[]
}

// Memoized list item component (rerender-memo)
const MemberItem = memo(function MemberItem({ user }: { user: User }) {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={40}
            height={40}
            className="rounded-full border-2 border-white dark:border-gray-800"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* User Info */}
        <div>
          <p className="font-semibold text-sm text-foreground">
            {user.name || 'Anonymous Runner'}
          </p>
        </div>
      </div>

      {/* Join Date */}
      <div className="text-right">
        <p className="text-xs text-foreground/60">
          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
});

export function Members({ users }: MembersProps) {
  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-linear-to-br from-purple-500 to-pink-600">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Members</h3>
            <p className="text-sm text-foreground/60">{users.length} registered runner{users.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {users.length > 0 ? (
          users.map((user) => (
            <MemberItem key={user.id} user={user} />
          ))
        ) : (
          <div className="text-center py-8 text-foreground/50 text-sm">
            No members yet.
          </div>
        )}
      </div>
    </div>
  )
}
