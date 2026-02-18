import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/require-admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  const { userId } = await params
  const body = await req.json().catch(() => ({})) as { blocked?: boolean }
  const blocked = body.blocked === true

  const db = getAdminFirestore()
  const userRef = db.collection(COLLECTIONS.users).doc(userId)
  const snap = await userRef.get()
  if (!snap.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await userRef.update({ blocked })
  return NextResponse.json({ ok: true, blocked })
}
