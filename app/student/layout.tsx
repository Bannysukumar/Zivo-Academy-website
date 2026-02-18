import { DashboardAuthGuard } from "@/components/dashboard/dashboard-auth-guard"

export const metadata = { title: { default: "Student Dashboard", template: "%s | ZIVO Academy" } }

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAuthGuard role="student">{children}</DashboardAuthGuard>
}
