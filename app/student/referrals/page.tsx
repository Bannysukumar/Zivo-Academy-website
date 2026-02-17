"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Share2, Wallet, TrendingUp, Users, IndianRupee, CheckCircle2 } from "lucide-react"
import { mockReferralEarnings, mockReferralWallet, mockReferralWithdrawals } from "@/lib/mock-data"
import { formatPrice, formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function StudentReferralsPage() {
  const wallet = mockReferralWallet
  const earnings = mockReferralEarnings.filter(e => e.referrerId === "u1")
  const referralCode = "ARJUN100"
  const referralLink = `https://zivoacademy.com/ref/${referralCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Referral Program</h1>
        <p className="mt-1 text-sm text-muted-foreground">Earn rewards by referring friends to ZIVO Academy</p>
      </div>

      {/* Referral Link */}
      <Card className="border border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Referral Link</h3>
          </div>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="bg-card text-sm" />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link with friends. When they purchase a course, you earn a referral bonus!
          </p>
        </CardContent>
      </Card>

      {/* Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(wallet.totalEarned)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(wallet.availableBalance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Withdrawn</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(wallet.withdrawn)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referrals</p>
              <p className="text-lg font-bold text-foreground">{earnings.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw button */}
      <div className="flex justify-end">
        <Button disabled={wallet.availableBalance < 500} className="gap-2">
          <Wallet className="h-4 w-4" /> Request Withdrawal
        </Button>
      </div>

      {/* Earnings History */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Referral Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No referral earnings yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.referredUserName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.courseTitle}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(e.amount)}</TableCell>
                    <TableCell>
                      <Badge className={e.status === "credited" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(e.createdAt)}</TableCell>
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
