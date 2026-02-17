// ========================
// ZIVO ACADEMY - Data Models
// ========================

export type UserRole = "student" | "instructor" | "admin" | "superadmin"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  referralCode: string
  referredBy?: string
  createdAt: string
  blocked: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  courseCount: number
}

export type CourseLevel = "beginner" | "intermediate" | "advanced"
export type CourseType = "recorded" | "live" | "hybrid"
export type CourseStatus = "draft" | "published" | "unpublished"

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnail: string
  instructorId: string
  instructorName: string
  instructorAvatar: string
  categoryId: string
  categoryName: string
  level: CourseLevel
  type: CourseType
  language: string
  price: number
  originalPrice: number
  currency: string
  rating: number
  reviewCount: number
  enrollmentCount: number
  duration: string
  lessonsCount: number
  status: CourseStatus
  tags: string[]
  outcomes: string[]
  requirements: string[]
  forWho: string[]
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  courseId: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  type: "video" | "text" | "quiz" | "assignment"
  duration: string
  isFree: boolean
  videoUrl?: string
  content?: string
  order: number
  resources?: Resource[]
}

export interface Resource {
  id: string
  name: string
  type: string
  url: string
  size: string
}

export interface Review {
  id: string
  courseId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  courseTitle: string
  courseThumbnail: string
  progress: number
  enrolledAt: string
  completedAt?: string
  status: "active" | "completed" | "revoked"
}

export interface Progress {
  lessonId: string
  completed: boolean
  completedAt?: string
}

export interface LiveSession {
  id: string
  courseId: string
  courseTitle: string
  title: string
  description: string
  scheduledAt: string
  duration: string
  meetLink: string
  recordingUrl?: string
  status: "upcoming" | "live" | "completed"
}

export interface Payment {
  id: string
  userId: string
  userName: string
  courseId: string
  courseTitle: string
  amount: number
  currency: string
  status: "captured" | "failed" | "refunded"
  razorpayOrderId: string
  razorpayPaymentId?: string
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: "percent" | "flat"
  value: number
  maxUses: number
  usedCount: number
  expiresAt: string
  courseIds: string[]
  active: boolean
}

export interface Certificate {
  id: string
  userId: string
  userName: string
  courseId: string
  courseTitle: string
  issuedAt: string
  certificateUrl: string
  verificationSlug: string
}

export interface SupportTicket {
  id: string
  userId: string
  userName: string
  subject: string
  message: string
  status: "open" | "in-progress" | "resolved" | "closed"
  createdAt: string
  replies: TicketReply[]
}

export interface TicketReply {
  id: string
  userId: string
  userName: string
  message: string
  createdAt: string
  isAdmin: boolean
}

export interface ReferralEarning {
  id: string
  referrerId: string
  referredUserId: string
  referredUserName: string
  courseId: string
  courseTitle: string
  amount: number
  status: "credited" | "reversed"
  createdAt: string
}

export interface ReferralWallet {
  userId: string
  totalEarned: number
  availableBalance: number
  withdrawn: number
  pending: number
}

export interface ReferralWithdrawal {
  id: string
  userId: string
  userName: string
  amount: number
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  processedAt?: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  target: string
  details: string
  createdAt: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  text: string
  rating: number
}

export interface CartItem {
  courseId: string
  course: Course
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: string
  type: "enrollment" | "live_session" | "certificate" | "referral" | "announcement"
}
