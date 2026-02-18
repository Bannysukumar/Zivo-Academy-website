import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zivoacademy.com"
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/student/", "/instructor/", "/admin/", "/api/", "/checkout", "/auth/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
