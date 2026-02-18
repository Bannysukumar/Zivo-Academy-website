"use client"

import { useState, useEffect, useCallback } from "react"
import * as data from "./data"
import type { Assignment, AssignmentSubmission, Announcement, Category, Course, Enrollment, LiveSession, Certificate, CertificateTemplate, Testimonial, Notification, SupportTicket, ReferralEarning, ReferralWallet, ReferralWithdrawal, Section, Review, User, Payment, Coupon, AuditLog } from "@/lib/types"

function useFirestoreList<T>(
  fetcher: () => Promise<T[]>,
  deps: unknown[] = []
): { data: T[]; loading: boolean; error: string | null; refetch: () => Promise<void> } {
  const [list, setList] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refetch = useCallback(() => fetcher().then(setList).catch((e) => setError(String(e))), [fetcher])
  useEffect(() => {
    setLoading(true)
    fetcher().then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, deps)
  return { data: list, loading, error, refetch }
}

export function useCategories() {
  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    data.getCategories().then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [])
  return { data: list, loading, error }
}

export function useCourses(options?: { publishedOnly?: boolean }) {
  const [list, setList] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    data.getCourses(options).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [options?.publishedOnly])
  return { data: list, loading, error, refetch: () => data.getCourses(options).then(setList) }
}

export function useCourseBySlug(slug: string | null) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(!!slug)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!slug) {
      setCourse(null)
      setLoading(false)
      return
    }
    setLoading(true)
    data.getCourseBySlug(slug).then(setCourse).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [slug])
  return { data: course, loading, error }
}

export function useCourseById(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(!!courseId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!courseId) {
      setCourse(null)
      setLoading(false)
      return
    }
    setLoading(true)
    data.getCourseById(courseId).then(setCourse).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [courseId])
  return { data: course, loading, error }
}

export function useTestimonials() {
  const [list, setList] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    data.getTestimonials().then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [])
  return { data: list, loading, error }
}

export function useEnrollments(userId: string | undefined) {
  const [list, setList] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!userId) {
      setList([])
      setLoading(false)
      return
    }
    data.getEnrollmentsByUserId(userId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [userId])
  return { data: list, loading, error, refetch: useCallback(() => userId ? data.getEnrollmentsByUserId(userId).then(setList) : undefined, [userId]) }
}

export function useLiveSessions(status?: "upcoming" | "live" | "completed") {
  const [list, setList] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    data.getLiveSessions({ status }).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [status])
  return { data: list, loading, error, refetch: () => data.getLiveSessions({ status }).then(setList).catch((e) => setError(String(e))) }
}

export function useCertificates(userId: string | undefined) {
  const [list, setList] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!userId) {
      setList([])
      setLoading(false)
      return
    }
    data.getCertificatesByUserId(userId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [userId])
  return { data: list, loading, error }
}

export function useSupportTickets(userId: string | undefined) {
  const [list, setList] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!userId) {
      setList([])
      setLoading(false)
      return
    }
    data.getTicketsByUserId(userId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [userId])
  return { data: list, loading, error }
}

