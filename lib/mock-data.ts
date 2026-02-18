import type {
  User, Category, Course, Section, Review, Enrollment, LiveSession,
  Payment, Coupon, Certificate, SupportTicket, ReferralEarning,
  ReferralWallet, ReferralWithdrawal, AuditLog, Testimonial, Notification,
  AssignmentSubmission,
} from "./types"

// ==================== USERS ====================
export const mockUsers: User[] = [
  {
    id: "u1", name: "Arjun Mehta", email: "arjun@example.com", role: "student",
    referralCode: "ARJUN100", referredBy: undefined, createdAt: "2025-01-15", blocked: false,
    avatar: "",
  },
  {
    id: "u2", name: "Priya Sharma", email: "priya@example.com", role: "instructor",
    referralCode: "PRIYA200", createdAt: "2024-11-01", blocked: false,
    avatar: "",
  },
  {
    id: "u3", name: "Rahul Verma", email: "rahul@example.com", role: "admin",
    referralCode: "RAHUL300", createdAt: "2024-06-10", blocked: false,
    avatar: "",
  },
  {
    id: "u4", name: "Sneha Patel", email: "sneha@example.com", role: "student",
    referralCode: "SNEHA400", referredBy: "ARJUN100", createdAt: "2025-03-20", blocked: false,
    avatar: "",
  },
]

// ==================== CATEGORIES ====================
export const mockCategories: Category[] = [
  { id: "cat1", name: "Web Development", slug: "web-development", icon: "Code", courseCount: 12 },
  { id: "cat2", name: "Data Science", slug: "data-science", icon: "BarChart3", courseCount: 8 },
  { id: "cat3", name: "Mobile Development", slug: "mobile-development", icon: "Smartphone", courseCount: 6 },
  { id: "cat4", name: "Cloud & DevOps", slug: "cloud-devops", icon: "Cloud", courseCount: 5 },
  { id: "cat5", name: "UI/UX Design", slug: "ui-ux-design", icon: "Palette", courseCount: 4 },
  { id: "cat6", name: "Cybersecurity", slug: "cybersecurity", icon: "Shield", courseCount: 3 },
  { id: "cat7", name: "AI & Machine Learning", slug: "ai-ml", icon: "Brain", courseCount: 7 },
  { id: "cat8", name: "Digital Marketing", slug: "digital-marketing", icon: "Megaphone", courseCount: 4 },
]

