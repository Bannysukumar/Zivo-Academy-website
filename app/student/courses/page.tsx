"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Play, CheckCircle2, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useEnrollments } from "@/lib/firebase/hooks"
import { formatDate } from "@/lib/format"

export default function StudentCoursesPage() {
  const { user } = useAuth()
  const { data: enrollments = [], loading } = useEnrollments(user?.id)
  const active = enrollments.filter((e) => e.status === "active")
  const completed = enrollments.filter((e) => e.status === "completed")

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">My Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">{enrollments.length} courses enrolled</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">In Progress ({active.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((e) => (
              <Card key={e.id} className="border border-border">
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-muted">
                      <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{e.courseTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Enrolled {formatDate(e.enrolledAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={e.progress} className="h-2 flex-1" />
                    <span className="text-xs font-semibold text-foreground">{e.progress}%</span>
                  </div>
                  <Button size="sm" className="gap-1" asChild>
                    <Link href={`/student/courses/${e.courseId}`}>
                      <Play className="h-3 w-3" /> Continue Learning
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((e) => (
              <Card key={e.id} className="border border-border">
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-success/10">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{e.courseTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Completed {e.completedAt ? formatDate(e.completedAt) : "—"}</p>
                    </div>
                    <Badge className="bg-success text-success-foreground">Completed</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" asChild>
                      <Link href={`/student/courses/${e.courseId}`}>Review Course</Link>
                    </Button>
                    <Button size="sm" className="flex-1 gap-1" asChild>
                      <Link href="/student/certificates">View Certificate</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {enrollments.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-foreground">No courses yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Start your learning journey by exploring our courses.</p>
          <Button className="mt-4 gap-2" asChild>
            <Link href="/courses">Browse Courses <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </div>
  )
}
