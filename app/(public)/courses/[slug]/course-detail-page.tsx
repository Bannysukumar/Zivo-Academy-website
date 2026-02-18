"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { useCourseBySlug } from "@/lib/firebase/hooks"
import { CourseDetailView } from "@/components/courses/course-detail-view"

export function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: course, loading } = useCourseBySlug(slug)

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!course) notFound()

  return <CourseDetailView course={course} />
}
