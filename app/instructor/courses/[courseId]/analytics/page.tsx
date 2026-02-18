"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Users, TrendingUp, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useCourseById } from "@/lib/firebase/hooks"

export default function InstructorCourseAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = typeof params?.courseId === "string" ? params.courseId : Array.isArray(params?.courseId) ? params.courseId[0] : undefined
  const { user } = useAuth()
  const { data: course, loading, error } = useCourseById(courseId)

  if (!courseId) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="gap-2 w-fit" asChild>
          <Link href="/instructor/courses"><ArrowLeft className="h-4 w-4" /> Back to My Courses</Link>
        </Button>
        <p className="text-muted-foreground">Invalid course.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="gap-2 w-fit" asChild>
          <Link href="/instructor/courses"><ArrowLeft className="h-4 w-4" /> Back to My Courses</Link>
        </Button>
        <p className="text-muted-foreground">Course not found or you don’t have access.</p>
      </div>
    )
  }

  if (course.instructorId !== user?.id) {
    router.replace("/instructor/courses")
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" asChild>
          <Link href="/instructor/courses"><ArrowLeft className="h-4 w-4" /> Back to My Courses</Link>
        </Button>
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Course Analytics</h1>
        <p className="mt-1 text-muted-foreground">{course.title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{course.enrollmentCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total students</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{course.rating ?? 0}</p>
            <p className="text-xs text-muted-foreground">{course.reviewCount ?? 0} reviews</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Curriculum</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{course.lessonsCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Detailed analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Charts and detailed metrics (e.g. revenue, completion rate) can be added here later.</p>
        </CardContent>
      </Card>
    </div>
  )
}
