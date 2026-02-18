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
    const body = await req.json().catch(() => ({})) as { templateImageUrl?: string }
    const templateImageUrl = typeof body.templateImageUrl === "string" ? body.templateImageUrl.trim() : ""
    if (!templateImageUrl) {
      return NextResponse.json({ error: "templateImageUrl is required" }, { status: 400 })
    }

    const db = getAdminFirestore()
    const ref = db.collection(COLLECTIONS.certificateTemplates).doc("default")
    const now = new Date().toISOString()
    await ref.set({ templateImageUrl, updatedAt: now }, { merge: true })

    return NextResponse.json({ ok: true, templateImageUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("Set certificate template error:", e)
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 })
  }
}
