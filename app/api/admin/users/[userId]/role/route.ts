import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/require-admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_ROLES = ["student", "instructor", "admin", "superadmin"] as const

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  const { userId } = await params
  const body = await req.json().catch(() => ({})) as { role?: string }
  const role = body.role
  if (!role || typeof role !== "string" || !ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
    return NextResponse.json(
      { error: "role must be one of: student, instructor, admin, superadmin" },
      { status: 400 }
    )
  }

  const db = getAdminFirestore()
  const userRef = db.collection(COLLECTIONS.users).doc(userId)
  const snap = await userRef.get()
  if (!snap.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await userRef.update({ role })
  return NextResponse.json({ ok: true, role })
}
