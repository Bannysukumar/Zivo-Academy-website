"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const REFERRAL_COOKIE = "zivo_ref"

export default function RefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()

  useEffect(() => {
    if (!code) {
      router.replace("/")
      return
    }
    try {
      document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(code)};path=/;max-age=${60 * 60 * 24 * 7};samesite=lax`
      if (typeof window !== "undefined") {
        sessionStorage.setItem(REFERRAL_COOKIE, code)
      }
    } catch {
      // ignore
    }
    router.replace("/auth/signup?ref=" + encodeURIComponent(code))
  }, [code, router])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
