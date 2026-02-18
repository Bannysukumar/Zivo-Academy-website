import { DashboardAuthGuard } from "@/components/dashboard/dashboard-auth-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAuthGuard role="admin">{children}</DashboardAuthGuard>
}
