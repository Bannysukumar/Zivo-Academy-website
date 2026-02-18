import { NextResponse } from "next/server"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = (searchParams.get("code") ?? "").trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 })
  }

  try {
    const db = getAdminFirestore()
    const snap = await db.collection(COLLECTIONS.coupons).where("code", "==", code).limit(1).get()
    if (snap.empty) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" }, { status: 200 })
    }

    const doc = snap.docs[0]
    const data = doc.data()
    const active = data?.active === true
    const maxUses = Number(data?.maxUses) ?? 0
    const usedCount = Number(data?.usedCount) ?? 0
    const expiresAt = data?.expiresAt as string | undefined
    const type = data?.type === "flat" ? "flat" : "percent"
    const value = Math.max(0, Number(data?.value) ?? 0)

    if (!active) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" }, { status: 200 })
    }
    if (maxUses > 0 && usedCount >= maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" }, { status: 200 })
    }
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 200 })
    }

    return NextResponse.json({
      valid: true,
      code: data?.code ?? code,
      type,
      value,
    })
  } catch (e) {
    console.error("Validate coupon error:", e)
    return NextResponse.json({ valid: false, error: "Could not validate coupon" }, { status: 500 })
  }
}
