"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BookOpen, Plus, Star, Users, Clock, MoreVertical, Edit, Eye, Trash2, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useCoursesByInstructorId } from "@/lib/firebase/hooks"
import { formatPrice } from "@/lib/format"
import { toast } from "sonner"
import type { Course } from "@/lib/types"

export default function InstructorCoursesPage() {
  const { user, firebaseUser } = useAuth()
  const { data: courses = [], loading, refetch } = useCoursesByInstructorId(user?.id)
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const onFocus = () => refetch()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetch])

  const handleDeleteConfirm = async () => {
    if (!deleteCourse || !firebaseUser) return
    const token = await firebaseUser.getIdToken()
    if (!token) {
      toast.error("Sign in again to delete the course")
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/instructor/courses/${deleteCourse.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to delete course")
        return
      }
      toast.success("Course deleted")
      setDeleteCourse(null)
      refetch()
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and create your courses</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/instructor/courses/new"><Plus className="h-4 w-4" /> New Course</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-foreground">No courses yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Create your first course to get started.</p>
          <Button className="mt-4 gap-2" asChild>
            <Link href="/instructor/courses/new"><Plus className="h-4 w-4" /> New Course</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border border-border overflow-hidden">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-10 w-10 text-primary/30" />
                )}
              </div>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={course.status === "published" ? "bg-success/10 text-success text-[10px]" : "bg-secondary text-secondary-foreground text-[10px]"}>
                      {course.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{course.type}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" asChild>
                        <Link href={`/instructor/courses/new?courseId=${course.id}`}><Edit className="h-3.5 w-3.5" /> Edit Course</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" asChild>
                        <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5" /> Preview</a>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" asChild>
                        <Link href={`/instructor/courses/${course.id}/analytics`}><BarChart3 className="h-3.5 w-3.5" /> Analytics</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive" onSelect={(e) => { e.preventDefault(); setDeleteCourse(course) }}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{course.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating ?? 0}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrollmentCount ?? 0}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration ?? "—"}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-base font-bold text-foreground">{formatPrice(course.price ?? 0)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteCourse} onOpenChange={(open) => !open && setDeleteCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteCourse?.title}&quot; and its curriculum. Enrolled students will lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
