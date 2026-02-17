"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Trash2, Tag, ShoppingCart, ArrowRight } from "lucide-react"
import { mockCourses } from "@/lib/mock-data"
import { formatPrice } from "@/lib/format"

export function CartView() {
  const [cartItems, setCartItems] = useState(mockCourses.slice(0, 2))
  const [coupon, setCoupon] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const subtotal = cartItems.reduce((sum, c) => sum + c.price, 0)
  const discount = appliedCoupon === "WELCOME20" ? Math.round(subtotal * 0.2) : 0
  const total = subtotal - discount

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(c => c.id !== id))
  }

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "WELCOME20") {
      setAppliedCoupon("WELCOME20")
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-background py-20">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Your Cart is Empty</h1>
          <p className="mt-2 text-muted-foreground">Browse our courses and start your learning journey.</p>
          <Button className="mt-6 gap-2" asChild>
            <Link href="/courses">Browse Courses <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <p className="text-sm text-muted-foreground">{cartItems.length} course{cartItems.length !== 1 ? "s" : ""} in cart</p>

            {cartItems.map(course => (
              <Card key={course.id} className="border border-border">
                <CardContent className="flex gap-4 p-4">
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md bg-muted">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-foreground hover:text-primary">
                        {course.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">By {course.instructorName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] capitalize">{course.type}</Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">{course.level}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{formatPrice(course.price)}</p>
                      {course.originalPrice > course.price && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(course.originalPrice)}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20 border border-border">
              <CardContent className="flex flex-col gap-4 p-6">
                <h3 className="text-lg font-semibold text-foreground">Order Summary</h3>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Discount ({appliedCoupon})</span>
                    <span className="font-medium text-success">-{formatPrice(discount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
                </div>

                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Coupon code"
                      className="pl-10"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                </div>

                {appliedCoupon && (
                  <p className="text-xs text-success">Coupon {appliedCoupon} applied successfully!</p>
                )}

                <Button size="lg" className="w-full gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Secure payment powered by Razorpay
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
