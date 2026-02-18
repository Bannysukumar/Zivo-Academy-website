"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MoreVertical, Ban, ShieldCheck, Eye, Users, UserCheck, BookOpen } from "lucide-react"
import { useAllUsers } from "@/lib/firebase/hooks"
import { useAuth } from "@/lib/firebase/auth-context"
import { getInitials, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { User } from "@/lib/types"

export default function AdminUsersPage() {
  const { data: users = [], loading, refetch } = useAllUsers()
  const { firebaseUser } = useAuth()
  const [actionUserId, setActionUserId] = useState<string | null>(null)
  const [roleUser, setRoleUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const [changingRole, setChangingRole] = useState(false)
  const students = users.filter((u) => u.role === "student")
  const instructors = users.filter((u) => u.role === "instructor")

  const openChangeRole = (u: User) => {
    setRoleUser(u)
    setNewRole(u.role)
  }

  const handleChangeRole = async () => {
    if (!roleUser || !newRole) return
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to perform this action")
      return
    }
    setChangingRole(true)
    try {
      const res = await fetch(`/api/admin/users/${roleUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to update role")
        return
      }
      toast.success("Role updated")
      setRoleUser(null)
      refetch()
    } catch {
      toast.error("Failed to update role")
    } finally {
      setChangingRole(false)
    }
  }

  const handleBlock = async (userId: string, blocked: boolean) => {
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to perform this action")
      return
    }
    setActionUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ blocked }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to update user")
        return
      }
      toast.success(blocked ? "User blocked" : "User unblocked")
      refetch()
    } finally {
      setActionUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">{users.length} users on the platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Users</p><p className="text-xl font-bold text-foreground">{users.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><UserCheck className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Students</p><p className="text-xl font-bold text-foreground">{students.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><BookOpen className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Instructors</p><p className="text-xl font-bold text-foreground">{instructors.length}</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users by name or email..." className="pl-9" />
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "instructor" ? "bg-warning/10 text-warning" : ""}`}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{u.referralCode}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={u.blocked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}>
                      {u.blocked ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${u.id}`} className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openChangeRole(u)}><ShieldCheck className="h-3.5 w-3.5" /> Change Role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={() => handleBlock(u.id, !u.blocked)}
                          disabled={actionUserId === u.id}
                        >
                          <Ban className="h-3.5 w-3.5" /> {u.blocked ? "Unblock User" : "Block User"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!roleUser} onOpenChange={(open) => !open && setRoleUser(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          {roleUser && (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Update role for <span className="font-medium text-foreground">{roleUser.name ?? roleUser.email}</span>
              </p>
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRoleUser(null)}>Cancel</Button>
                <Button onClick={handleChangeRole} disabled={changingRole || newRole === roleUser.role}>
                  {changingRole ? "Updating…" : "Update Role"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
