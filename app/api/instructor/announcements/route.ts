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
      message?: string
    }
    const { courseId, title, message } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Announcement title is required" }, { status: 400 })
    }

    const db = getAdminFirestore()
    let courseTitle = "All Courses"
    const resolvedCourseId = courseId && typeof courseId === "string" && courseId !== "all" ? courseId : "all"

    if (resolvedCourseId !== "all") {
      const courseRef = db.collection(COLLECTIONS.courses).doc(resolvedCourseId)
      const courseSnap = await courseRef.get()
      if (!courseSnap.exists) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      const courseData = courseSnap.data()!
      if ((courseData.instructorId as string) !== instructor.uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      courseTitle = (courseData.title as string) ?? ""
    }

    const now = new Date().toISOString()

    const announcementRef = db.collection(COLLECTIONS.announcements).doc()
    await announcementRef.set({
      instructorId: instructor.uid,
      courseId: resolvedCourseId,
      courseTitle,
      title: String(title).trim(),
      message: String(message ?? "").trim(),
      createdAt: now,
    })

    return NextResponse.json({ ok: true, announcementId: announcementRef.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("Create announcement error:", e)
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 })
  }
}
