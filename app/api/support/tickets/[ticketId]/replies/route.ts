import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"
import { FieldValue } from "firebase-admin/firestore"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
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
    const role = userSnap.exists ? (userSnap.data()?.role as string) : null
    const userName = userSnap.exists ? (userSnap.data()?.name as string) ?? "User" : "User"
    const isAdmin = role === "admin" || role === "superadmin"

    const { ticketId } = await params
    if (!ticketId) {
      return NextResponse.json({ error: "ticketId required" }, { status: 400 })
    }

    const ticketRef = db.collection(COLLECTIONS.supportTickets).doc(ticketId)
    const ticketSnap = await ticketRef.get()
    if (!ticketSnap.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    const ticketData = ticketSnap.data()
    const ticketUserId = ticketData?.userId as string
    if (ticketUserId !== uid && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const message = typeof body.message === "string" ? body.message.trim() : ""
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    const replyId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const createdAt = new Date().toISOString()
    const reply = {
      id: replyId,
      userId: uid,
      userName,
      message,
      createdAt,
      isAdmin,
    }

    await ticketRef.update({
      replies: FieldValue.arrayUnion(reply),
    })

    return NextResponse.json({ id: replyId, createdAt, isAdmin })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
