"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Video, PlayCircle } from "lucide-react"
import { useLiveSessions } from "@/lib/firebase/hooks"
import { formatDateTime } from "@/lib/format"

export default function StudentLiveSessionsPage() {
  const { data: upcoming = [], loading: upcomingLoading } = useLiveSessions("upcoming")
  const { data: completed = [], loading: completedLoading } = useLiveSessions("completed")
  const loading = upcomingLoading || completedLoading

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        <div className="h-12 w-full max-w-md animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Live Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join live classes and access recordings</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Recordings ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 ? (
            <Card className="border border-border"><CardContent className="py-10 text-center text-muted-foreground">No upcoming live sessions</CardContent></Card>
          ) : (
            <div className="flex flex-col gap-4">
              {upcoming.map((session) => (
                <Card key={session.id} className="border border-border">
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success text-success-foreground text-[10px]">Upcoming</Badge>
                        <span className="text-xs text-muted-foreground">{session.courseTitle}</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(session.scheduledAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {session.duration}</span>
                      </div>
                    </div>
                    <Button className="gap-2 shrink-0" asChild>
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4" /> Join Session
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completed.length === 0 ? (
            <Card className="border border-border"><CardContent className="py-10 text-center text-muted-foreground">No recordings available yet</CardContent></Card>
          ) : (
            <div className="flex flex-col gap-4">
              {completed.map((session) => (
                <Card key={session.id} className="border border-border">
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">Completed</Badge>
                        <span className="text-xs text-muted-foreground">{session.courseTitle}</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{session.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(session.scheduledAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {session.duration}</span>
                      </div>
                    </div>
                    {session.recordingUrl && (
                      <Button variant="outline" className="gap-2 shrink-0" asChild>
                        <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
                          <PlayCircle className="h-4 w-4" /> Watch Recording
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
