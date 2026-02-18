import { NextResponse } from "next/server"
import { requireInstructor } from "@/lib/api/require-instructor"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const instructor = await requireInstructor(req)
  if (!instructor.ok) return instructor.response

  const { sessionId } = await params
  const db = getAdminFirestore()
  const sessionRef = db.collection(COLLECTIONS.liveSessions).doc(sessionId)
  const sessionSnap = await sessionRef.get()
  if (!sessionSnap.exists) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  const data = sessionSnap.data()!
  if (data.instructorId === instructor.uid) {
    // ok
  } else if (data.courseId) {
    const courseSnap = await db.collection(COLLECTIONS.courses).doc(data.courseId as string).get()
    if (!courseSnap.exists || (courseSnap.data()?.instructorId as string) !== instructor.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      title?: string
      description?: string
      scheduledAt?: string
      duration?: string
      meetLink?: string
    }
    const updates: Record<string, string> = {}
    if (body.title != null && typeof body.title === "string") updates.title = body.title.trim()
    if (body.description != null && typeof body.description === "string") updates.description = body.description.trim()
    if (body.scheduledAt != null && typeof body.scheduledAt === "string") updates.scheduledAt = body.scheduledAt.trim()
    if (body.duration != null && typeof body.duration === "string") updates.duration = body.duration.trim()
    if (body.meetLink != null && typeof body.meetLink === "string") updates.meetLink = body.meetLink.trim()
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true })
    }
    await sessionRef.update(updates)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("Update live session error:", e)
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 })
  }
}
