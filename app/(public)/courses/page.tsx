import type { Metadata } from "next"
import { CourseListing } from "@/components/courses/course-listing"

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Explore our comprehensive catalog of professional courses in Web Development, Data Science, Cloud Computing, Mobile Development and more.",
}

export default function CoursesPage() {
  return <CourseListing />
}
