import type { MetadataRoute } from "next"
import { getAdminFirestore } from "@/lib/firebase/admin"
import { COLLECTIONS } from "@/lib/firebase/collections"

export const dynamic = "force-dynamic"
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zivoacademy.com"
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/auth/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ]

  try {
    const db = getAdminFirestore()
    const snap = await db.collection(COLLECTIONS.courses).where("status", "==", "published").get()
    const courseUrls: MetadataRoute.Sitemap = snap.docs.map((d) => {
      const slug = d.data()?.slug as string | undefined
      return {
        url: slug ? `${base}/courses/${slug}` : `${base}/courses`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }
    })
    return [...staticPages, ...courseUrls]
  } catch {
    return staticPages
  }
}
