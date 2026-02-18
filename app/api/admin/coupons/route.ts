import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/require-admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  try {
    const body = await req.json().catch(() => ({})) as {
      code?: string
      type?: string
      value?: number
      maxUses?: number
      expiresAt?: string
    }
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const type = body.type === "flat" ? "flat" : "percent"
    const value = Math.max(0, Number(body.value) || 0)
    const maxUses = Math.max(1, Math.floor(Number(body.maxUses) || 1))
    let expiresAt = ""
    if (body.expiresAt && typeof body.expiresAt === "string" && body.expiresAt.trim()) {
      expiresAt = body.expiresAt.trim()
    }

    const db = getAdminFirestore()
    const couponsRef = db.collection(COLLECTIONS.coupons)
    const existing = await couponsRef.where("code", "==", code).limit(1).get()
    if (!existing.empty) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 })
    }

    const docRef = couponsRef.doc()
    const data: Record<string, unknown> = {
      code,
      type,
      value,
      maxUses,
      usedCount: 0,
      courseIds: [],
      active: true,
    }
    if (expiresAt) data.expiresAt = expiresAt
    await docRef.set(data)

    return NextResponse.json({ ok: true, couponId: docRef.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("Create coupon error:", e)
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 })
  }
}
