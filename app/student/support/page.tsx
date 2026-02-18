"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useSupportTickets } from "@/lib/firebase/hooks"
import { formatDate, getInitials } from "@/lib/format"
import { toast } from "sonner"

export default function StudentSupportPage() {
  const { user, firebaseUser } = useAuth()
  const { data: tickets = [], loading, refetch } = useSupportTickets(user?.id)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyByTicketId, setReplyByTicketId] = useState<Record<string, string>>({})
  const [sendingReplyTicketId, setSendingReplyTicketId] = useState<string | null>(null)

  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-3.5 w-3.5 text-warning" />
      case "in-progress": return <Clock className="h-3.5 w-3.5 text-primary" />
      case "resolved": return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      default: return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-warning/10 text-warning"
      case "in-progress": return "bg-primary/10 text-primary"
      case "resolved": return "bg-success/10 text-success"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  const handleSendReply = async (ticketId: string) => {
    const text = (replyByTicketId[ticketId] ?? "").trim()
    if (!text) {
      toast.error("Enter a message to send")
      return
    }
    if (!firebaseUser) {
      toast.error("Please sign in to reply")
      return
    }
    setSendingReplyTicketId(ticketId)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/support/tickets/${ticketId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Failed to send reply")
        return
      }
      toast.success("Reply sent")
      setReplyByTicketId((prev) => ({ ...prev, [ticketId]: "" }))
      refetch()
    } finally {
      setSendingReplyTicketId(null)
    }
  }

  const handleSubmitTicket = async () => {
    const sub = subject.trim()
    const msg = message.trim()
    if (!sub || !msg) {
      toast.error("Please enter a subject and message")
      return
    }
    if (!firebaseUser) {
      toast.error("Please sign in to submit a ticket")
      return
    }
    setSubmitting(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch("/api/student/support", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: sub, message: msg }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Failed to submit ticket")
        return
      }
      toast.success("Ticket submitted successfully")
      setSubject("")
      setMessage("")
      setDialogOpen(false)
      refetch()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get help with your courses and account</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Ticket</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={submitting}
              />
              <Textarea
                placeholder="Describe your issue..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
              />
              <Button
                className="w-full"
                onClick={handleSubmitTicket}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <HelpCircle className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No support tickets yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="border border-border">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {statusIcon(ticket.status)}
                      <h3 className="text-sm font-semibold text-foreground">{ticket.subject}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{ticket.message}</p>
                    <p className="text-xs text-muted-foreground">Created: {formatDate(ticket.createdAt)}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] ${statusColor(ticket.status)}`}>
                    {ticket.status}
                  </Badge>
                </div>

                {ticket.replies && ticket.replies.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground">Replies ({ticket.replies.length})</p>
                    {ticket.replies.map(reply => (
                      <div key={reply.id} className={`flex gap-3 rounded-lg p-3 ${reply.isAdmin ? "bg-primary/5" : "bg-secondary/50"}`}>
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className={`text-[10px] ${reply.isAdmin ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                            {getInitials(reply.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{reply.userName}</span>
                            {reply.isAdmin && <Badge variant="secondary" className="text-[9px]">Admin</Badge>}
                            <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 border-t border-border pt-3">
                  <Input
                    placeholder="Type a reply..."
                    className="text-sm"
                    value={replyByTicketId[ticket.id] ?? ""}
                    onChange={(e) =>
                      setReplyByTicketId((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendReply(ticket.id)
                      }
                    }}
                    disabled={sendingReplyTicketId === ticket.id}
                  />
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleSendReply(ticket.id)}
                    disabled={
                      sendingReplyTicketId === ticket.id ||
                      !(replyByTicketId[ticket.id] ?? "").trim()
                    }
                  >
                    {sendingReplyTicketId === ticket.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
