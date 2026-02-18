import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

function verifySignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")
  return signature === expected
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-razorpay-signature") ?? ""
    const rawBody = await req.text()
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const payload = JSON.parse(rawBody) as {
      event: string
      payload: {
        payment?: {
          entity: {
            id: string
            order_id: string
            amount: number
            currency: string
            status: string
            notes?: Record<string, string>
          }
        }
      }
    }

    if (payload.event !== "payment.captured") {
      return NextResponse.json({ received: true })
    }

    const paymentEntity = payload.payload?.payment?.entity
    if (!paymentEntity || paymentEntity.status !== "captured") {
      return NextResponse.json({ received: true })
    }

    const notes = paymentEntity.notes ?? {}
    const userId = notes.userId
    const courseIdsStr = notes.courseIds
    if (!userId || !courseIdsStr) {
      console.error("Webhook missing userId or courseIds in notes")
      return NextResponse.json({ received: true })
    }

    const courseIds = courseIdsStr.split(",").filter(Boolean)
    const db = getAdminFirestore()
    const batch = db.batch()

    const paymentRef = db.collection(COLLECTIONS.payments).doc()
    batch.set(paymentRef, {
      userId,
      userName: notes.userName ?? "",
      courseId: courseIds[0] ?? "",
      courseTitle: notes.courseTitle ?? "",
      amount: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      status: "captured",
      razorpayOrderId: paymentEntity.order_id,
      razorpayPaymentId: paymentEntity.id,
      createdAt: new Date().toISOString(),
    })

    const userSnap = await db.collection(COLLECTIONS.users).doc(userId).get()
    const userName = userSnap.exists ? (userSnap.data()?.name as string) ?? "" : ""

    for (const courseId of courseIds) {
      const courseSnap = await db.collection(COLLECTIONS.courses).doc(courseId).get()
      const courseTitle = courseSnap.exists ? (courseSnap.data()?.title as string) ?? "" : ""
      const courseThumbnail = courseSnap.exists ? (courseSnap.data()?.thumbnail as string) ?? "" : ""
      const enrollmentRef = db.collection(COLLECTIONS.enrollments).doc()
      batch.set(enrollmentRef, {
        userId,
        courseId,
        courseTitle,
        courseThumbnail,
        progress: 0,
        enrolledAt: new Date().toISOString().slice(0, 10),
        status: "active",
      })
    }

    await batch.commit()
    return NextResponse.json({ received: true })
  } catch (e) {
    console.error("Webhook error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
