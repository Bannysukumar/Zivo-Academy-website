import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Target, Users, Globe, Award, BookOpen } from "lucide-react"

export const metadata: Metadata = { title: "About Us" }

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <div className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground md:text-4xl">
            About ZIVO Academy
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We are on a mission to democratize quality tech education. ZIVO Academy provides industry-relevant, project-based courses designed to make you job-ready.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", desc: "To empower learners worldwide with practical, industry-relevant skills that transform careers and create opportunities." },
            { icon: Globe, title: "Our Reach", desc: "10,000+ students across 50+ countries learning in English and Hindi, with support for more languages coming soon." },
            { icon: Award, title: "Our Promise", desc: "Every course is crafted by industry experts with hands-on projects, live mentorship, and a certificate of completion." },
          ].map((item, i) => (
            <Card key={i} className="border border-border">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
