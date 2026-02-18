"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/format"
import {
  GraduationCap, Menu, LayoutDashboard, BookOpen, Video, FileText,
  ClipboardList, Calendar, Award, Share2, HelpCircle, Settings as SettingsIcon, LogOut,
  ChevronLeft, Users, BarChart3, Tag, Bell, ShieldCheck, Megaphone,
  CreditCard, ScrollText, Package
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface DashboardShellProps {
  children: React.ReactNode
  role: "student" | "instructor" | "admin"
  userName: string
  userEmail: string
}

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/student/courses", label: "My Courses", icon: <BookOpen className="h-4 w-4" /> },
  { href: "/student/live-sessions", label: "Live Sessions", icon: <Calendar className="h-4 w-4" /> },
  { href: "/student/certificates", label: "Certificates", icon: <Award className="h-4 w-4" /> },
  { href: "/student/referrals", label: "Referrals", icon: <Share2 className="h-4 w-4" /> },
  { href: "/student/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
]

const instructorNav: NavItem[] = [
  { href: "/instructor", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/instructor/courses", label: "My Courses", icon: <BookOpen className="h-4 w-4" /> },
  { href: "/instructor/assignments", label: "Assignments", icon: <FileText className="h-4 w-4" /> },
  { href: "/instructor/live-sessions", label: "Live Sessions", icon: <Calendar className="h-4 w-4" /> },
  { href: "/instructor/announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
]

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/courses", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/enrollments", label: "Enrollments", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/coupons", label: "Coupons", icon: <Tag className="h-4 w-4" /> },
  { href: "/admin/certificates", label: "Certificates", icon: <Award className="h-4 w-4" /> },
  { href: "/admin/referrals", label: "Referrals", icon: <Share2 className="h-4 w-4" /> },
  { href: "/admin/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: <ScrollText className="h-4 w-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <SettingsIcon className="h-4 w-4" /> },
]

export function DashboardShell({ children, role, userName, userEmail }: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = role === "admin" ? adminNav : role === "instructor" ? instructorNav : studentNav
  const roleLabel = role === "admin" ? "Admin Panel" : role === "instructor" ? "Instructor Portal" : "Student Portal"

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground">ZIVO</span>
          <span className="text-[9px] font-medium uppercase tracking-wider text-sidebar-foreground/60">{roleLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{userEmail}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" asChild>
            <Link href="/"><ChevronLeft className="h-3 w-3" /> Home</Link>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" asChild>
            <Link href="/"><LogOut className="h-3 w-3" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex-1" />
          <Link href="/student/support" className="rounded-md p-2 text-muted-foreground hover:bg-secondary">
            <Bell className="h-5 w-5" />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
