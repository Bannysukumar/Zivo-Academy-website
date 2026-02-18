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
import { Megaphone, Plus, Trash2, Users } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useCoursesByInstructorId, useAnnouncementsByInstructorId } from "@/lib/firebase/hooks"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function InstructorAnnouncementsPage() {
  const { user, firebaseUser } = useAuth()
  const { data: instructorCourses = [], loading: coursesLoading } = useCoursesByInstructorId(user?.id)
  const { data: announcements = [], loading: announcementsLoading, refetch } = useAnnouncementsByInstructorId(user?.id)
  const loading = coursesLoading || announcementsLoading

  const [dialogOpen, setDialogOpen] = useState(false)
  const [courseId, setCourseId] = useState("all")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSendAnnouncement = async () => {
    if (!title.trim()) {
      toast.error("Enter an announcement title")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to send announcements")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/instructor/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: courseId === "all" ? undefined : courseId, title: title.trim(), message: message.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Failed to send announcement")
        return
      }
      toast.success("Announcement sent!")
      setDialogOpen(false)
      setTitle("")
      setMessage("")
      setCourseId("all")
      refetch?.()
    } catch {
      toast.error("Failed to send announcement")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Send updates and notifications to your students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {instructorCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Message</Label>
                <Textarea placeholder="Write your announcement..." rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button onClick={handleSendAnnouncement} disabled={sending}>{sending ? "Sending…" : "Send Announcement"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <p className="text-muted-foreground">Loading announcements…</p>
          </CardContent>
        </Card>
      ) : announcements.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Megaphone className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="border border-border">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="text-[10px]">{ann.courseTitle}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{ann.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{ann.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatDate(ann.createdAt)}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Sent to all enrolled students</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
