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
import { Megaphone, Plus, Users, Trash2 } from "lucide-react"
import { mockCourses } from "@/lib/mock-data"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"

const mockAnnouncements = [
  { id: "a1", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", title: "New Module Released: Server Actions", message: "Module 4 on Database & API Routes is now live! Check out the new lessons on Server Actions and Prisma ORM.", createdAt: "2025-08-15" },
  { id: "a2", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", title: "Upcoming Live Q&A Session", message: "Join me for a live Q&A on Advanced Routing Patterns this Saturday at 10 AM IST.", createdAt: "2025-08-10" },
  { id: "a3", courseId: "c2", courseTitle: "Data Science & Machine Learning Bootcamp", title: "Course Update: TensorFlow 2.x", message: "I have updated the deep learning section to use TensorFlow 2.x. All notebooks have been refreshed.", createdAt: "2025-07-20" },
]

export default function InstructorAnnouncementsPage() {
  const [announcements] = useState(mockAnnouncements)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Send updates and notifications to your students</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label>Course</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {mockCourses.filter(c => c.instructorId === "u2").map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input placeholder="Announcement title" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Message</Label>
                <Textarea placeholder="Write your announcement..." rows={4} />
              </div>
              <Button onClick={() => toast.success("Announcement sent!")}>Send Announcement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Megaphone className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map(ann => (
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
