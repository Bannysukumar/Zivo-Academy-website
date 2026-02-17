"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollText, Search, Download, BookOpen, Users, Tag, ShieldCheck } from "lucide-react"
import { mockAuditLogs } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/format"

export default function AdminAuditLogsPage() {
  const actionIcon = (action: string) => {
    if (action.startsWith("course")) return <BookOpen className="h-3.5 w-3.5 text-primary" />
    if (action.startsWith("user")) return <Users className="h-3.5 w-3.5 text-warning" />
    if (action.startsWith("coupon")) return <Tag className="h-3.5 w-3.5 text-success" />
    return <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
  }

  const actionColor = (action: string) => {
    if (action.includes("published") || action.includes("created")) return "bg-success/10 text-success"
    if (action.includes("deleted") || action.includes("blocked")) return "bg-destructive/10 text-destructive"
    if (action.includes("changed") || action.includes("updated")) return "bg-warning/10 text-warning"
    return "bg-secondary text-secondary-foreground"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track all admin and system actions</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export Logs</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="coupon">Coupon</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {actionIcon(log.action)}
                      <Badge className={`text-[10px] ${actionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.userName}</TableCell>
                  <TableCell className="max-w-[300px] text-sm text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.target}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
