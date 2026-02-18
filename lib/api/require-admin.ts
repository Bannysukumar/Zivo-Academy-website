import { NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export async function requireAdmin(req: Request): Promise<
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization")
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!idToken) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken)
    const uid = decoded.uid
    const db = getAdminFirestore()
    const userSnap = await db.collection(COLLECTIONS.users).doc(uid).get()
    const role = userSnap.exists ? (userSnap.data()?.role as string) : null
    if (role !== "admin" && role !== "superadmin") {
      return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    }
    return { ok: true, uid }
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
}
