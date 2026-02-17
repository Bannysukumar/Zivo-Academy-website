import Link from "next/link"
import { Card } from "@/components/ui/card"
import { mockCategories } from "@/lib/mock-data"
import {
  Code, BarChart3, Smartphone, Cloud, Palette, Shield, Brain, Megaphone
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="h-6 w-6" />,
  BarChart3: <BarChart3 className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  Cloud: <Cloud className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  Brain: <Brain className="h-6 w-6" />,
  Megaphone: <Megaphone className="h-6 w-6" />,
}

export function CategoriesSection() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground md:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find the perfect course to advance your career
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {mockCategories.map(cat => (
            <Link key={cat.id} href={`/courses?category=${cat.slug}`}>
              <Card className="flex flex-col items-center gap-3 border border-border p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {iconMap[cat.icon] || <Code className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cat.courseCount} courses</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
