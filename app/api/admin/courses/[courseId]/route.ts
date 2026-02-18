import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/require-admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const admin = await requireAdmin(_req)
  if (!admin.ok) return admin.response

  const { courseId } = await params
  const db = getAdminFirestore()
  const courseRef = db.collection(COLLECTIONS.courses).doc(courseId)
  const courseSnap = await courseRef.get()
  if (!courseSnap.exists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  try {
    const sectionsSnap = await db.collection(COLLECTIONS.sections).where("courseId", "==", courseId).get()
    const batch = db.batch()
    sectionsSnap.docs.forEach((d) => batch.delete(d.ref))
    batch.delete(courseRef)
    await batch.commit()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Admin delete course error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
