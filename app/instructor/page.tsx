"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BookOpen, Users, Star, IndianRupee, TrendingUp, ArrowRight,
  Eye, BarChart3
} from "lucide-react"
import { mockCourses, mockEnrollments, mockPayments, mockReviews } from "@/lib/mock-data"
import { formatPrice } from "@/lib/format"

export default function InstructorDashboard() {
  const instructorCourses = mockCourses.filter(c => c.instructorId === "u2")
  const totalStudents = mockEnrollments.length
  const totalRevenue = mockPayments.filter(p => p.status === "captured").reduce((s, p) => s + p.amount, 0)
  const avgRating = instructorCourses.length > 0
    ? (instructorCourses.reduce((s, c) => s + c.rating, 0) / instructorCourses.length).toFixed(1)
    : "0"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Instructor Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back, Priya. Here is your overview.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/instructor/courses/new"><BookOpen className="h-4 w-4" /> Create Course</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Courses</p>
              <p className="text-xl font-bold text-foreground">{instructorCourses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Students</p>
              <p className="text-xl font-bold text-foreground">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <IndianRupee className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-bold text-foreground">{avgRating}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your Courses</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/instructor/courses">View All <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructorCourses.map(course => {
                const revenue = mockPayments
                  .filter(p => p.courseId === course.id && p.status === "captured")
                  .reduce((s, p) => s + p.amount, 0)
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{course.type} - {course.level}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={course.status === "published" ? "bg-success/10 text-success" : "bg-secondary text-secondary-foreground"}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.enrollmentCount}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(revenue)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {mockReviews.slice(0, 4).map(review => (
              <div key={review.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex gap-0.5 pt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-warning text-warning" : "text-border"}`} />
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{review.comment}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {review.userName} - {review.courseId === "c1" ? "Full-Stack Web Development" : "Data Science Bootcamp"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
