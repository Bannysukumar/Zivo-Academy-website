"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit, Copy } from "lucide-react"
import { useAllCoupons } from "@/lib/firebase/hooks"
import { useAuth } from "@/lib/firebase/auth-context"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function AdminCouponsPage() {
  const { data: coupons = [], loading, refetch } = useAllCoupons()
  const { firebaseUser } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [code, setCode] = useState("")
  const [type, setType] = useState<"percent" | "flat">("percent")
  const [value, setValue] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreateCoupon = async () => {
    if (!code.trim()) {
      toast.error("Enter a coupon code")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to create coupons")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: Number(value) || 0,
          maxUses: Number(maxUses) || 1,
          expiresAt: expiresAt.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Failed to create coupon")
        return
      }
      toast.success("Coupon created!")
      setDialogOpen(false)
      setCode("")
      setValue("")
      setMaxUses("")
      setExpiresAt("")
      setType("percent")
      refetch()
    } catch {
      toast.error("Failed to create coupon")
    } finally {
      setCreating(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Coupon Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{coupons.length} coupons created</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Coupon</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2"><Label>Coupon Code</Label><Input placeholder="e.g., SUMMER50" value={code} onChange={(e) => setCode(e.target.value)} /></div>
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "percent" | "flat")}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent><SelectItem value="percent">Percentage</SelectItem><SelectItem value="flat">Flat Amount</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2"><Label>Value</Label><Input type="number" placeholder="20" value={value} onChange={(e) => setValue(e.target.value)} /></div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col gap-2"><Label>Max Uses</Label><Input type="number" placeholder="100" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} /></div>
                <div className="flex flex-col gap-2"><Label>Expires On</Label><Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></div>
              </div>
              <Button onClick={handleCreateCoupon} disabled={creating}>{creating ? "Creating…" : "Create Coupon"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const usagePct = (coupon.maxUses ?? 0) > 0 ? ((coupon.usedCount ?? 0) / (coupon.maxUses ?? 1)) * 100 : 0
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">{coupon.code}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Copied!") }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{coupon.type}</TableCell>
                    <TableCell className="font-semibold">{coupon.type === "percent" ? `${coupon.value}%` : `INR ${coupon.value}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={usagePct} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">{coupon.usedCount}/{coupon.maxUses}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{coupon.expiresAt ? formatDate(coupon.expiresAt) : "—"}</TableCell>
                    <TableCell>
                      <Badge className={coupon.active ? "bg-success/10 text-success" : "bg-secondary text-secondary-foreground"}>
                        {coupon.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
