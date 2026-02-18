"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Search, MoreVertical, Eye, Edit, Trash2, Star, Ban, CheckCircle2 } from "lucide-react"
import { useCourses } from "@/lib/firebase/hooks"
import { useAuth } from "@/lib/firebase/auth-context"
import { formatPrice } from "@/lib/format"
import { toast } from "sonner"
import type { Course } from "@/lib/types"

export default function AdminCoursesPage() {
  const { data: courses = [], loading, refetch } = useCourses()
  const { firebaseUser } = useAuth()
  const [actionCourseId, setActionCourseId] = useState<string | null>(null)
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleStatus = async (courseId: string, status: "published" | "unpublished" | "draft") => {
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to perform this action")
      return
    }
    setActionCourseId(courseId)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to update course")
        return
      }
      toast.success(`Course ${status}`)
      refetch()
    } finally {
      setActionCourseId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCourse) return
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to perform this action")
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/courses/${deleteCourse.id}`, {
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
    } catch {
      toast.error("Failed to delete course")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Course Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} courses on the platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-9" />
        </div>
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{course.type} - {course.level}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{course.instructorName}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{course.categoryName}</Badge></TableCell>
                  <TableCell className="font-medium">{formatPrice(course.price)}</TableCell>
                  <TableCell>{course.enrollmentCount}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={course.status === "published" ? "bg-success/10 text-success" : "bg-secondary text-secondary-foreground"}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/courses/${course.id}/edit`} className="flex items-center gap-2">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        {course.status === "published" ? (
                          <DropdownMenuItem className="gap-2" onClick={() => handleStatus(course.id, "unpublished")} disabled={actionCourseId === course.id}><Ban className="h-3.5 w-3.5" /> Unpublish</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="gap-2" onClick={() => handleStatus(course.id, "published")} disabled={actionCourseId === course.id}><CheckCircle2 className="h-3.5 w-3.5" /> Publish</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteCourse(course)}><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
