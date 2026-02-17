"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, CheckCircle2, Clock, AlertCircle, Eye, Download, Star } from "lucide-react"
import { getInitials } from "@/lib/format"

const submissions = [
  { id: "sub1", studentName: "Arjun Mehta", courseName: "Full-Stack Web Dev", assignmentTitle: "Build a React Component", submittedAt: "2025-08-10", status: "pending", grade: null },
  { id: "sub2", studentName: "Sneha Patel", courseName: "Full-Stack Web Dev", assignmentTitle: "Build a React Component", submittedAt: "2025-08-09", status: "graded", grade: 85 },
  { id: "sub3", studentName: "Arjun Mehta", courseName: "Full-Stack Web Dev", assignmentTitle: "Module 4 Assignment", submittedAt: "2025-08-12", status: "pending", grade: null },
  { id: "sub4", studentName: "Sneha Patel", courseName: "Full-Stack Web Dev", assignmentTitle: "Module 4 Assignment", submittedAt: "2025-08-11", status: "graded", grade: 92 },
]

export default function InstructorAssignmentsPage() {
  const pending = submissions.filter(s => s.status === "pending")
  const graded = submissions.filter(s => s.status === "graded")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Assignments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and grade student submissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
              <p className="text-xl font-bold text-foreground">{pending.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Graded</p>
              <p className="text-xl font-bold text-foreground">{graded.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Submissions</p>
              <p className="text-xl font-bold text-foreground">{submissions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">{getInitials(sub.studentName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{sub.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sub.assignmentTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.courseName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sub.submittedAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Eye className="h-3 w-3" /> View</Button>
                          <Button size="sm" className="gap-1 text-xs h-7"><Star className="h-3 w-3" /> Grade</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graded" className="mt-4">
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {graded.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">{getInitials(sub.studentName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{sub.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sub.assignmentTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.courseName}</TableCell>
                      <TableCell>
                        <Badge className={sub.grade && sub.grade >= 80 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                          {sub.grade}/100
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sub.submittedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
