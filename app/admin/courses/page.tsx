"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookOpen, Search, MoreVertical, Eye, Edit, Trash2, Star, Users, Ban, CheckCircle2 } from "lucide-react"
import { mockCourses } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/format"

export default function AdminCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Course Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockCourses.length} courses on the platform</p>
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
              {mockCourses.map(course => (
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
                        <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><Edit className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><Ban className="h-3.5 w-3.5" /> Unpublish</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
