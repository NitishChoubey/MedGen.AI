"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user) {
      // Redirect to role-specific dashboard
      const role = session.user.role
      if (role === "DOCTOR") {
        router.push("/doctor/dashboard")
      } else if (role === "PATIENT") {
        router.push("/patient/dashboard")
      } else {
        // Fallback for any other roles
        router.push("/dashboard/home")
      }
    }
  }, [status, session, router])

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
