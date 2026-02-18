"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  MoreVertical,
  Ban,
  GraduationCap,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { useAllEnrollments, useAllUsers, useCourses } from "@/lib/firebase/hooks"
import { useAuth } from "@/lib/firebase/auth-context"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function AdminEnrollmentsPage() {
  const { data: enrollments = [], loading, error, refetch } = useAllEnrollments()
  const { data: users = [] } = useAllUsers()
  const { data: courses = [] } = useCourses({ publishedOnly: false })
  const { firebaseUser } = useAuth()

  const [search, setSearch] = useState("")
  const [enrollUserId, setEnrollUserId] = useState<string>("")
  const [enrollCourseId, setEnrollCourseId] = useState<string>("")
  const [enrolling, setEnrolling] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredEnrollments = useMemo(() => {
    if (!search.trim()) return enrollments
    const q = search.trim().toLowerCase()
    return enrollments.filter((e) => {
      const user = users.find((u) => u.id === e.userId)
      const name = (user?.name ?? "").toLowerCase()
      const email = (user?.email ?? "").toLowerCase()
      const title = (e.courseTitle ?? "").toLowerCase()
      return name.includes(q) || email.includes(q) || title.includes(q)
    })
  }, [enrollments, users, search])

  const handleEnroll = async () => {
    if (!enrollUserId || !enrollCourseId) {
      toast.error("Select a user and a course")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to perform this action")
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: enrollUserId, courseId: enrollCourseId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Failed to enroll")
        return
      }
      toast.success("User enrolled successfully")
      setEnrollUserId("")
      setEnrollCourseId("")
      refetch()
    } finally {
      setEnrolling(false)
    }
  }

  const handleStatus = async (enrollmentId: string, status: "active" | "revoked") => {
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to perform this action")
      return
    }
    setUpdatingId(enrollmentId)
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to update")
        return
      }
      toast.success(status === "active" ? "Enrollment activated" : "Enrollment deactivated")
      refetch()
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
            Manage Enrollments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Failed to load enrollments</p>
        </div>
        <Card className="border border-destructive/50">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          Manage Enrollments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enroll users in courses and activate or deactivate enrollments.
        </p>
      </div>

      {/* Enroll user in course */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Enroll user in course
          </CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            Select a user and a course to create an enrollment. The user will have access to the course.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>User</Label>
            <Select value={enrollUserId} onValueChange={setEnrollUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Course</Label>
            <Select value={enrollCourseId} onValueChange={setEnrollCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleEnroll} disabled={enrolling || !enrollUserId || !enrollCourseId}>
            {enrolling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enrolling…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Enroll
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name, email, or course..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled On</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <GraduationCap className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p>
                      {search.trim() ? "No enrollments match your search." : "No enrollments yet."}
                    </p>
                    <p className="mt-1 text-xs">
                      {search.trim()
                        ? "Try a different search."
                        : "Enroll a user above or they will appear when students purchase courses."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((e) => {
                  const user = users.find((u) => u.id === e.userId)
                  const isUpdating = updatingId === e.id
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{user?.name ?? "Unknown"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.courseTitle}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={e.progress} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{e.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            e.status === "active"
                              ? "bg-success/10 text-success"
                              : e.status === "completed"
                                ? "bg-primary/10 text-primary"
                                : "bg-destructive/10 text-destructive"
                          }
                        >
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(e.enrolledAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {e.status === "revoked" && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleStatus(e.id, "active")}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {(e.status === "active" || e.status === "completed") && (
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => handleStatus(e.id, "revoked")}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
