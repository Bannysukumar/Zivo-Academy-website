import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-primary-foreground md:text-3xl">
          Ready to Transform Your Career?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Join thousands of learners who have accelerated their careers with ZIVO Academy.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {["Project-based learning", "Industry expert instructors", "Lifetime access", "Certificate of completion"].map(item => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground/80" />
              <span className="text-sm font-medium text-primary-foreground/90">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button size="lg" variant="secondary" className="gap-2 px-8 text-secondary-foreground" asChild>
            <Link href="/courses">
              Start Learning Today <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
