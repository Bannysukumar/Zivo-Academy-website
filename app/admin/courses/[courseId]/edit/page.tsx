"use client"

import { useParams } from "next/navigation"
import { CourseBuilderForm } from "@/components/course-builder-form"

export default function AdminCourseEditPage() {
  const params = useParams()
  const courseId = typeof params.courseId === "string" ? params.courseId : undefined

  return (
    <CourseBuilderForm
      editCourseId={courseId}
      successRedirect="/admin/courses"
      backHref="/admin/courses"
      backLabel="Course Management"
    />
  )
}
