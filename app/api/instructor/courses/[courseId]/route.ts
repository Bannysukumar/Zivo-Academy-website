import { NextResponse } from "next/server"
import { requireInstructor } from "@/lib/api/require-instructor"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const instructor = await requireInstructor(req)
  if (!instructor.ok) return instructor.response

  const { courseId } = await params
  const db = getAdminFirestore()
  const courseRef = db.collection(COLLECTIONS.courses).doc(courseId)
  const courseSnap = await courseRef.get()
  if (!courseSnap.exists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  const data = courseSnap.data()!
  const instructorId = data.instructorId as string
  const isAdmin = instructor.role === "admin" || instructor.role === "superadmin"
  if (instructorId !== instructor.uid && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      status?: string
      title?: string
      shortDescription?: string
      description?: string
      categoryId?: string
      level?: string
      type?: string
      language?: string
      price?: number
      originalPrice?: number
      outcomes?: string[]
      requirements?: string[]
      forWho?: string[]
      thumbnail?: string
      sections?: { id: string; title: string; order: number; lessons: { id: string; sectionId: string; title: string; type: string; duration: string; isFree: boolean; order: number }[] }[]
    }

    const updatedAt = new Date().toISOString().slice(0, 10)

    if (body.title != null && typeof body.title === "string" && body.title.trim().length > 0) {
      const categorySnap = body.categoryId
        ? await db.collection(COLLECTIONS.categories).doc(body.categoryId).get()
        : null
      const categoryName = categorySnap?.exists ? (categorySnap.data()?.name as string) ?? "" : ""
      const lessonsCount = (body.sections ?? []).reduce((acc, s) => acc + (s.lessons?.length ?? 0), 0)
      const courseUpdates: Record<string, unknown> = {
        title: body.title.trim(),
        shortDescription: String(body.shortDescription ?? "").trim().slice(0, 200),
        description: String(body.description ?? "").trim(),
        thumbnail: body.thumbnail ? String(body.thumbnail).trim() : "",
        categoryId: body.categoryId ?? "",
        categoryName,
        level: body.level === "beginner" || body.level === "intermediate" || body.level === "advanced" ? body.level : "beginner",
        type: body.type === "recorded" || body.type === "live" || body.type === "hybrid" ? body.type : "recorded",
        language: String(body.language ?? "English").trim(),
        price: Math.max(0, Number(body.price) || 0),
        originalPrice: Math.max(0, Number(body.originalPrice) || 0),
        outcomes: Array.isArray(body.outcomes) ? body.outcomes.filter((o) => typeof o === "string") : [],
        requirements: Array.isArray(body.requirements) ? body.requirements.filter((r) => typeof r === "string") : [],
        forWho: Array.isArray(body.forWho) ? body.forWho.filter((f) => typeof f === "string") : [],
        duration: `${Math.max(0, lessonsCount)} lessons`,
        lessonsCount,
        updatedAt,
      }
      if (body.status === "published" || body.status === "draft" || body.status === "unpublished") {
        courseUpdates.status = body.status
      }
      await courseRef.update(courseUpdates)

      const sectionList = Array.isArray(body.sections) ? body.sections : []
      const existingSections = await db.collection(COLLECTIONS.sections).where("courseId", "==", courseId).get()
      const batch = db.batch()
      existingSections.docs.forEach((d) => batch.delete(d.ref))
      for (let i = 0; i < sectionList.length; i++) {
        const sec = sectionList[i]
        const sectionRef = db.collection(COLLECTIONS.sections).doc()
        const sectionId = sectionRef.id
        const lessons = (sec.lessons ?? []).map((l, idx) => ({
          id: l.id?.startsWith("new-") ? `l-${sectionId}-${idx}` : l.id,
          sectionId,
          title: String(l.title ?? "").trim(),
          type: l.type ?? "video",
          duration: (l as { duration?: string }).duration ?? "10 min",
          isFree: !!(l as { isFree?: boolean }).isFree,
          order: idx + 1,
        }))
        batch.set(sectionRef, {
          courseId,
          title: String(sec.title ?? "").trim(),
          order: i + 1,
          lessons,
        })
      }
      await batch.commit()
      return NextResponse.json({ ok: true, status: (courseUpdates as { status?: string }).status })
    }

    const updates: Record<string, unknown> = { updatedAt }
    if (body.status === "published" || body.status === "draft" || body.status === "unpublished") {
      updates.status = body.status
    }
    await courseRef.update(updates)
    return NextResponse.json({ ok: true, status: updates.status })
  } catch (e) {
    console.error("Update course error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const instructor = await requireInstructor(_req)
  if (!instructor.ok) return instructor.response

  const { courseId } = await params
  const firestore = getAdminFirestore()
  const courseRef = firestore.collection(COLLECTIONS.courses).doc(courseId)
  const courseSnap = await courseRef.get()
  if (!courseSnap.exists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  const data = courseSnap.data()!
  const instructorId = data.instructorId as string
  const isAdmin = instructor.role === "admin" || instructor.role === "superadmin"
  if (instructorId !== instructor.uid && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const sectionsSnap = await firestore.collection(COLLECTIONS.sections).where("courseId", "==", courseId).get()
    const batch = firestore.batch()
    sectionsSnap.docs.forEach((d) => batch.delete(d.ref))
    batch.delete(courseRef)
    await batch.commit()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Delete course error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
