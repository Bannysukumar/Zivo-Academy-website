"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Star, Clock, BookOpen, Users, Play, Lock, FileText, ClipboardList,
  CheckCircle2, ShoppingCart, Heart, Share2, Globe, BarChart3, Award, Video
} from "lucide-react"
import { formatPrice, getInitials } from "@/lib/format"
import { useSections, useReviews } from "@/lib/firebase/hooks"
import { useCart } from "@/lib/cart-context"
import type { Course } from "@/lib/types"

interface CourseDetailViewProps {
  course: Course
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { addItem, isInCart } = useCart()
  const { data: sections = [] } = useSections(course.id)
  const { data: reviews = [] } = useReviews(course.id)
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const freeLessons = sections.reduce((acc, s) => acc + s.lessons.filter(l => l.isFree).length, 0)
  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="h-4 w-4" />
      case "quiz": return <ClipboardList className="h-4 w-4" />
      case "assignment": return <FileText className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-background">
      {/* Hero Banner */}
      <div className="bg-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">{course.categoryName}</Badge>
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground capitalize">{course.level}</Badge>
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground capitalize">{course.type}</Badge>
              </div>

              <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-background md:text-3xl lg:text-4xl">
                {course.title}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-background/70 md:text-lg">
                {course.shortDescription}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-background/60">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-semibold text-background">{course.rating}</span>
                  ({course.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrollmentCount.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {course.language}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {getInitials(course.instructorName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-background/70">
                  Created by <span className="font-medium text-background">{course.instructorName}</span>
                </span>
              </div>
            </div>

            {/* Sticky Price Card (desktop) */}
            <div className="hidden lg:block">
              <PriceCard course={course} discount={discount} totalLessons={totalLessons} onAddToCart={() => addItem(course)} onBuyNow={() => { addItem(course); router.push("/cart") }} isInCart={isInCart(course.id)} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Mobile Price Card */}
            <div className="mb-6 lg:hidden">
              <PriceCard course={course} discount={discount} totalLessons={totalLessons} onAddToCart={() => addItem(course)} onBuyNow={() => { addItem(course); router.push("/cart") }} isInCart={isInCart(course.id)} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                {/* What you'll learn */}
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-primary" /> What You{"'"}ll Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {course.outcomes.map((o, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span className="text-sm text-foreground">{o}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground">About This Course</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{course.description}</p>
                </div>

                {/* Requirements */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground">Requirements</h3>
                  <ul className="mt-3 flex flex-col gap-2">
                    {course.requirements.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Who is this for */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground">Who This Course Is For</h3>
                  <ul className="mt-3 flex flex-col gap-2">
                    {course.forWho.map((w, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{sections.length} sections</span>
                  <span>{totalLessons} lessons</span>
                  <span>{course.duration} total</span>
                  {freeLessons > 0 && (
                    <Badge variant="secondary" className="text-xs">{freeLessons} free preview{freeLessons > 1 ? "s" : ""}</Badge>
                  )}
                </div>

                <Accordion type="multiple" className="flex flex-col gap-2">
                  {sections.map(section => (
                    <AccordionItem key={section.id} value={section.id} className="rounded-lg border border-border">
                      <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span>{section.title}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {section.lessons.length} lessons
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="flex flex-col gap-1">
                          {section.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-secondary/50">
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">{lessonIcon(lesson.type)}</span>
                                <span className="text-foreground">{lesson.title}</span>
                                {lesson.isFree && <Badge variant="secondary" className="text-[10px]">Preview</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{lesson.duration}</span>
                                {!lesson.isFree && <Lock className="h-3.5 w-3.5" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                {/* Rating Summary */}
                <div className="mb-6 flex items-center gap-6 rounded-lg border border-border p-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{course.rating}</p>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(course.rating) ? "fill-warning text-warning" : "text-border"}`} />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{course.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = reviews.filter(r => r.rating === stars).length
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-12 text-right text-muted-foreground">{stars} stars</span>
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="w-8 text-muted-foreground">{Math.round(pct)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Review List */}
                <div className="flex flex-col gap-4">
                  {reviews.map(review => (
                    <Card key={review.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(review.userName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{review.userName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-warning text-warning" : "text-border"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <Accordion type="single" collapsible className="flex flex-col gap-2">
                  {[
                    { q: "How long do I have access to this course?", a: "You get lifetime access to all course materials including future updates." },
                    { q: "Is there a money-back guarantee?", a: "Yes, we offer a 7-day money-back guarantee. No questions asked." },
                    { q: "Do I get a certificate after completion?", a: "Yes! Upon completing all modules and passing the assessments, you will receive a verifiable certificate of completion." },
                    { q: "Can I download the course content?", a: "You can download resources and notes. Video content is available for streaming only." },
                    { q: "Are there any prerequisites?", a: `The prerequisites for this course are: ${course.requirements.join(", ")}` },
                  ].map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border">
                      <AccordionTrigger className="px-4 text-sm font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                      <AccordionContent className="px-4 text-sm text-muted-foreground">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop sidebar spacer */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  )
}

function PriceCard({
  course,
  discount,
  totalLessons,
  onAddToCart,
  onBuyNow,
  isInCart,
}: {
  course: Course
  discount: number
  totalLessons: number
  onAddToCart: () => void
  onBuyNow: () => void
  isInCart: boolean
}) {
  return (
    <Card className="sticky top-20 border border-border shadow-lg">
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Preview placeholder */}
        <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Preview this course</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-foreground">{formatPrice(course.price)}</span>
          {discount > 0 && (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(course.originalPrice)}</span>
              <Badge className="bg-destructive text-destructive-foreground">{discount}% OFF</Badge>
            </>
          )}
        </div>

        {/* Buttons */}
        <Button size="lg" className="w-full gap-2" onClick={onAddToCart} disabled={isInCart}>
          <ShoppingCart className="h-4 w-4" /> {isInCart ? "In Cart" : "Add to Cart"}
        </Button>
        <Button size="lg" variant="outline" className="w-full" onClick={onBuyNow}>
          Buy Now
        </Button>

        {/* Quick Info */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Video className="h-4 w-4" /> Lessons</span>
            <span className="font-medium text-foreground">{totalLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Duration</span>
            <span className="font-medium text-foreground">{course.duration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><BarChart3 className="h-4 w-4" /> Level</span>
            <span className="font-medium capitalize text-foreground">{course.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" /> Language</span>
            <span className="font-medium text-foreground">{course.language}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> Certificate</span>
            <span className="font-medium text-foreground">Yes</span>
          </div>
        </div>

        {/* Share */}
        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Button variant="ghost" size="sm" className="flex-1 gap-1 text-xs text-muted-foreground">
            <Heart className="h-4 w-4" /> Wishlist
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-1 text-xs text-muted-foreground">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
