"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Award, Search, Download, ExternalLink } from "lucide-react"
import { mockCertificates } from "@/lib/mock-data"
import { formatDate } from "@/lib/format"

export default function AdminCertificatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockCertificates.length} certificates issued</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by student name or verification code..." className="pl-9" />
      </div>

      {mockCertificates.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Award className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No certificates issued yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Verification Code</TableHead>
                  <TableHead>Issued On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCertificates.map(cert => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cert.courseTitle}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px]">{cert.verificationSlug}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(cert.issuedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><ExternalLink className="h-3 w-3" /> View</Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><Download className="h-3 w-3" /> Download</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