// ==================== COURSES ====================
export const mockCourses: Course[] = [
  {
    id: "c1", title: "Full-Stack Web Development with Next.js",
    slug: "full-stack-nextjs",
    description: "Master modern web development from front to back. Build production-ready applications with Next.js, React, TypeScript, and PostgreSQL. This comprehensive course covers everything from setting up your development environment to deploying scalable applications.",
    shortDescription: "Build production-ready web apps with Next.js, React & TypeScript",
    thumbnail: "/placeholder-course-1.jpg",
    instructorId: "u2", instructorName: "Priya Sharma", instructorAvatar: "",
    categoryId: "cat1", categoryName: "Web Development",
    level: "intermediate", type: "hybrid", language: "English",
    price: 4999, originalPrice: 9999, currency: "INR",
    rating: 4.8, reviewCount: 342, enrollmentCount: 1847,
    duration: "42 hours", lessonsCount: 68, status: "published",
    tags: ["nextjs", "react", "typescript", "fullstack"],
    outcomes: [
      "Build complete web applications with Next.js App Router",
      "Master TypeScript for type-safe development",
      "Implement authentication and authorization",
      "Deploy production apps to Vercel",
      "Work with databases using Prisma ORM",
      "Build REST and GraphQL APIs"
    ],
    requirements: ["Basic HTML, CSS & JavaScript", "Familiarity with React basics"],
    forWho: ["Aspiring full-stack developers", "Frontend devs wanting to learn backend", "Career switchers into tech"],
    createdAt: "2025-01-10", updatedAt: "2025-06-15",
  },
  {
    id: "c2", title: "Data Science & Machine Learning Bootcamp",
    slug: "data-science-ml-bootcamp",
    description: "A complete data science bootcamp. Learn Python, Pandas, NumPy, Matplotlib, Scikit-Learn, TensorFlow, and more. Go from zero to building your own ML models with real-world projects.",
    shortDescription: "Complete data science journey from Python basics to ML models",
    thumbnail: "/placeholder-course-2.jpg",
    instructorId: "u2", instructorName: "Priya Sharma", instructorAvatar: "",
    categoryId: "cat2", categoryName: "Data Science",
    level: "beginner", type: "recorded", language: "English",
    price: 3999, originalPrice: 7999, currency: "INR",
    rating: 4.7, reviewCount: 528, enrollmentCount: 2341,
    duration: "56 hours", lessonsCount: 92, status: "published",
    tags: ["python", "data-science", "machine-learning", "tensorflow"],
    outcomes: [
      "Master Python for data analysis",
      "Build machine learning models from scratch",
      "Work with real-world datasets",
      "Create compelling data visualizations",
      "Understand deep learning fundamentals",
      "Build a portfolio of data science projects"
    ],
    requirements: ["No programming experience required", "Basic math understanding"],
    forWho: ["Beginners in data science", "Analysts wanting to learn ML", "Students seeking data careers"],
    createdAt: "2024-11-20", updatedAt: "2025-05-10",
  },
  {
    id: "c3", title: "React Native Mobile App Development",
    slug: "react-native-mobile",
    description: "Build beautiful cross-platform mobile apps with React Native and Expo. Learn navigation, state management, native APIs, and publishing to App Store and Google Play.",
    shortDescription: "Create cross-platform mobile apps with React Native & Expo",
    thumbnail: "/placeholder-course-3.jpg",
    instructorId: "u2", instructorName: "Priya Sharma", instructorAvatar: "",
    categoryId: "cat3", categoryName: "Mobile Development",
    level: "intermediate", type: "recorded", language: "English",
    price: 3499, originalPrice: 6999, currency: "INR",
    rating: 4.6, reviewCount: 187, enrollmentCount: 923,
    duration: "34 hours", lessonsCount: 48, status: "published",
    tags: ["react-native", "expo", "mobile", "cross-platform"],
    outcomes: [
      "Build iOS and Android apps from one codebase",
      "Master React Native navigation patterns",
      "Integrate native device features",
      "Publish apps to both app stores",
    ],
    requirements: ["JavaScript fundamentals", "Basic React knowledge"],
    forWho: ["Web developers moving to mobile", "Startup founders building MVPs"],
    createdAt: "2025-02-15", updatedAt: "2025-07-01",
  },
  {
    id: "c4", title: "AWS Cloud Practitioner to Solutions Architect",
    slug: "aws-cloud-architect",
    description: "Go from AWS beginner to Solutions Architect. Cover all core AWS services, architecture patterns, security best practices, and prepare for both certification exams.",
    shortDescription: "Master AWS from practitioner level to solutions architect",
    thumbnail: "/placeholder-course-4.jpg",
    instructorId: "u2", instructorName: "Priya Sharma", instructorAvatar: "",
    categoryId: "cat4", categoryName: "Cloud & DevOps",
    level: "beginner", type: "live", language: "English",
    price: 5999, originalPrice: 11999, currency: "INR",
    rating: 4.9, reviewCount: 215, enrollmentCount: 1102,
    duration: "48 hours", lessonsCount: 56, status: "published",
    tags: ["aws", "cloud", "devops", "architecture"],
    outcomes: [
      "Design scalable cloud architectures",
      "Pass AWS certification exams",
      "Implement secure cloud solutions",
      "Optimize cloud costs effectively",
    ],
    requirements: ["Basic IT knowledge", "Understanding of networking fundamentals"],
    forWho: ["IT professionals", "DevOps engineers", "Cloud career aspirants"],
    createdAt: "2025-03-01", updatedAt: "2025-08-01",
  },
  {
    id: "c5", title: "UI/UX Design Masterclass with Figma",
    slug: "uiux-figma-masterclass",
    description: "Learn modern UI/UX design principles and master Figma. Create stunning interfaces, build design systems, conduct user research, and build a professional portfolio.",
    shortDescription: "Design beautiful interfaces and master Figma from scratch",
    thumbnail: "/placeholder-course-5.jpg",
    instructorId: "u2", instructorName: "Priya Sharma", instructorAvatar: "",
    categoryId: "cat5", categoryName: "UI/UX Design",
    level: "beginner", type: "hybrid", language: "Hindi",
    price: 2999, originalPrice: 5999, currency: "INR",
    rating: 4.5, reviewCount: 156, enrollmentCount: 756,
    duration: "28 hours", lessonsCount: 40, status: "published",
    tags: ["figma", "ui-design", "ux-design", "prototyping"],
    outcomes: [
      "Master Figma for professional design",
      "Apply core UI/UX design principles",
      "Build a complete design system",
      "Create a professional design portfolio",
    ],
    requirements: ["No design experience needed", "A computer with internet"],
    forWho: ["Aspiring designers", "Developers wanting design skills", "Product managers"],
    createdAt: "2025-04-10", updatedAt: "2025-09-01",
  },
  {
    id: "c6", title: "Ethical Hacking & Penetration Testing",
    slug: "ethical-hacking",
    description: "Become a certified ethical hacker. Learn network security, web application security, penetration testing methodologies, and prepare for CEH certification.",
    shortDescription: "Master cybersecurity with hands-on penetration testing labs",
    thumbnail: "/placeholder-course-6.jpg",
    instructorId: "u2", instructorName: "Priya Sharma", instructorAvatar: "",
    categoryId: "cat6", categoryName: "Cybersecurity",
    level: "advanced", type: "recorded", language: "English",
    price: 6999, originalPrice: 13999, currency: "INR",
    rating: 4.8, reviewCount: 98, enrollmentCount: 432,
    duration: "52 hours", lessonsCount: 74, status: "published",
    tags: ["cybersecurity", "ethical-hacking", "penetration-testing", "security"],
    outcomes: [
      "Perform professional penetration tests",
      "Identify and exploit vulnerabilities",
      "Secure networks and applications",
      "Prepare for CEH certification",
    ],
    requirements: ["Basic networking knowledge", "Linux fundamentals"],
    forWho: ["Security enthusiasts", "IT admins", "Career switchers to cybersecurity"],
    createdAt: "2025-05-01", updatedAt: "2025-10-01",
  },
]

