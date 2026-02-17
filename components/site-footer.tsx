import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none text-foreground">ZIVO</span>
                <span className="text-[10px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">Academy</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Learn Skills. Build Projects. Get Hired. Your career transformation starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Platform</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Browse Courses</Link></li>
              <li><Link href="/courses?type=live" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Live Classes</Link></li>
              <li><Link href="/student" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Student Portal</Link></li>
              <li><Link href="/instructor" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Teach on ZIVO</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Company</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</Link></li>
              <li><Link href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Support</Link></li>
              <li><Link href="/careers" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ZIVO Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
