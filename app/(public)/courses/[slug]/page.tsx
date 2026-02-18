import type { Metadata } from "next"
import { CourseDetailPage } from "./course-detail-page"

export const metadata: Metadata = {
  title: "Course",
  description: "Course details | ZIVO Academy",
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <CourseDetailPage params={params} />
}
