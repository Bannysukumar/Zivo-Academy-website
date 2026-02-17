import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="instructor" userName="Priya Sharma" userEmail="priya@example.com">
      {children}
    </DashboardShell>
  )
}
