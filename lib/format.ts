// Pure utility functions - safe for both server and client components

export function formatPrice(amount: number | undefined | null, currency: string = "INR"): string {
  const n = Number(amount)
  const value = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getInitials(name: string | undefined | null): string {
  if (name == null || typeof name !== "string") return "?"
  const trimmed = name.trim()
  if (!trimmed) return "?"
  return trimmed
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