export function useReferralData(userId: string | undefined) {
  const [earnings, setEarnings] = useState<ReferralEarning[]>([])
  const [wallet, setWallet] = useState<ReferralWallet | null>(null)
  const [withdrawals, setWithdrawals] = useState<ReferralWithdrawal[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!userId) {
      setEarnings([])
      setWallet(null)
      setWithdrawals([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      data.getReferralEarningsByReferrerId(userId),
      data.getReferralWallet(userId),
      data.getReferralWithdrawalsByUserId(userId),
    ])
      .then(([e, w, wd]) => {
        setEarnings(e)
        setWallet(w)
        setWithdrawals(wd)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [userId])
  return { earnings, wallet, withdrawals, loading, error }
}

export function useNotifications(userId: string | undefined) {
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!userId) {
      setList([])
      setLoading(false)
      return
    }
    data.getNotificationsByUserId(userId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [userId])
  return { data: list, loading, error }
}

export function useSections(courseId: string | undefined) {
  const [list, setList] = useState<Section[]>([])
  const [loading, setLoading] = useState(!!courseId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!courseId) {
      setList([])
      setLoading(false)
      return
    }
    data.getSectionsByCourseId(courseId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [courseId])
  return { data: list, loading, error }
}

export function useReviews(courseId: string | undefined) {
  const [list, setList] = useState<Review[]>([])
  const [loading, setLoading] = useState(!!courseId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!courseId) {
      setList([])
      setLoading(false)
      return
    }
    data.getReviewsByCourseId(courseId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [courseId])
  return { data: list, loading, error }
}

export function useCoursesByInstructorId(instructorId: string | undefined) {
  const [list, setList] = useState<Course[]>([])
  const [loading, setLoading] = useState(!!instructorId)
  const [error, setError] = useState<string | null>(null)
  const refetch = useCallback(() => {
    if (instructorId) data.getCoursesByInstructorId(instructorId).then(setList).catch((e) => setError(String(e)))
  }, [instructorId])
  useEffect(() => {
    if (!instructorId) {
      setList([])
      setLoading(false)
      return
    }
    setLoading(true)
    data.getCoursesByInstructorId(instructorId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [instructorId])
  return { data: list, loading, error, refetch }
}

export function useAssignmentsByInstructorId(instructorId: string | undefined) {
  const [list, setList] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(!!instructorId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!instructorId) {
      setList([])
      setLoading(false)
      return
    }
    data.getAssignmentsByInstructorId(instructorId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [instructorId])
  return { data: list, loading, error, refetch: () => instructorId ? data.getAssignmentsByInstructorId(instructorId).then(setList) : undefined }
}

export function useAnnouncementsByInstructorId(instructorId: string | undefined) {
  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(!!instructorId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!instructorId) {
      setList([])
      setLoading(false)
      return
    }
    data.getAnnouncementsByInstructorId(instructorId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [instructorId])
  return { data: list, loading, error, refetch: () => instructorId ? data.getAnnouncementsByInstructorId(instructorId).then(setList) : undefined }
}

export function useAssignmentSubmissions(instructorId: string | undefined) {
  const [list, setList] = useState<AssignmentSubmission[]>([])
  const [loading, setLoading] = useState(!!instructorId)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!instructorId) {
      setList([])
      setLoading(false)
      return
    }
    data.getSubmissionsByInstructorId(instructorId).then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [instructorId])
  return { data: list, loading, error, refetch: () => instructorId ? data.getSubmissionsByInstructorId(instructorId).then(setList) : undefined }
}

export function useAllUsers() {
  return useFirestoreList<User>(data.getAllUsers)
}

export function useAllPayments() {
  return useFirestoreList<Payment>(data.getAllPayments)
}

export function useAllEnrollments() {
  return useFirestoreList<Enrollment>(data.getAllEnrollments)
}

export function useAllCoupons() {
  return useFirestoreList<Coupon>(data.getAllCoupons)
}

export function useAllCertificates() {
  return useFirestoreList<Certificate>(data.getAllCertificates)
}

export function useCertificateTemplate() {
  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    data.getCertificateTemplate().then(setTemplate).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [])
  return { data: template, loading, error, refetch: () => data.getCertificateTemplate().then(setTemplate) }
}

export function useAllSupportTickets() {
  return useFirestoreList<SupportTicket>(data.getAllSupportTickets)
}

export function useAllReferralEarnings() {
  return useFirestoreList<ReferralEarning>(data.getAllReferralEarnings)
}

export function useAllReferralWithdrawals() {
  return useFirestoreList<ReferralWithdrawal>(data.getAllReferralWithdrawals)
}

export function useAllReferralWallets() {
  const [list, setList] = useState<ReferralWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    data.getAllReferralWallets().then(setList).catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [])
  return { data: list, loading, error }
}

export function useAuditLogs() {
  return useFirestoreList<AuditLog>(data.getAuditLogs)
}

export function useAllReviews() {
  return useFirestoreList<Review>(data.getAllReviews)
}
