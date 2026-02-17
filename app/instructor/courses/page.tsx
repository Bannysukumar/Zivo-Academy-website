"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookOpen, Plus, Star, Users, Clock, MoreVertical, Edit, Eye, Trash2, BarChart3 } from "lucide-react"
import { mockCourses } from "@/lib/mock-data"
import { formatPrice } from "@/lib/format"

export default function InstructorCoursesPage() {
  const courses = mockCourses.filter(c => c.instructorId === "u2")

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <Card key={course.id} className="border border-border overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <BookOpen className="h-10 w-10 text-primary/30" />
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
                    <DropdownMenuItem className="gap-2"><Edit className="h-3.5 w-3.5" /> Edit Course</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> Preview</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2"><BarChart3 className="h-3.5 w-3.5" /> Analytics</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{course.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrollmentCount}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration}</span>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-base font-bold text-foreground">{formatPrice(course.price)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
