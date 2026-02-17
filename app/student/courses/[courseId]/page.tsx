"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Play, CheckCircle2, Lock, FileText, ClipboardList, BookOpen,
  Download, StickyNote, Bookmark, ChevronRight
} from "lucide-react"
import { mockSections, mockCourses } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function CoursePlayerPage() {
  const course = mockCourses[0]
  const sections = mockSections.filter(s => s.courseId === course.id)
  const allLessons = sections.flatMap(s => s.lessons)
  const [currentLessonId, setCurrentLessonId] = useState(allLessons[0]?.id || "")
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(["l1", "l2", "l3"]))
  const [notes, setNotes] = useState("")

  const currentLesson = allLessons.find(l => l.id === currentLessonId) || allLessons[0]
  const progressPct = Math.round((completedLessons.size / allLessons.length) * 100)

  const markComplete = () => {
    setCompletedLessons(prev => new Set([...prev, currentLessonId]))
    const currentIdx = allLessons.findIndex(l => l.id === currentLessonId)
    if (currentIdx < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIdx + 1].id)
    }
  }

  const lessonIcon = (type: string, id: string) => {
    if (completedLessons.has(id)) return <CheckCircle2 className="h-4 w-4 text-success" />
    switch (type) {
      case "video": return <Play className="h-4 w-4" />
      case "quiz": return <ClipboardList className="h-4 w-4" />
      case "assignment": return <FileText className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Video / Content Area */}
      <div className="flex-1">
        {/* Video Player Placeholder */}
        <div className="flex aspect-video items-center justify-center rounded-lg bg-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20">
              <Play className="h-8 w-8 text-background" />
            </div>
            <p className="text-sm font-medium text-background/70">{currentLesson?.title}</p>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{currentLesson?.title}</h2>
            <p className="text-sm text-muted-foreground">{currentLesson?.duration}</p>
          </div>
          <div className="flex gap-2">
            {!completedLessons.has(currentLessonId) && (
              <Button size="sm" onClick={markComplete} className="gap-1">
                <CheckCircle2 className="h-4 w-4" /> Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes" className="mt-4">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-3">
            <Textarea
              placeholder="Write your notes here..."
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Button size="sm" className="mt-2">Save Notes</Button>
          </TabsContent>

          <TabsContent value="resources" className="mt-3">
            <Card className="border border-border">
              <CardContent className="flex flex-col gap-2 p-4">
                {[
                  { name: "Lesson Slides.pdf", size: "2.4 MB" },
                  { name: "Project Starter.zip", size: "1.8 MB" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.size}</span>
                    </div>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-3">
            <p className="text-sm text-muted-foreground">No bookmarks yet. Use the bookmark button while watching to save important moments.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Curriculum */}
      <div className="w-full shrink-0 lg:w-80">
        <Card className="border border-border">
          <CardContent className="p-0">
            <div className="border-b border-border p-4">
              <p className="text-sm font-semibold text-foreground">Course Content</p>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={progressPct} className="h-2 flex-1" />
                <span className="text-xs font-semibold text-foreground">{progressPct}%</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {completedLessons.size} of {allLessons.length} lessons completed
              </p>
            </div>

            <ScrollArea className="max-h-[60vh]">
              {sections.map(section => (
                <div key={section.id}>
                  <div className="border-b border-border bg-secondary/50 px-4 py-2">
                    <p className="text-xs font-semibold text-foreground">{section.title}</p>
                    <p className="text-[10px] text-muted-foreground">{section.lessons.length} lessons</p>
                  </div>
                  {section.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonId(lesson.id)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-sm transition-colors hover:bg-secondary/50",
                        currentLessonId === lesson.id && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                    >
                      <span className="shrink-0 text-muted-foreground">{lessonIcon(lesson.type, lesson.id)}</span>
                      <div className="flex-1">
                        <p className={cn("text-sm", currentLessonId === lesson.id ? "font-semibold text-foreground" : "text-foreground/80")}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
