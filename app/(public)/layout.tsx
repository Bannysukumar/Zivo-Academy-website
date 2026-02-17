import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { mockUsers } from "@/lib/mock-data"

// Use the admin user for demo so all portal links are visible
const demoUser = mockUsers.find(u => u.role === "admin")!

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={demoUser} cartCount={2} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
