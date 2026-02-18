import { NextResponse } from "next/server"
import { requireInstructor } from "@/lib/api/require-instructor"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const instructor = await requireInstructor(req)
  if (!instructor.ok) return instructor.response

  try {
    const body = await req.json().catch(() => ({})) as { courseId?: string; title?: string; description?: string; dueDate?: string }
    const { courseId, title, description, dueDate } = body

    if (!courseId || typeof courseId !== "string" || !title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Course and assignment title are required" }, { status: 400 })
    }

    const db = getAdminFirestore()
    const courseRef = db.collection(COLLECTIONS.courses).doc(courseId)
    const courseSnap = await courseRef.get()
    if (!courseSnap.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    const courseData = courseSnap.data()!
    if ((courseData.instructorId as string) !== instructor.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const courseName = (courseData.title as string) ?? ""
    const now = new Date().toISOString().slice(0, 10)

    const assignmentData: Record<string, string> = {
      instructorId: instructor.uid,
      courseId,
      courseName,
      title: String(title).trim(),
      description: String(description ?? "").trim(),
      createdAt: now,
    }
    if (dueDate && typeof dueDate === "string" && dueDate.trim()) {
      assignmentData.dueDate = dueDate.trim()
    }

    const assignmentRef = db.collection(COLLECTIONS.assignments).doc()
    await assignmentRef.set(assignmentData)

    return NextResponse.json({ ok: true, assignmentId: assignmentRef.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("Create assignment error:", e)
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 })
  }
}
