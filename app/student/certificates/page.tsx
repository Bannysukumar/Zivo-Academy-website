"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Share2, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useCertificates } from "@/lib/firebase/hooks"
import { formatDate } from "@/lib/format"

export default function StudentCertificatesPage() {
  const { user } = useAuth()
  const { data: certificates = [], loading } = useCertificates(user?.id)

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">My Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Download and share your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Award className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No certificates yet. Complete a course to earn one!</p>
            <Button className="mt-2 gap-2" asChild>
              <Link href="/courses">Browse Courses <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="border border-border overflow-hidden">
              <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="max-w-[200px] text-xs font-medium text-primary">Certificate of Completion</p>
                </div>
              </div>
              <CardContent className="flex flex-col gap-3 p-5">
                <h3 className="text-sm font-semibold text-foreground">{cert.courseTitle}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Issued: {formatDate(cert.issuedAt)}</span>
                  <Badge variant="secondary" className="text-[10px]">{cert.verificationSlug}</Badge>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
