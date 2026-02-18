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
    const body = await req.json().catch(() => ({})) as {
      courseId?: string
      title?: string
      description?: string
      scheduledAt?: string
      duration?: string
      meetLink?: string
    }
    const { courseId, title, description, scheduledAt, duration, meetLink } = body

    if (!courseId || typeof courseId !== "string" || !title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Course and session title are required" }, { status: 400 })
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

    const courseTitle = (courseData.title as string) ?? ""

    const sessionData: Record<string, string> = {
      instructorId: instructor.uid,
      courseId,
      courseTitle,
      title: String(title).trim(),
      description: String(description ?? "").trim(),
      scheduledAt: typeof scheduledAt === "string" && scheduledAt.trim() ? scheduledAt.trim() : new Date().toISOString(),
      duration: String(duration ?? "60 min").trim(),
      meetLink: String(meetLink ?? "").trim(),
      status: "upcoming",
    }

    const sessionRef = db.collection(COLLECTIONS.liveSessions).doc()
    await sessionRef.set(sessionData)

    return NextResponse.json({ ok: true, sessionId: sessionRef.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("Create live session error:", e)
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 })
  }
}
