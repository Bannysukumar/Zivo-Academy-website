"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, CheckCircle2, Clock, Eye, Star, Plus, ClipboardList } from "lucide-react"
import { getInitials } from "@/lib/format"
import { formatDate } from "@/lib/format"
import { useAuth } from "@/lib/firebase/auth-context"
import { useAssignmentSubmissions, useAssignmentsByInstructorId, useCoursesByInstructorId } from "@/lib/firebase/hooks"
import { toast } from "sonner"

export default function InstructorAssignmentsPage() {
  const { user, firebaseUser } = useAuth()
  const { data: submissions, loading, error, refetch: refetchSubmissions } = useAssignmentSubmissions(user?.id)
  const { data: assignments = [], loading: assignmentsLoading, refetch: refetchAssignments } = useAssignmentsByInstructorId(user?.id)
  const { data: instructorCourses = [] } = useCoursesByInstructorId(user?.id)
  const pending = submissions.filter((s) => s.status === "pending")
  const graded = submissions.filter((s) => s.status === "graded")

  const [createOpen, setCreateOpen] = useState(false)
  const [createCourseId, setCreateCourseId] = useState("")
  const [createTitle, setCreateTitle] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createDueDate, setCreateDueDate] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreateAssignment = async () => {
    if (!createTitle.trim()) {
      toast.error("Enter assignment title")
      return
    }
    if (!createCourseId) {
      toast.error("Select a course")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to create assignment")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/instructor/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseId: createCourseId,
          title: createTitle.trim(),
          description: createDescription.trim(),
          dueDate: createDueDate.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to create assignment")
        return
      }
      toast.success("Assignment created. Students can submit from the course.")
      setCreateOpen(false)
      setCreateCourseId("")
      setCreateTitle("")
      setCreateDescription("")
      setCreateDueDate("")
      refetchAssignments()
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and grade student submissions</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and grade student submissions</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create assessments and review student submissions</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-fit"><Plus className="h-4 w-4" /> Create assignment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Create assignment</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label>Course</Label>
                <Select value={createCourseId} onValueChange={setCreateCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {instructorCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                    {instructorCourses.length === 0 && <SelectItem value="none" disabled>No courses yet</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Assignment title</Label>
                <Input placeholder="e.g. Week 1 Quiz" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description (instructions for students)</Label>
                <Textarea placeholder="Describe the assignment..." rows={4} value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Due date (optional)</Label>
                <Input type="date" value={createDueDate} onChange={(e) => setCreateDueDate(e.target.value)} />
              </div>
              <Button onClick={handleCreateAssignment} disabled={creating} className="w-full">
                {creating ? "Creating…" : "Create assignment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Your assessments */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Your assessments</h2>
          </div>
          {assignmentsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />)}
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-8 text-center">No assignments yet. Create one to give assessments to students in your courses.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{a.courseName}</TableCell>
                    <TableCell className="text-muted-foreground">{a.dueDate ? formatDate(a.dueDate) : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
                          <span className="font-medium">{sub.studentName ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sub.assignmentTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.courseName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(sub.submittedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Eye className="h-3 w-3" /> View</Button>
                          <Button size="sm" className="gap-1 text-xs h-7"><Star className="h-3 w-3" /> Grade</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        No pending submissions
                      </TableCell>
                    </TableRow>
                  )}
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
                  {graded.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">{getInitials(sub.studentName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{sub.studentName ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sub.assignmentTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.courseName}</TableCell>
                      <TableCell>
                        <Badge className={sub.grade != null && sub.grade >= 80 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                          {sub.grade}/100
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(sub.submittedAt)}</TableCell>
                    </TableRow>
                  ))}
                  {graded.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        No graded submissions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
