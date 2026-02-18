import { NextResponse } from "next/server"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"
import {
  mockUsers,
  mockCategories,
  mockCourses,
  mockSections,
  mockReviews,
  mockEnrollments,
  mockLiveSessions,
  mockPayments,
  mockCoupons,
  mockCertificates,
  mockTickets,
  mockReferralEarnings,
  mockReferralWallet,
  mockReferralWithdrawals,
  mockAuditLogs,
  mockTestimonials,
  mockNotifications,
  mockAssignmentSubmissions,
} from "@/lib/mock-data"

const SEARCH_PARAM_SECRET = "seed"

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    if (searchParams.get("secret") !== SEARCH_PARAM_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const db = getAdminFirestore()
    const batch = db.batch()

    const omitId = <T extends { id: string }>(obj: T) => {
      const { id, ...rest } = obj
      return rest
    }

    for (const u of mockUsers) {
      const ref = db.collection(COLLECTIONS.users).doc(u.id)
      batch.set(ref, omitId(u))
    }
    for (const c of mockCategories) {
      const ref = db.collection(COLLECTIONS.categories).doc(c.id)
      batch.set(ref, omitId(c))
    }
    for (const c of mockCourses) {
      const ref = db.collection(COLLECTIONS.courses).doc(c.id)
      batch.set(ref, omitId(c))
    }
    for (const s of mockSections) {
      const ref = db.collection(COLLECTIONS.sections).doc(s.id)
      batch.set(ref, omitId(s))
    }
    for (const r of mockReviews) {
      const ref = db.collection(COLLECTIONS.reviews).doc(r.id)
      batch.set(ref, omitId(r))
    }
    for (const e of mockEnrollments) {
      const ref = db.collection(COLLECTIONS.enrollments).doc(e.id)
      batch.set(ref, omitId(e))
    }
    for (const l of mockLiveSessions) {
      const ref = db.collection(COLLECTIONS.liveSessions).doc(l.id)
      batch.set(ref, omitId(l))
    }
    for (const p of mockPayments) {
      const ref = db.collection(COLLECTIONS.payments).doc(p.id)
      batch.set(ref, omitId(p))
    }
    for (const c of mockCoupons) {
      const ref = db.collection(COLLECTIONS.coupons).doc(c.id)
      batch.set(ref, omitId(c))
    }
    for (const c of mockCertificates) {
      const ref = db.collection(COLLECTIONS.certificates).doc(c.id)
      batch.set(ref, omitId(c))
    }
    for (const t of mockTickets) {
      const ref = db.collection(COLLECTIONS.supportTickets).doc(t.id)
      batch.set(ref, omitId(t))
    }
    for (const r of mockReferralEarnings) {
      const ref = db.collection(COLLECTIONS.referralEarnings).doc(r.id)
      batch.set(ref, omitId(r))
    }
    const walletRef = db.collection(COLLECTIONS.referralWallets).doc(mockReferralWallet.userId)
    batch.set(walletRef, mockReferralWallet)
    for (const w of mockReferralWithdrawals) {
      const ref = db.collection(COLLECTIONS.referralWithdrawals).doc(w.id)
      batch.set(ref, omitId(w))
    }
    for (const a of mockAuditLogs) {
      const ref = db.collection(COLLECTIONS.auditLogs).doc(a.id)
      batch.set(ref, omitId(a))
    }
    for (const t of mockTestimonials) {
      const ref = db.collection(COLLECTIONS.testimonials).doc(t.id)
      batch.set(ref, omitId(t))
    }
    for (const n of mockNotifications) {
      const ref = db.collection(COLLECTIONS.notifications).doc(n.id)
      batch.set(ref, omitId(n))
    }
    for (const s of mockAssignmentSubmissions) {
      const ref = db.collection(COLLECTIONS.assignmentSubmissions).doc(s.id)
      batch.set(ref, omitId(s))
    }

    await batch.commit()
    return NextResponse.json({ ok: true, message: "Firestore seeded successfully." })
  } catch (e) {
    console.error("Seed error:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    )
  }
}
