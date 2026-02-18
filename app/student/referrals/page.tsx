"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Share2, Wallet, TrendingUp, Users, IndianRupee, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useReferralData, useReferredUsers } from "@/lib/firebase/hooks"
import { formatPrice, formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function StudentReferralsPage() {
  const { user } = useAuth()
  const { earnings, wallet, withdrawals, loading } = useReferralData(user?.id)
  const { referredUsers } = useReferredUsers(user?.referralCode)
  const referralCode = user?.referralCode ?? ""
  const [referralLink, setReferralLink] = useState("")
  useEffect(() => {
    if (referralCode && typeof window !== "undefined") setReferralLink(`${window.location.origin}/ref/${referralCode}`)
  }, [referralCode])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const defaultWallet = {
    totalEarned: 0,
    availableBalance: 0,
    withdrawn: 0,
    pending: 0,
    userId: user?.id ?? "",
  }
  const w = wallet ?? defaultWallet

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Referral Program</h1>
        <p className="mt-1 text-sm text-muted-foreground">Earn rewards by referring friends to ZIVO Academy</p>
      </div>

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

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(w.totalEarned)}</p>
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
              <p className="text-lg font-bold text-foreground">{formatPrice(w.availableBalance)}</p>
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
              <p className="text-lg font-bold text-foreground">{formatPrice(w.withdrawn)}</p>
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
              <p className="text-lg font-bold text-foreground">{referredUsers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button disabled={w.availableBalance < 500} className="gap-2">
          <Wallet className="h-4 w-4" /> Request Withdrawal
        </Button>
      </div>

      {referredUsers.length > 0 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Referred Friends ({referredUsers.length})
            </CardTitle>
            <p className="text-sm font-normal text-muted-foreground">
              People who signed up using your referral link
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Referral Earnings</CardTitle>
          <p className="text-sm font-normal text-muted-foreground">
            Earnings when referred friends purchase a course
          </p>
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
                {earnings.map((e) => (
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
