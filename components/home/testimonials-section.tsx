"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"
import { useTestimonials } from "@/lib/firebase/hooks"
import { getInitials } from "@/lib/format"

export function TestimonialsSection() {
  const { data: testimonials, loading } = useTestimonials()

  if (loading) {
    return (
      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 h-10 w-64 animate-pulse rounded bg-muted mx-auto" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground md:text-3xl">
            What Our Students Say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real stories from real learners who transformed their careers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="border border-border">
              <CardContent className="flex flex-col gap-4 p-6">
                <Quote className="h-8 w-8 text-primary/20" />
                <p className="flex-1 text-sm leading-relaxed text-foreground">
                  {`"${t.text}"`}
                </p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < t.rating ? "fill-warning text-warning" : "text-border"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(t.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
