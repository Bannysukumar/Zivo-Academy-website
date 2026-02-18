"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { CourseCard } from "@/components/course-card"
import { useCourses, useCategories } from "@/lib/firebase/hooks"
import { Search, SlidersHorizontal, X } from "lucide-react"

type SortOption = "popular" | "newest" | "price-low" | "price-high" | "rating"

export function CourseListing() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [level, setLevel] = useState<string>("all")
  const [type, setType] = useState<string>("all")
  const [sort, setSort] = useState<SortOption>("popular")
  const [showFilters, setShowFilters] = useState(false)

  const { data: courses, loading: coursesLoading, refetch } = useCourses({ publishedOnly: true })
  const { data: categories, loading: categoriesLoading } = useCategories()
  const published = courses.filter((c) => (c.status === "published"))

  useEffect(() => {
    const onFocus = () => refetch()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetch])

  const filtered = useMemo(() => {
    let result = [...published]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.categoryName ?? "").toLowerCase().includes(q) ||
        (c.tags ?? []).some((t) => String(t).toLowerCase().includes(q))
      )
    }
    if (category !== "all") result = result.filter(c => c.categoryId === category)
    if (level !== "all") result = result.filter(c => c.level === level)
    if (type !== "all") result = result.filter(c => c.type === type)

    switch (sort) {
      case "popular": result.sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0)); break
      case "newest": result.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); break
      case "price-low": result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break
      case "price-high": result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break
      case "rating": result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
    }

    return result
  }, [published, search, category, level, type, sort])

  const activeFilters = [category !== "all", level !== "all", type !== "all"].filter(Boolean).length

  return (
    <div className="bg-background py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground md:text-4xl">
            All Courses
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filtered.length} course{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {activeFilters}
                </Badge>
              )}
            </Button>

            <div className={`${showFilters ? "flex" : "hidden"} flex-wrap gap-2 md:flex`}>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="recorded">Recorded</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground"
                onClick={() => { setCategory("all"); setLevel("all"); setType("all") }}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {coursesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-foreground">No courses found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  )
}
