"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/firebase/auth-context"
import { formatPrice } from "@/lib/format"
import { ShoppingBag, ArrowLeft } from "lucide-react"

export function CheckoutView() {
  const router = useRouter()
  const { user } = useAuth()
  const { items } = useCart()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!user) {
      router.replace("/auth/login?redirect=/checkout")
      return
    }
    if (items.length === 0) {
      router.replace("/cart")
    }
  }, [user, items.length, router])

  if (!user || items.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const total = items.reduce((sum, c) => sum + c.price, 0)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Payment is processed securely via Razorpay. Configure Razorpay keys to enable payments.
      </p>

      <Card className="mt-6 border border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{items.length} course(s)</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(total)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            To enable payments: add <code className="rounded bg-muted px-1 text-xs">RAZORPAY_KEY_ID</code>,{" "}
            <code className="rounded bg-muted px-1 text-xs">RAZORPAY_KEY_SECRET</code>, and{" "}
            <code className="rounded bg-muted px-1 text-xs">RAZORPAY_WEBHOOK_SECRET</code> to your environment, then use the{" "}
            <code className="rounded bg-muted px-1 text-xs">/api/razorpay/create-order</code> and{" "}
            <code className="rounded bg-muted px-1 text-xs">/api/razorpay/webhook</code> routes.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/cart"><ArrowLeft className="h-4 w-4" /> Back to Cart</Link>
            </Button>
            <Button disabled title="Enable Razorpay to pay">
              Pay {formatPrice(total)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
