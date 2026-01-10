"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DisconnectButtonProps {
  className?: string
}

export function DisconnectButton({ className }: DisconnectButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Strava?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/strava/disconnect", {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to disconnect Strava")
      }
    } catch (error) {
      console.error("Error disconnecting:", error)
      alert("Failed to disconnect Strava")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Disconnecting..." : "Disconnect"}
    </button>
  )
}
