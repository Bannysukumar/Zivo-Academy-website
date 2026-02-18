import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/require-admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  const { courseId } = await params
  const body = await req.json().catch(() => ({})) as { status?: string }
  const status = body.status
  if (status !== "published" && status !== "unpublished" && status !== "draft") {
    return NextResponse.json(
      { error: "status must be published, unpublished, or draft" },
      { status: 400 }
    )
  }

  const db = getAdminFirestore()
  const courseRef = db.collection(COLLECTIONS.courses).doc(courseId)
  const snap = await courseRef.get()
  if (!snap.exists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  await courseRef.update({
    status,
    updatedAt: new Date().toISOString().slice(0, 10),
  })
  return NextResponse.json({ ok: true, status })
}
