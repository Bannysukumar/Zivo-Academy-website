import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin" userName="Rahul Verma" userEmail="rahul@example.com">
      {children}
    </DashboardShell>
  )
}
