"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, Calendar, Play, ArrowRight, TrendingUp } from "lucide-react"
import { mockEnrollments, mockLiveSessions, mockCertificates } from "@/lib/mock-data"
import { formatDate } from "@/lib/format"

export default function StudentDashboard() {
  const enrollments = mockEnrollments.filter(e => e.userId === "u1")
  const activeEnrollments = enrollments.filter(e => e.status === "active")
  const completedCount = enrollments.filter(e => e.status === "completed").length
  const certificates = mockCertificates.filter(c => c.userId === "u1")
  const upcomingSessions = mockLiveSessions.filter(s => s.status === "upcoming")

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          Welcome back, Arjun
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Enrolled Courses", value: enrollments.length, icon: BookOpen, color: "text-primary" },
          { label: "In Progress", value: activeEnrollments.length, icon: Clock, color: "text-warning" },
          { label: "Completed", value: completedCount, icon: TrendingUp, color: "text-success" },
          { label: "Certificates", value: certificates.length, icon: Award, color: "text-chart-4" },
        ].map((stat, i) => (
          <Card key={i} className="border border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Continue Learning</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/student/courses">View All <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {activeEnrollments.map(enrollment => (
            <div key={enrollment.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
                <BookOpen className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{enrollment.courseTitle}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={enrollment.progress} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">{enrollment.progress}%</span>
                </div>
              </div>
              <Button size="sm" className="gap-1 shrink-0" asChild>
                <Link href={`/student/courses/${enrollment.courseId}`}>
                  <Play className="h-3 w-3" /> Resume
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Live Sessions */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Upcoming Live Sessions</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/student/live-sessions">View All <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
          ) : (
            upcomingSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{session.title}</p>
                    <p className="text-xs text-muted-foreground">{session.courseTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(session.scheduledAt)} &middot; {session.duration}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">Upcoming</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
