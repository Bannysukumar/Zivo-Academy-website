import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Users, BookOpen, Award } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-card">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            New: AWS Cloud Architect course now live
          </Badge>

          <h1 className="max-w-4xl text-balance font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Learn Skills. Build Projects.{" "}
            <span className="text-primary">Get Hired.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Industry-led courses in Web Development, Data Science, Cloud Computing & more. Project-based learning that gets you job-ready.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/courses">
                Explore Courses <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/courses/full-stack-nextjs">
                <Play className="h-4 w-4" /> Watch Preview
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 border-t border-border pt-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">10,000+</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">50+</p>
                <p className="text-xs text-muted-foreground">Expert Courses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">95%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
