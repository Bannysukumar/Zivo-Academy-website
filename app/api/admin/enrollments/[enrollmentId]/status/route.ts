import { NextResponse } from "next/server"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"
import { requireAdmin } from "@/lib/api/require-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_STATUSES = ["active", "revoked"] as const

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const { enrollmentId } = await params
    if (!enrollmentId) {
      return NextResponse.json({ error: "enrollmentId required" }, { status: 400 })
    }

    const body = await req.json()
    const status = body.status
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "status must be one of: active, revoked" },
        { status: 400 }
      )
    }

    const db = getAdminFirestore()
    const ref = db.collection(COLLECTIONS.enrollments).doc(enrollmentId)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    await ref.update({ status })
    return NextResponse.json({ id: enrollmentId, status })
  } catch (e) {
    console.error("Admin update enrollment status error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
