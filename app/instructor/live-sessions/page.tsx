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
import { mockLiveSessions, mockCourses } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/format"
import { toast } from "sonner"

export default function InstructorLiveSessionsPage() {
  const sessions = mockLiveSessions
  const upcoming = sessions.filter(s => s.status === "upcoming")
  const completed = sessions.filter(s => s.status === "completed")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Live Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule and manage live classes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Schedule Session</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Schedule Live Session</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label>Course</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {mockCourses.filter(c => c.instructorId === "u2").map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Session Title</Label>
                <Input placeholder="e.g., Q&A: Advanced Routing" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <Textarea placeholder="What will be covered..." rows={3} />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Duration</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Meeting Link</Label>
                <Input placeholder="https://meet.google.com/..." />
              </div>
              <Button onClick={() => toast.success("Session scheduled!")}>Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <Card className="border border-border"><CardContent className="py-10 text-center text-muted-foreground">No upcoming sessions</CardContent></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map(session => (
              <Card key={session.id} className="border border-border">
                <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success text-success-foreground text-[10px]">Upcoming</Badge>
                      <span className="text-xs text-muted-foreground">{session.courseTitle}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{session.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(session.scheduledAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {session.duration}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1 text-xs"><Edit className="h-3 w-3" /> Edit</Button>
                    <Button size="sm" className="gap-1 text-xs" asChild>
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer"><Video className="h-3 w-3" /> Start</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Completed Sessions</h2>
        {completed.length === 0 ? (
          <Card className="border border-border"><CardContent className="py-10 text-center text-muted-foreground">No completed sessions yet</CardContent></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {completed.map(session => (
              <Card key={session.id} className="border border-border">
                <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">Completed</Badge>
                      <span className="text-xs text-muted-foreground">{session.courseTitle}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{session.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(session.scheduledAt)}</span>
                    </div>
                  </div>
                  {session.recordingUrl ? (
                    <Button variant="outline" size="sm" className="gap-1 text-xs" asChild>
                      <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /> Recording</a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1 text-xs">Upload Recording</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
