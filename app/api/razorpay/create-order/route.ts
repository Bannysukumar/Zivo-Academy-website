import { NextResponse } from "next/server"
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function getRazorpayCredentials(): Promise<{ keyId: string; keySecret: string } | null> {
  const db = getAdminFirestore()
  const snap = await db.collection(COLLECTIONS.settings).doc("razorpay").get()
  if (snap.exists) {
    const d = snap.data()
    const keyId = (d?.keyId as string)?.trim()
    const keySecret = (d?.keySecret as string)?.trim()
    if (keyId && keySecret) return { keyId, keySecret }
  }
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (keyId && keySecret) return { keyId, keySecret }
  return null
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = await getAdminAuth().verifyIdToken(idToken)
    const userId = decoded.uid

    const creds = await getRazorpayCredentials()
    if (!creds) {
      return NextResponse.json(
        { error: "Razorpay not configured. Set keys in Admin → Settings or RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment." },
        { status: 503 }
      )
    }
    const { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET } = creds

    const body = await req.json()
    const { courseIds } = body as { courseIds?: string[] }
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: "courseIds array required" }, { status: 400 })
    }

    const db = getAdminFirestore()
    const courseDocs: { id: string; title: string; price: number; thumbnail: string }[] = []
    for (const id of courseIds) {
      const snap = await db.collection(COLLECTIONS.courses).doc(id).get()
      if (!snap.exists) {
        return NextResponse.json({ error: "Invalid course id: " + id }, { status: 400 })
      }
      const d = snap.data()!
      const price = Number(d.price ?? 0)
      courseDocs.push({
        id: snap.id,
        title: String(d.title ?? ""),
        price,
        thumbnail: String(d.thumbnail ?? ""),
      })
    }
    const totalRupees = courseDocs.reduce((s, c) => s + c.price, 0)
    const amount = Math.round(totalRupees * 100)

    const orderPayload = {
      amount: amount,
      currency: "INR",
      receipt: `zivo_${Date.now()}_${userId.slice(0, 8)}`,
      notes: {
        userId,
        courseIds: courseIds.join(","),
      },
    }

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET).toString("base64"),
      },
      body: JSON.stringify(orderPayload),
    })

    if (!razorpayRes.ok) {
      const err = await razorpayRes.text()
      console.error("Razorpay create order failed:", err)
      return NextResponse.json({ error: "Payment provider error" }, { status: 502 })
    }

    const order = (await razorpayRes.json()) as { id: string }
    return NextResponse.json({
      orderId: order.id,
      keyId: RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
    })
  } catch (e) {
    console.error("Create order error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
