"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Save, Eye, Plus, Trash2, GripVertical, Video, FileText, ClipboardList, BookOpen } from "lucide-react"
import { mockCategories } from "@/lib/mock-data"
import { toast } from "sonner"

export default function CourseBuilderPage() {
  const [sections, setSections] = useState([
    {
      id: "new-s1", title: "Getting Started", lessons: [
        { id: "new-l1", title: "Introduction", type: "video", duration: "10 min", isFree: true },
        { id: "new-l2", title: "Setup Guide", type: "video", duration: "15 min", isFree: false },
      ]
    }
  ])

  const addSection = () => {
    setSections(prev => [...prev, { id: `new-s${Date.now()}`, title: "New Section", lessons: [] }])
  }

  const addLesson = (sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, lessons: [...s.lessons, { id: `new-l${Date.now()}`, title: "New Lesson", type: "video", duration: "10 min", isFree: false }] }
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Course Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create a new course step by step</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" /> Preview</Button>
          <Button className="gap-2" onClick={() => toast.success("Course saved as draft!")}><Save className="h-4 w-4" /> Save Draft</Button>
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
                <Input placeholder="e.g., Complete Web Development Bootcamp" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Short Description</Label>
                <Input placeholder="One-line course summary (max 100 chars)" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Full Description</Label>
                <Textarea placeholder="Detailed course description..." rows={5} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Level</Label>
                  <Select>
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
                  <Select>
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
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="bilingual">Bilingual (EN + HI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Course Thumbnail</Label>
                  <div className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground hover:border-primary">
                    Click to upload image
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Learning Outcomes (one per line)</Label>
                <Textarea placeholder="What students will learn..." rows={4} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Requirements (one per line)</Label>
                <Textarea placeholder="Prerequisites for this course..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="mt-4">
          <div className="flex flex-col gap-4">
            {sections.map((section, si) => (
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
                  {section.lessons.map((lesson, li) => (
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
                  <Input type="number" placeholder="4999" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Original/MRP Price (INR)</Label>
                  <Input type="number" placeholder="9999" />
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
              <Button className="self-start" onClick={() => toast.success("Course published!")}>Publish Course</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
