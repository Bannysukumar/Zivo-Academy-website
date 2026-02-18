"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Percent, Wallet, Loader2, Settings } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const { firebaseUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savingRazorpay, setSavingRazorpay] = useState(false)
  const [savingReferral, setSavingReferral] = useState(false)

  const [keyId, setKeyId] = useState("")
  const [keySecret, setKeySecret] = useState("")
  const [webhookSecret, setWebhookSecret] = useState("")

  const [referralPercent, setReferralPercent] = useState(10)
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(500)

  useEffect(() => {
    const token = firebaseUser?.getIdToken?.()
    if (!token) return
    token.then((t) => {
      if (!t) return
      fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.razorpay) {
            setKeyId(data.razorpay.keyId ?? "")
            setKeySecret(data.razorpay.keySecret ?? "")
            setWebhookSecret(data.razorpay.webhookSecret ?? "")
          }
          if (data.referral) {
            setReferralPercent(Number(data.referral.referralPercent) || 10)
            setMinWithdrawalAmount(Number(data.referral.minWithdrawalAmount) || 500)
          }
        })
        .catch(() => toast.error("Failed to load settings"))
        .finally(() => setLoading(false))
    })
  }, [firebaseUser])

  const saveRazorpay = async () => {
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to save")
      return
    }
    setSavingRazorpay(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          section: "razorpay",
          data: { keyId: keyId.trim(), keySecret: keySecret.trim() || undefined, webhookSecret: webhookSecret.trim() || undefined },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to save")
        return
      }
      toast.success("Razorpay settings saved")
    } finally {
      setSavingRazorpay(false)
    }
  }

  const saveReferral = async () => {
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to save")
      return
    }
    setSavingReferral(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          section: "referral",
          data: { referralPercent, minWithdrawalAmount },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to save")
        return
      }
      toast.success("Referral settings saved")
    } finally {
      setSavingReferral(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure payment and referral options
        </p>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Razorpay
          </CardTitle>
          <CardDescription>
            Payment gateway keys. Leave secret fields blank to keep existing values. Get these from your Razorpay Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Key ID</Label>
            <Input
              placeholder="rzp_live_xxxx or rzp_test_xxxx"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Key Secret</Label>
            <Input
              type="password"
              placeholder="Leave blank to keep current"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label>Webhook Secret</Label>
            <Input
              type="password"
              placeholder="Leave blank to keep current"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button onClick={saveRazorpay} disabled={savingRazorpay}>
            {savingRazorpay ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Razorpay"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Referral income percentage and minimum withdrawal amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Referral income percentage (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={referralPercent}
              onChange={(e) => setReferralPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
            />
            <p className="text-xs text-muted-foreground">
              Percentage of course price the referrer earns when a referred friend purchases.
            </p>
          </div>
          <div className="grid gap-2">
            <Label className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              Minimum withdrawal amount (₹)
            </Label>
            <Input
              type="number"
              min={0}
              value={minWithdrawalAmount}
              onChange={(e) => setMinWithdrawalAmount(Math.max(0, Number(e.target.value) || 0))}
            />
            <p className="text-xs text-muted-foreground">
              Minimum balance required for students to request a withdrawal.
            </p>
          </div>
          <Button onClick={saveReferral} disabled={savingReferral}>
            {savingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Referral"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
