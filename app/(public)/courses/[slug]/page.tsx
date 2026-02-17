import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { mockCourses } from "@/lib/mock-data"
import { CourseDetailView } from "@/components/courses/course-detail-view"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = mockCourses.find(c => c.slug === slug)
  if (!course) return { title: "Course Not Found" }

  return {
    title: course.title,
    description: course.shortDescription,
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      type: "website",
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.shortDescription,
        provider: { "@type": "Organization", name: "ZIVO Academy" },
      }),
    },
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const course = mockCourses.find(c => c.slug === slug)

  if (!course) notFound()

  return <CourseDetailView course={course} />
}
