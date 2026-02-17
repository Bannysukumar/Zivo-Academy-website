"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, TrendingUp, Users, BookOpen, IndianRupee } from "lucide-react"
import { mockPayments, mockEnrollments, mockCourses, mockUsers } from "@/lib/mock-data"
import { formatPrice } from "@/lib/format"

export default function AdminReportsPage() {
  const totalRevenue = mockPayments.filter(p => p.status === "captured").reduce((s, p) => s + p.amount, 0)
  const avgOrderValue = mockPayments.filter(p => p.status === "captured").length > 0
    ? Math.round(totalRevenue / mockPayments.filter(p => p.status === "captured").length)
    : 0

  const courseStats = mockCourses.map(c => ({
    ...c,
    revenue: mockPayments.filter(p => p.courseId === c.id && p.status === "captured").reduce((s, p) => s + p.amount, 0),
    enrollments: mockEnrollments.filter(e => e.courseId === c.id).length,
  })).sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform performance overview</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            <p className="flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> +12.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Enrollments</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{mockEnrollments.length}</p>
            <p className="flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> +8.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatPrice(avgOrderValue)}</p>
            <p className="flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> +5.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {mockEnrollments.length > 0 ? Math.round((mockEnrollments.filter(e => e.status === "completed").length / mockEnrollments.length) * 100) : 0}%
            </p>
            <p className="flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> +3.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month (visual representation) */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="text-base">Monthly Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((month, i) => {
              const heights = [40, 55, 45, 70, 80, 65, 90, 85]
              return (
                <div key={month} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{month}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Courses by Revenue */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="text-base">Top Courses by Revenue</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {courseStats.map((course, i) => (
              <div key={course.id} className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-foreground">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.enrollments} enrollments</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatPrice(course.revenue)}</p>
                  <p className="text-xs text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
