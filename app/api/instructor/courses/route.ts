import { NextResponse } from "next/server"
import { requireInstructor } from "@/lib/api/require-instructor"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "course"
}

export async function POST(req: Request) {
  const instructor = await requireInstructor(req)
  if (!instructor.ok) return instructor.response

  try {
    const body = await req.json()
    const {
      title,
      shortDescription,
      description,
      categoryId,
      level,
      type,
      language,
      price,
      originalPrice,
      outcomes,
      requirements,
      forWho,
      thumbnail,
      sections,
      status,
    } = body as {
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
      status?: string
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Course title is required" }, { status: 400 })
    }

    const db = getAdminFirestore()
    const categorySnap = categoryId
      ? await db.collection(COLLECTIONS.categories).doc(categoryId).get()
      : null
    const categoryName = categorySnap?.exists ? (categorySnap.data()?.name as string) ?? "" : ""

    let slug = slugify(title)
    const existing = await db.collection(COLLECTIONS.courses).where("slug", "==", slug).limit(1).get()
    if (!existing.empty) slug = `${slug}-${Date.now().toString(36)}`

    const now = new Date().toISOString().slice(0, 10)
    const courseRef = db.collection(COLLECTIONS.courses).doc()
    const courseId = courseRef.id

    const lessonsCount = (sections ?? []).reduce((acc, s) => acc + (s.lessons?.length ?? 0), 0)
    const courseData = {
      title: String(title).trim(),
      slug,
      description: String(description ?? "").trim(),
      shortDescription: String(shortDescription ?? "").trim().slice(0, 200),
      thumbnail: thumbnail ? String(thumbnail).trim() : "",
      instructorId: instructor.uid,
      instructorName: instructor.name,
      instructorAvatar: instructor.avatar,
      categoryId: categoryId ?? "",
      categoryName,
      level: level === "beginner" || level === "intermediate" || level === "advanced" ? level : "beginner",
      type: type === "recorded" || type === "live" || type === "hybrid" ? type : "recorded",
      language: String(language ?? "English").trim(),
      price: Math.max(0, Number(price) || 0),
      originalPrice: Math.max(0, Number(originalPrice) || 0),
      currency: "INR",
      rating: 0,
      reviewCount: 0,
      enrollmentCount: 0,
      duration: `${Math.max(0, lessonsCount)} lessons`,
      lessonsCount,
      status: status === "published" ? "published" : "draft",
      tags: [],
      outcomes: Array.isArray(outcomes) ? outcomes.filter((o) => typeof o === "string") : [],
      requirements: Array.isArray(requirements) ? requirements.filter((r) => typeof r === "string") : [],
      forWho: Array.isArray(forWho) ? forWho.filter((f) => typeof f === "string") : [],
      createdAt: now,
      updatedAt: now,
    }

    await courseRef.set(courseData)

    const sectionList = Array.isArray(sections) ? sections : []
    const batch = db.batch()
    for (let i = 0; i < sectionList.length; i++) {
      const sec = sectionList[i]
      const sectionRef = db.collection(COLLECTIONS.sections).doc()
      const sectionId = sectionRef.id
      const lessons = (sec.lessons ?? []).map((l: { id: string; title: string; type: string; duration: string; isFree: boolean; order: number }, idx: number) => ({
        id: l.id?.startsWith("new-") ? `l-${sectionId}-${idx}` : l.id,
        sectionId,
        title: String(l.title ?? "").trim(),
        type: l.type === "video" || l.type === "text" || l.type === "quiz" || l.type === "assignment" ? l.type : "video",
        duration: String(l.duration ?? "10 min"),
        isFree: !!l.isFree,
        order: typeof l.order === "number" ? l.order : idx + 1,
      }))
      batch.set(sectionRef, {
        courseId,
        title: String(sec.title ?? "").trim(),
        order: typeof sec.order === "number" ? sec.order : i + 1,
        lessons,
      })
    }
    await batch.commit()

    return NextResponse.json({ ok: true, courseId, slug })
  } catch (e) {
    console.error("Create course error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