// ==================== COURSE CONTENT ====================
export const mockSections: Section[] = [
  {
    id: "s1", courseId: "c1", title: "Getting Started with Next.js", order: 1,
    lessons: [
      { id: "l1", sectionId: "s1", title: "Course Introduction & Setup", type: "video", duration: "12 min", isFree: true, order: 1 },
      { id: "l2", sectionId: "s1", title: "Understanding App Router", type: "video", duration: "18 min", isFree: true, order: 2 },
      { id: "l3", sectionId: "s1", title: "Project Structure Deep Dive", type: "video", duration: "15 min", isFree: false, order: 3 },
      { id: "l4", sectionId: "s1", title: "Module 1 Quiz", type: "quiz", duration: "10 min", isFree: false, order: 4 },
    ],
  },
  {
    id: "s2", courseId: "c1", title: "React Fundamentals Review", order: 2,
    lessons: [
      { id: "l5", sectionId: "s2", title: "Components & JSX", type: "video", duration: "20 min", isFree: false, order: 1 },
      { id: "l6", sectionId: "s2", title: "State & Props Patterns", type: "video", duration: "25 min", isFree: false, order: 2 },
      { id: "l7", sectionId: "s2", title: "Hooks Deep Dive", type: "video", duration: "30 min", isFree: false, order: 3 },
      { id: "l8", sectionId: "s2", title: "Build a React Component", type: "assignment", duration: "45 min", isFree: false, order: 4 },
    ],
  },
  {
    id: "s3", courseId: "c1", title: "Building with TypeScript", order: 3,
    lessons: [
      { id: "l9", sectionId: "s3", title: "TypeScript Basics", type: "video", duration: "22 min", isFree: false, order: 1 },
      { id: "l10", sectionId: "s3", title: "Advanced Types & Generics", type: "video", duration: "28 min", isFree: false, order: 2 },
      { id: "l11", sectionId: "s3", title: "TypeScript with React", type: "video", duration: "20 min", isFree: false, order: 3 },
    ],
  },
  {
    id: "s4", courseId: "c1", title: "Database & API Routes", order: 4,
    lessons: [
      { id: "l12", sectionId: "s4", title: "Setting up Prisma ORM", type: "video", duration: "18 min", isFree: false, order: 1 },
      { id: "l13", sectionId: "s4", title: "Building REST APIs", type: "video", duration: "25 min", isFree: false, order: 2 },
      { id: "l14", sectionId: "s4", title: "Server Actions", type: "video", duration: "22 min", isFree: false, order: 3 },
      { id: "l15", sectionId: "s4", title: "Module 4 Assignment", type: "assignment", duration: "60 min", isFree: false, order: 4 },
    ],
  },
]

