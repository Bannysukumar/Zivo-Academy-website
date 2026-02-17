"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Share2, IndianRupee, Users, TrendingUp, CheckCircle2, XCircle } from "lucide-react"
import { mockReferralEarnings, mockReferralWithdrawals, mockReferralWallet } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/format"

export default function AdminReferralsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Referral Program</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor referral earnings and withdrawal requests</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><IndianRupee className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Referral Payouts</p><p className="text-xl font-bold text-foreground">{formatPrice(mockReferralWallet.totalEarned)}</p></div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><Users className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Successful Referrals</p><p className="text-xl font-bold text-foreground">{mockReferralEarnings.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><TrendingUp className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Pending Withdrawals</p><p className="text-xl font-bold text-foreground">{mockReferralWithdrawals.filter(w => w.status === "pending").length}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="text-base">Recent Referral Earnings</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReferralEarnings.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No referral earnings yet</TableCell></TableRow>
              ) : (
                mockReferralEarnings.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">User #{e.referrerId}</TableCell>
                    <TableCell>{e.referredUserName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.courseTitle}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(e.amount)}</TableCell>
                    <TableCell>
                      <Badge className={e.status === "credited" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>{e.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(e.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="text-base">Withdrawal Requests</CardTitle></CardHeader>
        <CardContent>
          {mockReferralWithdrawals.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No withdrawal requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReferralWithdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.userName}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(w.amount)}</TableCell>
                    <TableCell><Badge variant="secondary">{w.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(w.requestedAt)}</TableCell>
                    <TableCell>
                      {w.status === "pending" && (
                        <div className="flex gap-1.5">
                          <Button size="sm" className="h-7 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" /> Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
