import { NextResponse } from "next/server"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"
import { requireAdmin } from "@/lib/api/require-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MASK = "••••••••"

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const db = getAdminFirestore()
    const [razorpaySnap, referralSnap] = await Promise.all([
      db.collection(COLLECTIONS.settings).doc("razorpay").get(),
      db.collection(COLLECTIONS.settings).doc("referral").get(),
    ])

    const razorpayData = razorpaySnap.exists ? razorpaySnap.data() : {}
    const referralData = referralSnap.exists ? referralSnap.data() : {}

    return NextResponse.json({
      razorpay: {
        keyId: razorpayData?.keyId ?? "",
        keySecret: (razorpayData?.keySecret as string) ? MASK : "",
        webhookSecret: (razorpayData?.webhookSecret as string) ? MASK : "",
      },
      referral: {
        referralPercent: Number(referralData?.referralPercent) || 10,
        minWithdrawalAmount: Number(referralData?.minWithdrawalAmount) || 500,
      },
    })
  } catch (e) {
    console.error("Get settings error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json() as { section?: string; data?: Record<string, unknown> }
    const section = body.section === "referral" ? "referral" : body.section === "razorpay" ? "razorpay" : null
    const data = body.data && typeof body.data === "object" ? body.data : null
    if (!section || !data) {
      return NextResponse.json({ error: "section and data required" }, { status: 400 })
    }

    const db = getAdminFirestore()
    const ref = db.collection(COLLECTIONS.settings).doc(section)

    if (section === "razorpay") {
      const keyId = typeof data.keyId === "string" ? data.keyId.trim() : undefined
      const keySecret = typeof data.keySecret === "string" ? data.keySecret.trim() : undefined
      const webhookSecret = typeof data.webhookSecret === "string" ? data.webhookSecret.trim() : undefined
      const snap = await ref.get()
      const existing = snap.exists ? (snap.data() ?? {}) : {}
      const update: Record<string, string> = {}
      if (keyId !== undefined) update.keyId = keyId
      if (keySecret !== undefined && keySecret !== "" && keySecret !== MASK) update.keySecret = keySecret
      else if (existing.keySecret !== undefined) update.keySecret = existing.keySecret as string
      if (webhookSecret !== undefined && webhookSecret !== "" && webhookSecret !== MASK) update.webhookSecret = webhookSecret
      else if (existing.webhookSecret !== undefined) update.webhookSecret = existing.webhookSecret as string
      await ref.set(update, { merge: true })
    } else {
      const referralPercent = typeof data.referralPercent === "number" ? data.referralPercent : Number(data.referralPercent)
      const minWithdrawalAmount = typeof data.minWithdrawalAmount === "number" ? data.minWithdrawalAmount : Number(data.minWithdrawalAmount)
      await ref.set(
        {
          referralPercent: Math.min(100, Math.max(0, referralPercent || 10)),
          minWithdrawalAmount: Math.min(1000000, Math.max(0, minWithdrawalAmount || 500)),
        },
        { merge: true }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Patch settings error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
