import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken)
    const uid = decoded.uid
    const db = getAdminFirestore()
    const userSnap = await db.collection(COLLECTIONS.users).doc(uid).get()
    const userName = userSnap.exists ? (userSnap.data()?.name as string) ?? "User" : "User"

    const body = await req.json()
    const subject = typeof body.subject === "string" ? body.subject.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      )
    }

    const ref = db.collection(COLLECTIONS.supportTickets).doc()
    const createdAt = new Date().toISOString()
    await ref.set({
      userId: uid,
      userName,
      subject,
      message,
      status: "open",
      createdAt,
      replies: [],
    })

    return NextResponse.json({
      id: ref.id,
      subject,
      status: "open",
      createdAt,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
