"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/lib/firebase/auth-context"

export function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const cartCount = 0
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
