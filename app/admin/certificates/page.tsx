"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Search, Download, ExternalLink, Upload, Link2, Loader2 } from "lucide-react"
import { useAllCertificates, useCertificateTemplate } from "@/lib/firebase/hooks"
import { useAuth } from "@/lib/firebase/auth-context"
import { getFirebaseStorage } from "@/lib/firebase/client"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function AdminCertificatesPage() {
  const { data: certificates = [], loading } = useAllCertificates()
  const { data: template, loading: templateLoading, refetch: refetchTemplate } = useCertificateTemplate()
  const { firebaseUser } = useAuth()
  const [templateUrl, setTemplateUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSaveTemplateUrl = async () => {
    const url = templateUrl.trim()
    if (!url) {
      toast.error("Enter a template image URL")
      return
    }
    const token = await firebaseUser?.getIdToken()
    if (!token) {
      toast.error("Sign in again to update the template")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/certificates/template", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ templateImageUrl: url }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to save template")
        return
      }
      toast.success("Template saved")
      setTemplateUrl("")
      refetchTemplate()
    } catch {
      toast.error("Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  const handleUploadTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseUser) return
    const token = await firebaseUser.getIdToken()
    if (!token) {
      toast.error("Sign in again to upload")
      return
    }
    setUploading(true)
    try {
      const storage = getFirebaseStorage()
      const path = `certificates/template/${Date.now()}_${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      const res = await fetch("/api/admin/certificates/template", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ templateImageUrl: url }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? "Failed to save template")
        return
      }
      toast.success("Template uploaded and saved")
      refetchTemplate()
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
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
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">{certificates.length} certificates issued</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Certificate template</CardTitle>
          <p className="text-sm text-muted-foreground">Upload or set a template image used when generating certificates. Students will see this design when they complete a course.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {templateLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          ) : template?.templateImageUrl ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Current template</p>
              <img src={template.templateImageUrl} alt="Certificate template" className="max-h-48 w-auto max-w-full rounded-lg border border-border object-contain bg-muted/30" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No template set. Upload an image or add a URL below.</p>
          )}
          <Tabs defaultValue="upload" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload image</TabsTrigger>
              <TabsTrigger value="url" className="gap-1.5"><Link2 className="h-3.5 w-3.5" /> Set URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-3">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:cursor-pointer cursor-pointer"
                  disabled={uploading}
                  onChange={handleUploadTemplate}
                />
                {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</p>}
              </div>
            </TabsContent>
            <TabsContent value="url" className="mt-3">
              <div className="flex flex-col gap-2">
                <Label>Template image URL</Label>
                <Input placeholder="https://example.com/certificate-template.png" value={templateUrl} onChange={(e) => setTemplateUrl(e.target.value)} />
                <Button onClick={handleSaveTemplateUrl} disabled={saving}>{saving ? "Saving…" : "Save template"}</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by student name or verification code..." className="pl-9" />
      </div>

      {certificates.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Award className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No certificates issued yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Verification Code</TableHead>
                  <TableHead>Issued On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cert.courseTitle}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px]">{cert.verificationSlug}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(cert.issuedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><ExternalLink className="h-3 w-3" /> View</Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><Download className="h-3 w-3" /> Download</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
