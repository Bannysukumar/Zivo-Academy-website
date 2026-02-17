import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = { title: { default: "Student Dashboard", template: "%s | ZIVO Academy" } }

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="student" userName="Arjun Mehta" userEmail="arjun@example.com">
      {children}
    </DashboardShell>
  )
}
