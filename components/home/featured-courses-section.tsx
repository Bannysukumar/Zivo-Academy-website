"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { useCourses } from "@/lib/firebase/hooks"
import { ArrowRight } from "lucide-react"

export function FeaturedCoursesSection() {
  const { data: courses, loading } = useCourses({ publishedOnly: true })
  const featured = courses.slice(0, 3)

  if (loading) {
    return (
      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (featured.length === 0) return null

  return (
    <section className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground md:text-3xl">
              Featured Courses
            </h2>
            <p className="mt-3 text-muted-foreground">
              Handpicked courses to kickstart your learning journey
            </p>
          </div>
          <Button variant="ghost" className="hidden gap-1 md:flex" asChild>
            <Link href="/courses">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="gap-1" asChild>
            <Link href="/courses">
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
