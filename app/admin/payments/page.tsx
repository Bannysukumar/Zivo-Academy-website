"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, IndianRupee, CheckCircle2, XCircle, RefreshCw, Download } from "lucide-react"
import { useAllPayments } from "@/lib/firebase/hooks"
import { formatPrice, formatDate } from "@/lib/format"

export default function AdminPaymentsPage() {
  const { data: payments = [], loading } = useAllPayments()
  const captured = payments.filter((p) => p.status === "captured")
  const failed = payments.filter((p) => p.status === "failed")
  const totalRevenue = captured.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">{payments.length} transactions total</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><IndianRupee className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl font-bold text-foreground">{formatPrice(totalRevenue)}</p></div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Successful</p><p className="text-xl font-bold text-foreground">{captured.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10"><XCircle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-xl font-bold text-foreground">{failed.length}</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by user, course, or Razorpay ID..." className="pl-9" />
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Razorpay ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.userName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.courseTitle}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(p.amount)}</TableCell>
                  <TableCell>
                    <Badge className={
                      p.status === "captured" ? "bg-success/10 text-success" :
                      p.status === "failed" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.razorpayPaymentId || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                  <TableCell>
                    {p.status === "captured" && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive">
                        <RefreshCw className="h-3 w-3" /> Refund
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
