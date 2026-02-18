"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Video, Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useLiveSessions, useCoursesByInstructorId } from "@/lib/firebase/hooks"
import { formatDateTime } from "@/lib/format"
import { toast } from "sonner"
import type { LiveSession } from "@/lib/types"

export default function InstructorLiveSessionsPage() {
  const { user, firebaseUser } = useAuth()
  const { data: sessions = [], loading: sessionsLoading, refetch } = useLiveSessions()
  const { data: instructorCourses = [], loading: coursesLoading } = useCoursesByInstructorId(user?.id)
  const upcoming = sessions.filter((s) => s.status === "upcoming")
  const completed = sessions.filter((s) => s.status === "completed")
  const loading = sessionsLoading || coursesLoading

  const [dialogOpen, setDialogOpen] = useState(false)
  const [courseId, setCourseId] = useState("")
  const [sessionTitle, setSessionTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [duration, setDuration] = useState("")
  const [meetLink, setMeetLink] = useState("")
  const [scheduling, setScheduling] = useState(false)

  const [editingSession, setEditingSession] = useState<LiveSession | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editScheduledAt, setEditScheduledAt] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editMeetLink, setEditMeetLink] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const openEditDialog = (session: LiveSession) => {
    setEditingSession(session)
    setEditTitle(session.title)
    setEditDescription(session.description ?? "")
    const s = session.scheduledAt
    setEditScheduledAt(s ? (s.length >= 16 ? s.slice(0, 16) : new Date(s).toISOString().slice(0, 16)) : "")
    setEditDuration(session.duration ?? "")
    setEditMeetLink(session.meetLink ?? "")
  }

  const handleUpdateSession = async () => {
    if (!editingSession) return
    if (!editTitle.trim()) {
      toast.error("Enter a session title")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to update the session")
      return
    }
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/instructor/live-sessions/${editingSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          scheduledAt: editScheduledAt || undefined,
          duration: editDuration.trim() || undefined,
          meetLink: editMeetLink.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to update session")
        return
      }
      toast.success("Session updated")
      setEditingSession(null)
      refetch()
    } finally {
      setSavingEdit(false)
    }
  }

  const handleScheduleSession = async () => {
    if (!sessionTitle.trim()) {
      toast.error("Enter a session title")
      return
    }
    if (!courseId) {
      toast.error("Select a course")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to schedule a session")
      return
    }
    setScheduling(true)
    try {
      const res = await fetch("/api/instructor/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseId,
          title: sessionTitle.trim(),
          description: description.trim(),
          scheduledAt: scheduledAt || undefined,
          duration: duration.trim() || undefined,
          meetLink: meetLink.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to schedule session")
        return
      }
      toast.success("Session scheduled!")
      setDialogOpen(false)
      setCourseId("")
      setSessionTitle("")
      setDescription("")
      setScheduledAt("")
      setDuration("")
      setMeetLink("")
      refetch()
    } finally {
      setScheduling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Live Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule and manage live classes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Schedule Session</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Schedule Live Session</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {instructorCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Session Title</Label>
                <Input placeholder="e.g., Q&A: Advanced Routing" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <Textarea placeholder="What will be covered..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Duration</Label>
                  <Input placeholder="e.g., 90 min" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Meeting Link</Label>
                <Input placeholder="https://meet.google.com/..." value={meetLink} onChange={(e) => setMeetLink(e.target.value)} />
              </div>
              <Button onClick={handleScheduleSession} disabled={scheduling}>{scheduling ? "Scheduling…" : "Schedule Session"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Edit Live Session</DialogTitle></DialogHeader>
            {editingSession && (
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-2">
                  <Label>Course</Label>
                  <Input value={editingSession.courseTitle} disabled className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Session Title</Label>
                  <Input placeholder="e.g., Q&A: Advanced Routing" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Textarea placeholder="What will be covered..." rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Date & Time</Label>
                    <Input type="datetime-local" value={editScheduledAt} onChange={(e) => setEditScheduledAt(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Input placeholder="e.g., 90 min" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Meeting Link</Label>
                  <Input placeholder="https://meet.google.com/..." value={editMeetLink} onChange={(e) => setEditMeetLink(e.target.value)} />
                </div>
                <Button onClick={handleUpdateSession} disabled={savingEdit}>{savingEdit ? "Saving…" : "Save changes"}</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.title}</p>
                      <p className="text-xs text-muted-foreground">{session.courseTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(session.scheduledAt)} · {session.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => openEditDialog(session)}><Edit className="h-3 w-3" /> Edit</Button>
                      {session.meetLink ? (
                        <Button size="sm" className="gap-1" asChild>
                          <a href={session.meetLink} target="_blank" rel="noopener noreferrer"><Video className="h-3 w-3" /> Join</a>
                        </Button>
                      ) : (
                        <Button size="sm" className="gap-1" disabled title="Add a meeting link in Edit"><Video className="h-3 w-3" /> Join</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Completed ({completed.length})</h3>
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed sessions yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {completed.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.title}</p>
                      <p className="text-xs text-muted-foreground">{session.courseTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(session.scheduledAt)}</p>
                    </div>
                    {session.recordingUrl && (
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /> Recording</a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
