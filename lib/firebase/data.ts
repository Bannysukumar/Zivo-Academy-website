"use client"

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  type DocumentData,
} from "firebase/firestore"
import { getFirestoreDb } from "./client"
import { COLLECTIONS } from "./collections"
import type {
  Assignment,
  AssignmentSubmission,
  Announcement,
  Category,
  Course,
  Certificate,
  CertificateTemplate,
  Enrollment,
  LiveSession,
  Review,
  Section,
  User,
  Testimonial,
  Notification,
  SupportTicket,
  Coupon,
  Payment,
  ReferralEarning,
  ReferralWallet,
  ReferralWithdrawal,
  AuditLog,
} from "@/lib/types"

const db = () => getFirestoreDb()

function mapDoc<T>(id: string, data: DocumentData): T {
  return { id, ...data } as T
}

function mapSnapshots<T>(snaps: { id: string; data: DocumentData }[]): T[] {
  return snaps.map((s) => mapDoc<T>(s.id, s.data))
}

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.categories))
  return mapSnapshots<Category>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getCourses(options?: { publishedOnly?: boolean }): Promise<Course[]> {
  const coll = collection(db(), COLLECTIONS.courses)
  if (options?.publishedOnly) {
    const all = await getDocs(coll)
    const list = mapSnapshots<Course>(all.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    const published = list.filter((c) => String(c.status) === "published")
    published.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    return published
  }
  try {
    const q = query(coll, orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    return mapSnapshots<Course>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const all = await getDocs(coll)
    const list = mapSnapshots<Course>(all.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    return list
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const q = query(collection(db(), COLLECTIONS.courses), where("slug", "==", slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return mapDoc<Course>(d.id, d.data() ?? {})
}

export async function getCourseById(id: string): Promise<Course | null> {
  const ref = doc(db(), COLLECTIONS.courses, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapDoc<Course>(snap.id, snap.data() ?? {})
}

export async function getSectionsByCourseId(courseId: string): Promise<Section[]> {
  const q = query(
    collection(db(), COLLECTIONS.sections),
    where("courseId", "==", courseId),
    orderBy("order", "asc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<Section>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getReviewsByCourseId(courseId: string): Promise<Review[]> {
  const q = query(
    collection(db(), COLLECTIONS.reviews),
    where("courseId", "==", courseId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<Review>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getUserById(uid: string): Promise<User | null> {
  const ref = doc(db(), COLLECTIONS.users, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapDoc<User>(snap.id, snap.data())
}

export async function getEnrollmentsByUserId(userId: string): Promise<Enrollment[]> {
  const q = query(
    collection(db(), COLLECTIONS.enrollments),
    where("userId", "==", userId),
    orderBy("enrolledAt", "desc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<Enrollment>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getLiveSessions(options?: { status?: "upcoming" | "live" | "completed" }): Promise<LiveSession[]> {
  let q = query(collection(db(), COLLECTIONS.liveSessions), orderBy("scheduledAt", "desc"))
  if (options?.status) {
    q = query(
      collection(db(), COLLECTIONS.liveSessions),
      where("status", "==", options.status),
      orderBy("scheduledAt", "asc")
    )
  }
  const snap = await getDocs(q)
  return mapSnapshots<LiveSession>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getCertificatesByUserId(userId: string): Promise<Certificate[]> {
  const q = query(
    collection(db(), COLLECTIONS.certificates),
    where("userId", "==", userId),
    orderBy("issuedAt", "desc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<Certificate>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.testimonials))
  return mapSnapshots<Testimonial>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db(), COLLECTIONS.notifications),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  )
  const snap = await getDocs(q)
  return mapSnapshots<Notification>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getTicketsByUserId(userId: string): Promise<SupportTicket[]> {
  const coll = collection(db(), COLLECTIONS.supportTickets)
  try {
    const q = query(
      coll,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const snap = await getDocs(q)
    return mapSnapshots<SupportTicket>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const q = query(coll, where("userId", "==", userId))
    const snap = await getDocs(q)
    const list = mapSnapshots<SupportTicket>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }
}

export async function getReferralEarningsByReferrerId(referrerId: string): Promise<ReferralEarning[]> {
  const q = query(
    collection(db(), COLLECTIONS.referralEarnings),
    where("referrerId", "==", referrerId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<ReferralEarning>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getReferralWallet(userId: string): Promise<ReferralWallet | null> {
  const q = query(collection(db(), COLLECTIONS.referralWallets), where("userId", "==", userId), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].data() as ReferralWallet
}

export async function getReferralWithdrawalsByUserId(userId: string): Promise<ReferralWithdrawal[]> {
  const q = query(
    collection(db(), COLLECTIONS.referralWithdrawals),
    where("userId", "==", userId),
    orderBy("requestedAt", "desc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<ReferralWithdrawal>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

// Admin / instructor: all users, payments, enrollments, courses, coupons, certificates, tickets, audit logs
export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.users))
  return mapSnapshots<User>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getAllPayments(): Promise<Payment[]> {
  const coll = collection(db(), COLLECTIONS.payments)
  try {
    const q = query(coll, orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    return mapSnapshots<Payment>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const snap = await getDocs(coll)
    const list = mapSnapshots<Payment>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }
}

export async function getAllEnrollments(): Promise<Enrollment[]> {
  const coll = collection(db(), COLLECTIONS.enrollments)
  try {
    const q = query(coll, orderBy("enrolledAt", "desc"))
    const snap = await getDocs(q)
    return mapSnapshots<Enrollment>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const snap = await getDocs(coll)
    const list = mapSnapshots<Enrollment>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.enrolledAt ?? "").localeCompare(a.enrolledAt ?? ""))
  }
}

export async function getCoursesByInstructorId(instructorId: string): Promise<Course[]> {
  const coll = collection(db(), COLLECTIONS.courses)
  try {
    const q = query(
      coll,
      where("instructorId", "==", instructorId),
      orderBy("updatedAt", "desc")
    )
    const snap = await getDocs(q)
    return mapSnapshots<Course>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch (e) {
    const msg = String(e)
    if (msg.includes("index") || msg.includes("FAILED_PRECONDITION")) {
      const all = await getDocs(query(coll, orderBy("createdAt", "desc")))
      const list = mapSnapshots<Course>(all.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
      return list.filter((c) => c.instructorId === instructorId).sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    }
    throw e
  }
}

export async function getAssignmentsByInstructorId(instructorId: string): Promise<Assignment[]> {
  try {
    const q = query(
      collection(db(), COLLECTIONS.assignments),
      where("instructorId", "==", instructorId),
      orderBy("createdAt", "desc")
    )
    const snap = await getDocs(q)
    return mapSnapshots<Assignment>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const all = await getDocs(collection(db(), COLLECTIONS.assignments))
    const list = mapSnapshots<Assignment>(all.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.filter((a) => a.instructorId === instructorId).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }
}

export async function getAnnouncementsByInstructorId(instructorId: string): Promise<Announcement[]> {
  try {
    const q = query(
      collection(db(), COLLECTIONS.announcements),
      where("instructorId", "==", instructorId),
      orderBy("createdAt", "desc")
    )
    const snap = await getDocs(q)
    return mapSnapshots<Announcement>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const all = await getDocs(collection(db(), COLLECTIONS.announcements))
    const list = mapSnapshots<Announcement>(all.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.filter((a) => a.instructorId === instructorId).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }
}

export async function getSubmissionsByInstructorId(instructorId: string): Promise<AssignmentSubmission[]> {
  const q = query(
    collection(db(), COLLECTIONS.assignmentSubmissions),
    where("instructorId", "==", instructorId),
    orderBy("submittedAt", "desc")
  )
  const snap = await getDocs(q)
  return mapSnapshots<AssignmentSubmission>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.coupons))
  return mapSnapshots<Coupon>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getCertificateTemplate(): Promise<CertificateTemplate | null> {
  const ref = doc(db(), COLLECTIONS.certificateTemplates, "default")
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapDoc<CertificateTemplate>(snap.id, snap.data() ?? {})
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const q = query(collection(db(), COLLECTIONS.certificates), orderBy("issuedAt", "desc"))
  const snap = await getDocs(q)
  return mapSnapshots<Certificate>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  const coll = collection(db(), COLLECTIONS.supportTickets)
  try {
    const q = query(coll, orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    return mapSnapshots<SupportTicket>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const snap = await getDocs(coll)
    const list = mapSnapshots<SupportTicket>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }
}

export async function getAllReferralEarnings(): Promise<ReferralEarning[]> {
  const coll = collection(db(), COLLECTIONS.referralEarnings)
  try {
    const q = query(coll, orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    return mapSnapshots<ReferralEarning>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const snap = await getDocs(coll)
    const list = mapSnapshots<ReferralEarning>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }
}

export async function getAllReferralWithdrawals(): Promise<ReferralWithdrawal[]> {
  const coll = collection(db(), COLLECTIONS.referralWithdrawals)
  try {
    const q = query(coll, orderBy("requestedAt", "desc"))
    const snap = await getDocs(q)
    return mapSnapshots<ReferralWithdrawal>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const snap = await getDocs(coll)
    const list = mapSnapshots<ReferralWithdrawal>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.requestedAt ?? "").localeCompare(a.requestedAt ?? ""))
  }
}

export async function getAllReferralWallets(): Promise<ReferralWallet[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.referralWallets))
  return snap.docs.map((d) => d.data() as ReferralWallet)
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const coll = collection(db(), COLLECTIONS.auditLogs)
  try {
    const q = query(coll, orderBy("createdAt", "desc"), limit(100))
    const snap = await getDocs(q)
    return mapSnapshots<AuditLog>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
  } catch {
    const snap = await getDocs(coll)
    const list = mapSnapshots<AuditLog>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
    return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, 100)
  }
}

export async function getAllReviews(): Promise<Review[]> {
  const q = query(collection(db(), COLLECTIONS.reviews), orderBy("createdAt", "desc"), limit(200))
  const snap = await getDocs(q)
  return mapSnapshots<Review>(snap.docs.map((d) => ({ id: d.id, data: d.data() ?? {} })))
}
