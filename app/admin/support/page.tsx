"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, Clock, CheckCircle2, AlertCircle, MessageSquare, Send } from "lucide-react"
import { mockTickets } from "@/lib/mock-data"
import { formatDate, getInitials } from "@/lib/format"

export default function AdminSupportPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(mockTickets[0]?.id || null)
  const selectedTicket = mockTickets.find(t => t.id === selectedTicketId)

  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-3.5 w-3.5 text-warning" />
      case "in-progress": return <Clock className="h-3.5 w-3.5 text-primary" />
      case "resolved": return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      default: return <MessageSquare className="h-3.5 w-3.5" />
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Support Tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mockTickets.length} tickets, {mockTickets.filter(t => t.status === "open").length} open</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[350px_1fr]">
        {/* Ticket List */}
        <div className="flex flex-col gap-2">
          {mockTickets.map(ticket => (
            <Card
              key={ticket.id}
              className={`cursor-pointer border transition-colors ${selectedTicketId === ticket.id ? "border-primary" : "border-border hover:border-primary/30"}`}
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{ticket.userName}</span>
                  <Badge className={`text-[9px] ${statusColor(ticket.status)}`}>{ticket.status}</Badge>
                </div>
                <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{ticket.message}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(ticket.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ticket Detail */}
        {selectedTicket ? (
          <Card className="border border-border">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selectedTicket.subject}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">by {selectedTicket.userName} - {formatDate(selectedTicket.createdAt)}</p>
                </div>
                <Select defaultValue={selectedTicket.status}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm leading-relaxed text-foreground">{selectedTicket.message}</p>
              </div>

              {selectedTicket.replies.length > 0 && (
                <div className="flex flex-col gap-3">
                  {selectedTicket.replies.map(reply => (
                    <div key={reply.id} className={`flex gap-3 rounded-lg p-3 ${reply.isAdmin ? "bg-primary/5" : "bg-secondary/50"}`}>
                      <Avatar className="h-8 w-8">
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

              <div className="flex gap-2 border-t border-border pt-4">
                <Input placeholder="Type a reply..." className="text-sm" />
                <Button className="gap-2"><Send className="h-4 w-4" /> Send</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border">
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Select a ticket to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