// ==================== REVIEWS ====================
export const mockReviews: Review[] = [
  { id: "r1", courseId: "c1", userId: "u1", userName: "Arjun Mehta", rating: 5, comment: "Best Next.js course I've ever taken. The project-based approach really solidified my understanding.", createdAt: "2025-06-20" },
  { id: "r2", courseId: "c1", userId: "u4", userName: "Sneha Patel", rating: 4, comment: "Very thorough coverage. The TypeScript sections were especially helpful. Would love more advanced patterns.", createdAt: "2025-07-15" },
  { id: "r3", courseId: "c2", userId: "u1", userName: "Arjun Mehta", rating: 5, comment: "Went from zero Python knowledge to building ML models in 8 weeks. Incredible curriculum.", createdAt: "2025-05-10" },
  { id: "r4", courseId: "c1", userId: "u4", userName: "Sneha Patel", rating: 5, comment: "The live sessions with Priya are amazing. She explains complex concepts so clearly.", createdAt: "2025-08-01" },
]

// ==================== ENROLLMENTS ====================
export const mockEnrollments: Enrollment[] = [
  { id: "e1", userId: "u1", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", courseThumbnail: "/placeholder-course-1.jpg", progress: 65, enrolledAt: "2025-03-10", status: "active" },
  { id: "e2", userId: "u1", courseId: "c2", courseTitle: "Data Science & Machine Learning Bootcamp", courseThumbnail: "/placeholder-course-2.jpg", progress: 100, enrolledAt: "2025-01-20", completedAt: "2025-05-05", status: "completed" },
  { id: "e3", userId: "u4", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", courseThumbnail: "/placeholder-course-1.jpg", progress: 30, enrolledAt: "2025-04-15", status: "active" },
]

// ==================== LIVE SESSIONS ====================
export const mockLiveSessions: LiveSession[] = [
  { id: "ls1", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", title: "Advanced Routing Patterns Q&A", description: "Live deep-dive into Next.js routing", scheduledAt: "2026-02-20T10:00:00Z", duration: "90 min", meetLink: "https://meet.google.com/abc-defg-hij", status: "upcoming" },
  { id: "ls2", courseId: "c4", courseTitle: "AWS Cloud Practitioner to Solutions Architect", title: "AWS VPC Workshop", description: "Hands-on VPC configuration session", scheduledAt: "2026-02-22T14:00:00Z", duration: "120 min", meetLink: "https://zoom.us/j/123456789", status: "upcoming" },
  { id: "ls3", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", title: "Database Design Patterns", description: "Live session on advanced database patterns", scheduledAt: "2026-01-15T10:00:00Z", duration: "60 min", meetLink: "https://meet.google.com/xyz", recordingUrl: "https://youtube.com/watch?v=example", status: "completed" },
]

// ==================== PAYMENTS ====================
export const mockPayments: Payment[] = [
  { id: "p1", userId: "u1", userName: "Arjun Mehta", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", amount: 4999, currency: "INR", status: "captured", razorpayOrderId: "order_abc123", razorpayPaymentId: "pay_xyz789", createdAt: "2025-03-10" },
  { id: "p2", userId: "u1", userName: "Arjun Mehta", courseId: "c2", courseTitle: "Data Science & ML Bootcamp", amount: 3999, currency: "INR", status: "captured", razorpayOrderId: "order_def456", razorpayPaymentId: "pay_uvw012", createdAt: "2025-01-20" },
  { id: "p3", userId: "u4", userName: "Sneha Patel", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", amount: 4499, currency: "INR", status: "captured", razorpayOrderId: "order_ghi789", razorpayPaymentId: "pay_rst345", createdAt: "2025-04-15" },
  { id: "p4", userId: "u4", userName: "Sneha Patel", courseId: "c3", courseTitle: "React Native Mobile App Development", amount: 3499, currency: "INR", status: "failed", razorpayOrderId: "order_jkl012", createdAt: "2025-05-01" },
]

// ==================== COUPONS ====================
export const mockCoupons: Coupon[] = [
  { id: "cp1", code: "WELCOME20", type: "percent", value: 20, maxUses: 500, usedCount: 234, expiresAt: "2026-12-31", courseIds: [], active: true },
  { id: "cp2", code: "FLAT500", type: "flat", value: 500, maxUses: 100, usedCount: 67, expiresAt: "2026-06-30", courseIds: ["c1", "c2"], active: true },
  { id: "cp3", code: "SUMMER50", type: "percent", value: 50, maxUses: 50, usedCount: 50, expiresAt: "2025-08-31", courseIds: [], active: false },
]

// ==================== CERTIFICATES ====================
export const mockCertificates: Certificate[] = [
  { id: "cert1", userId: "u1", userName: "Arjun Mehta", courseId: "c2", courseTitle: "Data Science & Machine Learning Bootcamp", issuedAt: "2025-05-05", certificateUrl: "/certificates/cert1.pdf", verificationSlug: "ZIVO-2025-DS-001" },
]

// ==================== SUPPORT TICKETS ====================
export const mockTickets: SupportTicket[] = [
  {
    id: "t1", userId: "u1", userName: "Arjun Mehta", subject: "Cannot access Module 4 videos",
    message: "I've completed all previous modules but the Module 4 videos show as locked. Please help.",
    status: "in-progress", createdAt: "2025-08-10",
    replies: [
      { id: "tr1", userId: "u3", userName: "Rahul Verma", message: "Hi Arjun, I'm looking into this. Could you try clearing your browser cache first?", createdAt: "2025-08-10", isAdmin: true },
      { id: "tr2", userId: "u1", userName: "Arjun Mehta", message: "Tried that, still showing locked.", createdAt: "2025-08-11", isAdmin: false },
    ],
  },
  {
    id: "t2", userId: "u4", userName: "Sneha Patel", subject: "Payment failed but amount deducted",
    message: "My payment of INR 3499 for React Native course failed but money was deducted from my account.",
    status: "open", createdAt: "2025-08-12",
    replies: [],
  },
]

// ==================== REFERRAL DATA ====================
export const mockReferralEarnings: ReferralEarning[] = [
  { id: "re1", referrerId: "u1", referredUserId: "u4", referredUserName: "Sneha Patel", courseId: "c1", courseTitle: "Full-Stack Web Development with Next.js", amount: 500, status: "credited", createdAt: "2025-04-15" },
]

export const mockReferralWallet: ReferralWallet = {
  userId: "u1", totalEarned: 500, availableBalance: 500, withdrawn: 0, pending: 0,
}

export const mockReferralWithdrawals: ReferralWithdrawal[] = []

// ==================== AUDIT LOGS ====================
export const mockAuditLogs: AuditLog[] = [
  { id: "al1", userId: "u3", userName: "Rahul Verma", action: "course.published", target: "c1", details: "Published course: Full-Stack Web Development with Next.js", createdAt: "2025-01-10T09:30:00Z" },
  { id: "al2", userId: "u3", userName: "Rahul Verma", action: "user.role_changed", target: "u2", details: "Changed role of Priya Sharma to instructor", createdAt: "2024-11-01T14:00:00Z" },
  { id: "al3", userId: "u2", userName: "Priya Sharma", action: "course.created", target: "c2", details: "Created course: Data Science & ML Bootcamp", createdAt: "2024-11-20T11:00:00Z" },
  { id: "al4", userId: "u3", userName: "Rahul Verma", action: "coupon.created", target: "cp1", details: "Created coupon: WELCOME20 (20% off)", createdAt: "2025-01-05T16:45:00Z" },
]

// ==================== TESTIMONIALS ====================
export const mockTestimonials: Testimonial[] = [
  { id: "tm1", name: "Vikram Singh", role: "Software Engineer", company: "Google", avatar: "", text: "ZIVO Academy transformed my career. The Full-Stack course gave me the skills I needed to land my dream job at a top tech company.", rating: 5 },
  { id: "tm2", name: "Anita Desai", role: "Data Analyst", company: "Amazon", avatar: "", text: "The Data Science bootcamp was exactly what I needed. Practical projects, great instructor support, and a structured learning path.", rating: 5 },
  { id: "tm3", name: "Karthik Rao", role: "Mobile Developer", company: "Flipkart", avatar: "", text: "Went from web development to mobile in just 2 months. The React Native course is incredibly well-structured.", rating: 4 },
]

// ==================== NOTIFICATIONS ====================
export const mockNotifications: Notification[] = [
  { id: "n1", userId: "u1", title: "Live Session Tomorrow", message: "Advanced Routing Patterns Q&A starts at 10:00 AM IST", read: false, createdAt: "2026-02-19T08:00:00Z", type: "live_session" },
  { id: "n2", userId: "u1", title: "Referral Earning!", message: "You earned INR 500 from Sneha Patel's enrollment", read: true, createdAt: "2025-04-15T10:00:00Z", type: "referral" },
  { id: "n3", userId: "u1", title: "Certificate Ready", message: "Your Data Science course certificate is ready to download", read: true, createdAt: "2025-05-05T12:00:00Z", type: "certificate" },
]

// ==================== ASSIGNMENT SUBMISSIONS (instructorId u2 = Priya Sharma) ====================
export const mockAssignmentSubmissions: AssignmentSubmission[] = [
  { id: "sub1", instructorId: "u2", studentId: "u1", studentName: "Arjun Mehta", courseId: "c1", courseName: "Full-Stack Web Development with Next.js", assignmentTitle: "Build a React Component", submittedAt: "2025-08-10", status: "pending", grade: null },
  { id: "sub2", instructorId: "u2", studentId: "u4", studentName: "Sneha Patel", courseId: "c1", courseName: "Full-Stack Web Development with Next.js", assignmentTitle: "Build a React Component", submittedAt: "2025-08-09", status: "graded", grade: 85 },
  { id: "sub3", instructorId: "u2", studentId: "u1", studentName: "Arjun Mehta", courseId: "c1", courseName: "Full-Stack Web Development with Next.js", assignmentTitle: "Module 4 Assignment", submittedAt: "2025-08-12", status: "pending", grade: null },
  { id: "sub4", instructorId: "u2", studentId: "u4", studentName: "Sneha Patel", courseId: "c1", courseName: "Full-Stack Web Development with Next.js", assignmentTitle: "Module 4 Assignment", submittedAt: "2025-08-11", status: "graded", grade: 92 },
]
