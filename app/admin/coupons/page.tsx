"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tag, Plus, Trash2, Edit, Copy } from "lucide-react"
import { mockCoupons } from "@/lib/mock-data"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function AdminCouponsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Coupon Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockCoupons.length} coupons created</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Coupon</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2"><Label>Coupon Code</Label><Input placeholder="e.g., SUMMER50" /></div>
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Type</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent><SelectItem value="percent">Percentage</SelectItem><SelectItem value="flat">Flat Amount</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2"><Label>Value</Label><Input type="number" placeholder="20" /></div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col gap-2"><Label>Max Uses</Label><Input type="number" placeholder="100" /></div>
                <div className="flex flex-col gap-2"><Label>Expires On</Label><Input type="date" /></div>
              </div>
              <Button onClick={() => toast.success("Coupon created!")}>Create Coupon</Button>
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
              {mockCoupons.map(coupon => {
                const usagePct = (coupon.usedCount / coupon.maxUses) * 100
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
                    <TableCell className="text-sm text-muted-foreground">{formatDate(coupon.expiresAt)}</TableCell>
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
