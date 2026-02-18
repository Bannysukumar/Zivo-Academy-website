import { NextResponse } from "next/server"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"
import { requireAdmin } from "@/lib/api/require-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const userId = typeof body.userId === "string" ? body.userId.trim() : null
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : null
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "userId and courseId are required" },
        { status: 400 }
      )
    }

    const db = getAdminFirestore()
    const [userSnap, courseSnap] = await Promise.all([
      db.collection(COLLECTIONS.users).doc(userId).get(),
      db.collection(COLLECTIONS.courses).doc(courseId).get(),
    ])
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (!courseSnap.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const courseData = courseSnap.data()
    const courseTitle = (courseData?.title as string) ?? ""
    const courseThumbnail = (courseData?.thumbnail as string) ?? ""

    const enrollmentsSnap = await db
      .collection(COLLECTIONS.enrollments)
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get()
    if (!enrollmentsSnap.empty) {
      return NextResponse.json(
        { error: "User is already enrolled in this course" },
        { status: 409 }
      )
    }

    const enrolledAt = new Date().toISOString().slice(0, 10)
    const ref = db.collection(COLLECTIONS.enrollments).doc()
    await ref.set({
      userId,
      courseId,
      courseTitle,
      courseThumbnail,
      progress: 0,
      enrolledAt,
      status: "active",
    })

    return NextResponse.json({
      id: ref.id,
      userId,
      courseId,
      courseTitle,
      status: "active",
      enrolledAt,
    })
  } catch (e) {
    console.error("Admin create enrollment error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
