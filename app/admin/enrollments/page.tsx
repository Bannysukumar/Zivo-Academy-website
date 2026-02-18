"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Search, MoreVertical, Ban, RefreshCw, GraduationCap } from "lucide-react"
import { useAllEnrollments, useAllUsers } from "@/lib/firebase/hooks"
import { formatDate } from "@/lib/format"

export default function AdminEnrollmentsPage() {
  const { data: enrollments = [], loading, error, refetch } = useAllEnrollments()
  const { data: users = [] } = useAllUsers()

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
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Enrollments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Failed to load enrollments</p>
        </div>
        <Card className="border border-destructive/50">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => refetch()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Enrollments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{enrollments.length} total enrollments</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search enrollments..." className="pl-9" />
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
              {enrollments.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No enrollments yet</p>
                    <p className="text-xs mt-1">Enrollments appear when students purchase or are assigned to courses.</p>
                  </TableCell>
                </TableRow>
              ) : enrollments.map((e) => {
                const user = users.find((u) => u.id === e.userId)
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{user?.name || "Unknown"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.courseTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={e.progress} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{e.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        e.status === "active" ? "bg-success/10 text-success" :
                        e.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-destructive/10 text-destructive"
                      }>{e.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(e.enrolledAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2"><RefreshCw className="h-3.5 w-3.5" /> Reset Progress</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive"><Ban className="h-3.5 w-3.5" /> Revoke</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
