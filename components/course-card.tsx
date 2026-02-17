import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, BookOpen, Users } from "lucide-react"
import { formatPrice } from "@/lib/format"
import type { Course } from "@/lib/types"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const typeLabel = course.type === "live" ? "Live" : course.type === "hybrid" ? "Hybrid" : "Recorded"
  const typeColor = course.type === "live" ? "bg-success text-success-foreground" : course.type === "hybrid" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <Card className="overflow-hidden border border-border transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge className={`text-[10px] font-semibold ${typeColor}`}>{typeLabel}</Badge>
            <Badge className="bg-foreground/80 text-[10px] font-semibold text-background backdrop-blur">{course.level}</Badge>
          </div>
          {course.originalPrice > course.price && (
            <Badge className="absolute right-3 top-3 bg-destructive text-[10px] font-bold text-primary-foreground">
              {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col gap-3 p-4">
          {/* Category */}
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{course.categoryName}</p>

          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-xs text-muted-foreground">By {course.instructorName}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-semibold text-foreground">{course.rating}</span>
              <span>({course.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {course.enrollmentCount.toLocaleString()}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <span className="text-lg font-bold text-foreground">{formatPrice(course.price)}</span>
            {course.originalPrice > course.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(course.originalPrice)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
