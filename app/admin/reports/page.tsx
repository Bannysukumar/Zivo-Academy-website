"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, TrendingUp, TrendingDown, Minus, Users, BookOpen, IndianRupee } from "lucide-react"
import { useAllPayments, useAllEnrollments, useCourses } from "@/lib/firebase/hooks"
import { formatPrice } from "@/lib/format"

function parseDate(s: string): number {
  const t = new Date(s).getTime()
  return Number.isFinite(t) ? t : 0
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("30d")
  const { data: payments = [], loading, error: paymentsError } = useAllPayments()
  const { data: enrollments = [], error: enrollmentsError } = useAllEnrollments()
  const { data: courses = [] } = useCourses()
  const error = paymentsError ?? enrollmentsError

  const captured = payments.filter((p) => p.status === "captured")
  const totalRevenue = captured.reduce((s, p) => s + (p.amount ?? 0), 0)
  const avgOrderValue = captured.length > 0 ? Math.round(totalRevenue / captured.length) : 0
  const completionRate = enrollments.length > 0 ? Math.round((enrollments.filter((e) => e.status === "completed").length / enrollments.length) * 100) : 0

  const { revenueChange, enrollmentsChange, avgOrderChange, completionChange, monthlyRevenue } = useMemo(() => {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    if (period === "all") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const last6: { month: string; year: number; revenue: number; pct: number }[] = []
      let maxRev = 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const year = d.getFullYear()
        const month = d.getMonth()
        const start = new Date(year, month, 1).getTime()
        const end = new Date(year, month + 1, 0, 23, 59, 59).getTime()
        const rev = captured.filter((p) => {
          const t = parseDate(p.createdAt)
          return t >= start && t <= end
        }).reduce((s, p) => s + (p.amount ?? 0), 0)
        maxRev = Math.max(maxRev, rev)
        last6.push({ month: monthNames[month], year, revenue: rev, pct: 0 })
      }
      maxRev = Math.max(1, maxRev)
      last6.forEach((m) => { m.pct = (m.revenue / maxRev) * 100 })
      return { revenueChange: null, enrollmentsChange: null, avgOrderChange: null, completionChange: null, monthlyRevenue: last6 }
    }
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30
    const currentStart = now - days * day
    const previousEnd = currentStart
    const previousStart = previousEnd - days * day

    const inCurrent = (t: number) => t >= currentStart && t <= now
    const inPrevious = (t: number) => t >= previousStart && t < previousEnd

    const capPayments = captured
    const revCurrent = capPayments.filter((p) => inCurrent(parseDate(p.createdAt))).reduce((s, p) => s + (p.amount ?? 0), 0)
    const revPrevious = capPayments.filter((p) => inPrevious(parseDate(p.createdAt))).reduce((s, p) => s + (p.amount ?? 0), 0)
    const countCurrent = capPayments.filter((p) => inCurrent(parseDate(p.createdAt))).length
    const countPrevious = capPayments.filter((p) => inPrevious(parseDate(p.createdAt))).length
    const avgCurrent = countCurrent > 0 ? revCurrent / countCurrent : 0
    const avgPrevious = countPrevious > 0 ? revPrevious / countPrevious : 0

    const encCurrent = enrollments.filter((e) => inCurrent(parseDate(e.enrolledAt))).length
    const encPrevious = enrollments.filter((e) => inPrevious(parseDate(e.enrolledAt))).length
    const completedCurrent = enrollments.filter((e) => e.status === "completed" && inCurrent(parseDate(e.enrolledAt))).length
    const completedPrevious = enrollments.filter((e) => e.status === "completed" && inPrevious(parseDate(e.enrolledAt))).length
    const rateCurrent = encCurrent > 0 ? (completedCurrent / encCurrent) * 100 : 0
    const ratePrevious = encPrevious > 0 ? (completedPrevious / encPrevious) * 100 : 0

    const revenueChange = revPrevious > 0 ? Math.round(((revCurrent - revPrevious) / revPrevious) * 100) : null
    const enrollmentsChange = encPrevious > 0 ? Math.round(((encCurrent - encPrevious) / encPrevious) * 100) : null
    const avgOrderChange = avgPrevious > 0 ? Math.round(((avgCurrent - avgPrevious) / avgPrevious) * 100) : null
    const completionChange = ratePrevious > 0 ? Math.round(rateCurrent - ratePrevious) : null

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const last6: { month: string; year: number; revenue: number; pct: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const year = d.getFullYear()
      const month = d.getMonth()
      const start = new Date(year, month, 1).getTime()
      const end = new Date(year, month + 1, 0, 23, 59, 59).getTime()
      const rev = capPayments
        .filter((p) => {
          const t = parseDate(p.createdAt)
          return t >= start && t <= end
        })
        .reduce((s, p) => s + (p.amount ?? 0), 0)
      last6.push({ month: monthNames[month], year, revenue: rev, pct: 0 })
    }
    const maxRev = Math.max(1, ...last6.map((m) => m.revenue))
    last6.forEach((m) => { m.pct = (m.revenue / maxRev) * 100 })

    return {
      revenueChange,
      enrollmentsChange,
      avgOrderChange,
      completionChange,
      monthlyRevenue: last6,
    }
  }, [period, captured, enrollments])

  const courseStats = useMemo(() => courses.map((c) => ({
    ...c,
    revenue: payments.filter((p) => p.courseId === c.id && p.status === "captured").reduce((s, p) => s + (p.amount ?? 0), 0),
    enrollments: enrollments.filter((e) => e.courseId === c.id).length,
  })).sort((a, b) => b.revenue - a.revenue), [courses, payments, enrollments])

  const changeLabel = (val: number | null, suffix = "from previous period") => {
    if (val === null) return null
    if (val > 0) return `+${val}% ${suffix}`
    if (val < 0) return `${val}% ${suffix}`
    return `No change ${suffix}`
  }
  const ChangeLine = ({ value }: { value: number | null }) => {
    if (value === null) return <p className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3 w-3" /> No prior period to compare</p>
    const isUp = value > 0
    const isDown = value < 0
    return (
      <p className={`flex items-center gap-1 text-xs ${isUp ? "text-success" : isDown ? "text-destructive" : "text-muted-foreground"}`}>
        {isUp && <TrendingUp className="h-3 w-3" />}
        {isDown && <TrendingDown className="h-3 w-3" />}
        {value === 0 && <Minus className="h-3 w-3" />}
        {changeLabel(value)}
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform performance overview</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
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

      {error && (
        <Card className="border border-destructive/50">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            <ChangeLine value={period === "all" ? null : revenueChange} />
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Enrollments</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{enrollments.length}</p>
            <ChangeLine value={period === "all" ? null : enrollmentsChange} />
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatPrice(avgOrderValue)}</p>
            <ChangeLine value={period === "all" ? null : avgOrderChange} />
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            <ChangeLine value={period === "all" ? null : completionChange} />
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="text-base">Monthly Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((m) => (
              <div key={`${m.month}-${m.year}`} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${m.pct}%` }}
                  title={formatPrice(m.revenue)}
                />
                <span className="text-[10px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
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
