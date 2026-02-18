"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardShell } from "./dashboard-shell"
import { useAuth } from "@/lib/firebase/auth-context"

type Role = "student" | "instructor" | "admin"

const rolePaths: Record<Role, string> = {
  student: "/student",
  instructor: "/instructor",
  admin: "/admin",
}

export function DashboardAuthGuard({
  role,
  children,
}: {
  role: Role
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/auth/login?redirect=" + encodeURIComponent(pathname || "/"))
      return
    }
    const allowed =
      role === "admin"
        ? (user.role === "admin" || user.role === "superadmin")
        : role === "instructor"
          ? (user.role === "instructor" || user.role === "admin" || user.role === "superadmin")
          : user.role === role
    if (!allowed) {
      const redirect = rolePaths[user.role === "admin" || user.role === "superadmin" ? "admin" : user.role === "instructor" ? "instructor" : "student"]
      router.replace(redirect)
    }
  }, [user, loading, role, router, pathname])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const allowed =
    role === "admin"
      ? (user.role === "admin" || user.role === "superadmin")
      : role === "instructor"
        ? (user.role === "instructor" || user.role === "admin" || user.role === "superadmin")
        : user.role === role
  if (!allowed) {
    return null
  }

  return (
    <DashboardShell role={role} userName={user.name} userEmail={user.email}>
      {children}
    </DashboardShell>
  )
}
