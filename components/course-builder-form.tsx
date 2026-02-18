"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Save, Eye, Plus, Trash2, GripVertical, Video, FileText, ClipboardList, BookOpen, Link2, Upload, Loader2, ArrowLeft } from "lucide-react"
import { useCategories, useCourseById } from "@/lib/firebase/hooks"
import * as data from "@/lib/firebase/data"
import { useAuth } from "@/lib/firebase/auth-context"
import { getFirebaseStorage } from "@/lib/firebase/client"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"

export interface CourseBuilderFormProps {
  editCourseId: string | undefined
  successRedirect: string
  backHref?: string
  backLabel?: string
}

export function CourseBuilderForm({ editCourseId, successRedirect, backHref, backLabel }: CourseBuilderFormProps) {
  const router = useRouter()
  const { data: categories = [], loading: categoriesLoading } = useCategories()
  const { data: editCourse, loading: editLoading } = useCourseById(editCourseId)
  const { firebaseUser } = useAuth()
  const [courseId, setCourseId] = useState<string | null>(null)
  const editLoadedRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [level, setLevel] = useState("beginner")
  const [type, setType] = useState("recorded")
  const [language, setLanguage] = useState("English")
  const [thumbnail, setThumbnail] = useState("")
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url")
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [outcomesStr, setOutcomesStr] = useState("")
  const [requirementsStr, setRequirementsStr] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [sections, setSections] = useState([
    {
      id: "new-s1", title: "Getting Started", order: 1, lessons: [
        { id: "new-l1", title: "Introduction", type: "video", duration: "10 min", isFree: true, order: 1 },
        { id: "new-l2", title: "Setup Guide", type: "video", duration: "15 min", isFree: false, order: 2 },
      ]
    }
  ])

  useEffect(() => {
    if (!editCourseId || !editCourse || editLoadedRef.current) return
    editLoadedRef.current = true
    setCourseId(editCourseId)
    setTitle(editCourse.title ?? "")
    setShortDescription(editCourse.shortDescription ?? "")
    setDescription(editCourse.description ?? "")
    setCategoryId(editCourse.categoryId ?? "")
    setLevel(editCourse.level === "beginner" || editCourse.level === "intermediate" || editCourse.level === "advanced" ? editCourse.level : "beginner")
    setType(editCourse.type === "recorded" || editCourse.type === "live" || editCourse.type === "hybrid" ? editCourse.type : "recorded")
    setLanguage(editCourse.language ?? "English")
    setThumbnail(editCourse.thumbnail ?? "")
    setPrice(String(editCourse.price ?? ""))
    setOriginalPrice(String(editCourse.originalPrice ?? ""))
    setOutcomesStr((editCourse.outcomes ?? []).join("\n"))
    setRequirementsStr((editCourse.requirements ?? []).join("\n"))
    data.getSectionsByCourseId(editCourseId).then((secs) => {
      const sorted = [...secs].sort((a, b) => a.order - b.order)
      setSections(sorted.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        lessons: (s.lessons ?? []).map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type ?? "video",
          duration: (l as { duration?: string }).duration ?? "10 min",
          isFree: !!(l as { isFree?: boolean }).isFree,
          order: l.order,
        })),
      })))
    }).catch(() => { editLoadedRef.current = false })
  }, [editCourseId, editCourse])

  const addSection = () => {
    setSections(prev => [...prev, { id: `new-s${Date.now()}`, title: "New Section", order: prev.length + 1, lessons: [] }])
  }

  const saveCourse = async (status: "draft" | "published") => {
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to save the course")
      return
    }
    if (!title.trim()) {
      toast.error("Enter a course title")
      return
    }
    setSaving(true)
    try {
      const outcomes = outcomesStr.split("\n").map((o) => o.trim()).filter(Boolean)
      const requirements = requirementsStr.split("\n").map((r) => r.trim()).filter(Boolean)
      const sectionsPayload = sections.map((s, i) => ({
        id: s.id,
        title: s.title,
        order: i + 1,
        lessons: (s.lessons ?? []).map((l, j) => ({
          id: l.id,
          sectionId: s.id,
          title: l.title,
          type: l.type ?? "video",
          duration: (l as { duration?: string }).duration ?? "10 min",
          isFree: !!(l as { isFree?: boolean }).isFree,
          order: j + 1,
        })),
      }))
      const payload = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        categoryId: categoryId || undefined,
        level,
        type,
        language,
        price: Math.max(0, Number(price) || 0),
        originalPrice: Math.max(0, Number(originalPrice) || 0),
        outcomes,
        requirements,
        forWho: [],
        thumbnail: thumbnail || undefined,
        sections: sectionsPayload,
        status,
      }
      const isEdit = !!(editCourseId ?? courseId)
      const targetId = editCourseId ?? courseId
      const res = await fetch(
        isEdit ? `/api/instructor/courses/${targetId}` : "/api/instructor/courses",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(isEdit ? payload : payload),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error || "Failed to save course")
        return
      }
      const resData = (await res.json()) as { courseId?: string }
      if (!isEdit) setCourseId(resData.courseId ?? null)
      if (status === "published") {
        toast.success("Course published! It will appear on the courses page.")
        router.push(successRedirect)
      } else {
        toast.success(isEdit ? "Course updated." : "Course saved as draft. Publish from Settings or My Courses.")
      }
    } finally {
      setSaving(false)
    }
  }

  const publishCourse = async () => {
    await saveCourse("published")
  }

  const addLesson = (sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, lessons: [...s.lessons, { id: `new-l${Date.now()}`, title: "New Lesson", type: "video", duration: "10 min", isFree: false, order: s.lessons.length + 1 }] }
        : s
    ))
  }

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s
    ))
  }

  const lessonTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-3.5 w-3.5" />
      case "quiz": return <ClipboardList className="h-3.5 w-3.5" />
      case "assignment": return <FileText className="h-3.5 w-3.5" />
      default: return <BookOpen className="h-3.5 w-3.5" />
    }
  }

  if (editCourseId && editLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          {backHref && backLabel && (
            <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
          )}
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">{courseId ? "Edit Course" : "Course Builder"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courseId ? "Update your course" : "Create a new course step by step"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" /> Preview</Button>
          <Button className="gap-2" onClick={() => saveCourse("draft")} disabled={saving}><Save className="h-4 w-4" /> Save Draft</Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card className="border border-border">
            <CardHeader><CardTitle className="text-base">Course Details</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Course Title</Label>
                <Input placeholder="e.g., Complete Web Development Bootcamp" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Short Description</Label>
                <Input placeholder="One-line course summary (max 100 chars)" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Full Description</Label>
                <Textarea placeholder="Detailed course description..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v)}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recorded">Recorded</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Bilingual (EN + HI)">Bilingual (EN + HI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label>Course Thumbnail</Label>
                  <Tabs value={thumbnailMode} onValueChange={(v) => setThumbnailMode(v as "url" | "upload")} className="w-full">
                    <TabsList className="grid w-full max-w-xs grid-cols-2">
                      <TabsTrigger value="url" className="gap-1.5"><Link2 className="h-3.5 w-3.5" /> Link (URL)</TabsTrigger>
                      <TabsTrigger value="upload" className="gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload image</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-3">
                      <Input placeholder="https://example.com/thumb.jpg" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
                    </TabsContent>
                    <TabsContent value="upload" className="mt-3">
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:cursor-pointer cursor-pointer"
                          disabled={thumbnailUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file || !firebaseUser) return
                            setThumbnailUploading(true)
                            try {
                              const storage = getFirebaseStorage()
                              const path = `courses/thumbnails/${firebaseUser.uid}/${Date.now()}_${file.name}`
                              const storageRef = ref(storage, path)
                              await uploadBytes(storageRef, file)
                              const url = await getDownloadURL(storageRef)
                              setThumbnail(url)
                              toast.success("Image uploaded")
                            } catch (err) {
                              toast.error("Upload failed. Try a smaller image or use a link instead.")
                            } finally {
                              setThumbnailUploading(false)
                              e.target.value = ""
                            }
                          }}
                        />
                        {thumbnailUploading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</p>}
                        {thumbnail && thumbnailMode === "upload" && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                            <img src={thumbnail} alt="Thumbnail preview" className="h-24 w-auto rounded border border-border object-cover" />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Learning Outcomes (one per line)</Label>
                <Textarea placeholder="What students will learn..." rows={4} value={outcomesStr} onChange={(e) => setOutcomesStr(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Requirements (one per line)</Label>
                <Textarea placeholder="Prerequisites for this course..." rows={3} value={requirementsStr} onChange={(e) => setRequirementsStr(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="mt-4">
          <div className="flex flex-col gap-4">
            {sections.map((section) => (
              <Card key={section.id} className="border border-border">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Input
                      value={section.title}
                      onChange={e => {
                        const v = e.target.value
                        setSections(prev => prev.map(s => s.id === section.id ? { ...s, title: v } : s))
                      }}
                      className="h-8 text-sm font-semibold"
                    />
                    <Badge variant="secondary" className="text-[10px]">{section.lessons.length} lessons</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSection(section.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pb-4">
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                      {lessonTypeIcon(lesson.type)}
                      <Input
                        value={lesson.title}
                        onChange={e => {
                          const v = e.target.value
                          setSections(prev => prev.map(s =>
                            s.id === section.id
                              ? { ...s, lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, title: v } : l) }
                              : s
                          ))
                        }}
                        className="h-7 flex-1 text-sm"
                      />
                      <Select
                        value={lesson.type}
                        onValueChange={v => {
                          setSections(prev => prev.map(s =>
                            s.id === section.id
                              ? { ...s, lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, type: v } : l) }
                              : s
                          ))
                        }}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Free</span>
                        <Switch checked={lesson.isFree} onCheckedChange={v => {
                          setSections(prev => prev.map(s =>
                            s.id === section.id
                              ? { ...s, lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, isFree: v } : l) }
                              : s
                          ))
                        }} />
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeLesson(section.id, lesson.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="mt-1 gap-1.5 self-start text-xs" onClick={() => addLesson(section.id)}>
                    <Plus className="h-3 w-3" /> Add Lesson
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="gap-2 self-start" onClick={addSection}>
              <Plus className="h-4 w-4" /> Add Section
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card className="border border-border">
            <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Selling Price (INR)</Label>
                  <Input type="number" placeholder="4999" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Original/MRP Price (INR)</Label>
                  <Input type="number" placeholder="9999" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Set the original price higher than the selling price to show a discount badge on the course card.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="border border-border">
            <CardHeader><CardTitle className="text-base">Course Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Certificate on Completion</p>
                  <p className="text-xs text-muted-foreground">Automatically issue a certificate when students finish all modules</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Drip Content</p>
                  <p className="text-xs text-muted-foreground">Release modules on a schedule instead of all at once</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Discussion Forum</p>
                  <p className="text-xs text-muted-foreground">Allow students to post questions and discussions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="self-start" onClick={publishCourse} disabled={saving}>
                {courseId ? "Publish Course" : "Save & Publish Course"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
