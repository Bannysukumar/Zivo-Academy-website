"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import {
  Play, CheckCircle2, FileText, ClipboardList, BookOpen,
  Download, Lock
} from "lucide-react"
import { useCourseById, useSections, useEnrollments } from "@/lib/firebase/hooks"
import { useAuth } from "@/lib/firebase/auth-context"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const { user } = useAuth()
  const { data: course, loading: courseLoading } = useCourseById(courseId)
  const { data: sections = [], loading: sectionsLoading } = useSections(courseId)
  const { data: enrollments = [], loading: enrollmentsLoading } = useEnrollments(user?.id)
  const allLessons = sections.flatMap((s) => s.lessons ?? [])
  const [currentLessonId, setCurrentLessonId] = useState(allLessons[0]?.id ?? "")
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState("")

  const enrollment = enrollments.find((e) => e.courseId === courseId && e.status !== "revoked")
  const isEnrolled = !!enrollment

  const loading = courseLoading || sectionsLoading || enrollmentsLoading
  if (loading) {
    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <div className="aspect-video animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 h-10 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-80 w-full animate-pulse rounded-lg bg-muted lg:w-80" />
      </div>
    )
  }

  if (!course) notFound()

  if (!user) {
    return (
      <Card className="mx-4 mt-6 border border-border">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">Sign in to access course content.</p>
          <Button asChild><Link href={`/auth/login?redirect=/student/courses/${courseId}`}>Sign In</Link></Button>
        </CardContent>
      </Card>
    )
  }

  if (!isEnrolled) {
    return (
      <Card className="mx-4 mt-6 border border-border">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">You are not enrolled in this course. Enroll to access all lessons and track progress.</p>
          <Button asChild><Link href={`/courses/${course.slug}`}>View Course & Enroll</Link></Button>
        </CardContent>
      </Card>
    )
  }

  const currentLesson = allLessons.find((l) => l.id === currentLessonId) ?? allLessons[0]
  const progressPct = allLessons.length ? Math.round((completedLessons.size / allLessons.length) * 100) : 0

  const markComplete = () => {
    if (!currentLessonId) return
    setCompletedLessons((prev) => new Set([...prev, currentLessonId]))
    const currentIdx = allLessons.findIndex((l) => l.id === currentLessonId)
    if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
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
      <div className="flex-1">
        <div className="flex aspect-video items-center justify-center rounded-lg bg-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20">
              <Play className="h-8 w-8 text-background" />
            </div>
            <p className="text-sm font-medium text-background/70">{currentLesson?.title}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{currentLesson?.title}</h2>
            <p className="text-sm text-muted-foreground">{currentLesson?.duration}</p>
          </div>
          <div className="flex gap-2">
            {currentLesson && !completedLessons.has(currentLessonId) && (
              <Button size="sm" onClick={markComplete} className="gap-1">
                <CheckCircle2 className="h-4 w-4" /> Mark Complete
              </Button>
            )}
          </div>
        </div>

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
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button size="sm" className="mt-2">Save Notes</Button>
          </TabsContent>

          <TabsContent value="resources" className="mt-3">
            <Card className="border border-border">
              <CardContent className="flex flex-col gap-2 p-4">
                {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                  currentLesson.resources.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.size}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No resources for this lesson</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-3">
            <p className="text-sm text-muted-foreground">No bookmarks yet. Use the bookmark button while watching to save important moments.</p>
          </TabsContent>
        </Tabs>
      </div>

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
              {sections.map((section) => (
                <div key={section.id}>
                  <div className="border-b border-border bg-secondary/50 px-4 py-2">
                    <p className="text-xs font-semibold text-foreground">{section.title}</p>
                    <p className="text-[10px] text-muted-foreground">{(section.lessons ?? []).length} lessons</p>
                  </div>
                  {(section.lessons ?? []).map((lesson) => (
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
