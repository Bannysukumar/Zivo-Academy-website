"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, User, BookOpen, GraduationCap, Mail, Calendar, Shield } from "lucide-react"
import * as data from "@/lib/firebase/data"
import { getInitials, formatDate } from "@/lib/format"
import type { User as UserType, Enrollment, Course } from "@/lib/types"

export default function AdminUserProfilePage() {
  const params = useParams()
  const userId = typeof params.userId === "string" ? params.userId : Array.isArray(params.userId) ? params.userId[0] : undefined
  const [user, setUser] = useState<UserType | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    let mounted = true
    Promise.all([
      data.getUserById(userId),
      data.getEnrollmentsByUserId(userId).catch(() => []),
      data.getCoursesByInstructorId(userId).catch(() => []),
    ]).then(([userDoc, enrollmentsList, coursesList]) => {
      if (!mounted) return
      setUser(userDoc ?? null)
      setEnrollments(enrollmentsList)
      setCourses(coursesList)
    }).catch(() => {
      if (mounted) setUser(null)
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [userId])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to User Management
        </Link>
        <Card className="border border-border">
          <CardContent className="py-12 text-center text-muted-foreground">User not found.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to User Management
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-lg text-primary">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{user.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={`capitalize ${user.role === "admin" || user.role === "superadmin" ? "bg-primary/10 text-primary" : user.role === "instructor" ? "bg-warning/10 text-warning" : ""}`}>
                <Shield className="h-3 w-3 mr-1" /> {user.role}
              </Badge>
              <Badge className={user.blocked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}>
                {user.blocked ? "Blocked" : "Active"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined {formatDate(user.createdAt)}</span>
            </div>
            {user.referralCode && (
              <p className="text-xs text-muted-foreground">Referral code: <span className="font-mono">{user.referralCode}</span></p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {user.role === "student" && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Enrolled courses</p><p className="text-xl font-bold text-foreground">{enrollments.length}</p></div>
              </div>
            )}
            {(user.role === "instructor" || user.role === "superadmin") && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><BookOpen className="h-5 w-5 text-warning" /></div>
                <div><p className="text-xs text-muted-foreground">Courses created</p><p className="text-xl font-bold text-foreground">{courses.length}</p></div>
              </div>
            )}
            {user.role === "admin" && (
              <p className="text-sm text-muted-foreground">Admin user — no student or instructor stats.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {user.role === "student" && enrollments.length > 0 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Enrollments (student dashboard)</CardTitle>
            <p className="text-sm text-muted-foreground">Courses this user is enrolled in</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.courseTitle || "—"}</TableCell>
                    <TableCell>{e.progress ?? 0}%</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{e.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(e.enrolledAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(user.role === "instructor" || user.role === "superadmin") && courses.length > 0 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Courses (instructor dashboard)</CardTitle>
            <p className="text-sm text-muted-foreground">Courses created by this instructor</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{c.status}</Badge></TableCell>
                    <TableCell>{c.enrollmentCount ?? 0}</TableCell>
                    <TableCell>₹{c.price ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
