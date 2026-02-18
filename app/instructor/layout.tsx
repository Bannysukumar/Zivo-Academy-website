import { DashboardAuthGuard } from "@/components/dashboard/dashboard-auth-guard"

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAuthGuard role="instructor">{children}</DashboardAuthGuard>
}
