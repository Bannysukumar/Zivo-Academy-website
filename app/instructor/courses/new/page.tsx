"use client"

import { useSearchParams } from "next/navigation"
import { CourseBuilderForm } from "@/components/course-builder-form"

export default function CourseBuilderPage() {
  const searchParams = useSearchParams()
  const editCourseId = searchParams.get("courseId") ?? undefined

  return (
    <CourseBuilderForm
      editCourseId={editCourseId}
      successRedirect="/instructor/courses"
      backHref="/instructor/courses"
      backLabel="My Courses"
    />
  )
}
