"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen, Users, CreditCard, IndianRupee, TrendingUp,
  ArrowRight, ShieldCheck, BarChart3
} from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useAllUsers, useAllPayments, useAllEnrollments, useCourses } from "@/lib/firebase/hooks"
import { formatPrice } from "@/lib/format"

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: users = [] } = useAllUsers()
  const { data: payments = [] } = useAllPayments()
  const { data: enrollments = [] } = useAllEnrollments()
  const { data: courses = [], loading } = useCourses()

  const totalRevenue = payments.filter((p) => p.status === "captured").reduce((s, p) => s + p.amount, 0)
  const totalStudents = users.filter((u) => u.role === "student").length
  const totalCourses = courses.length
  const totalEnrollments = enrollments.length
  const displayName = user?.name ?? "Admin"

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  const quickLinks = [
    { href: "/admin/courses", label: "Manage Courses", icon: <BookOpen className="h-4 w-4" />, count: totalCourses },
    { href: "/admin/users", label: "Manage Users", icon: <Users className="h-4 w-4" />, count: users.length },
    { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" />, count: payments.length },
    { href: "/admin/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" />, count: null },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {displayName}. Here is the platform overview.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="text-xl font-bold text-foreground">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <BookOpen className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Courses</p>
              <p className="text-xl font-bold text-foreground">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Enrollments</p>
              <p className="text-xl font-bold text-foreground">{totalEnrollments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <Card className="border border-border transition-colors hover:border-primary/30">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    {link.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    {link.count !== null && <p className="text-xs text-muted-foreground">{link.count} total</p>}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Payments */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Payments</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/admin/payments">View All <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {payments.slice(0, 4).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{payment.userName}</p>
                  <p className="text-xs text-muted-foreground">{payment.courseTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatPrice(payment.amount)}</p>
                  <p className={`text-xs ${payment.status === "captured" ? "text-success" : "text-destructive"}`}>{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
