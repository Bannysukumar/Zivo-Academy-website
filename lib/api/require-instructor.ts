import { NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export async function requireInstructor(req: Request): Promise<
  | { ok: true; uid: string; name: string; avatar: string; role: string }
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
    if (role !== "instructor" && role !== "admin" && role !== "superadmin") {
      return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    }
    const name = (userSnap.exists ? userSnap.data()?.name : null) ?? ""
    const avatar = (userSnap.exists ? userSnap.data()?.avatar : null) ?? ""
    return { ok: true, uid, name, avatar, role: role ?? "" }
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
}
