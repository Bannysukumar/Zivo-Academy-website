"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Course } from "@/lib/types"

const CART_STORAGE_KEY = "zivo-cart"

interface CartContextValue {
  items: Course[]
  addItem: (course: Course) => void
  removeItem: (courseId: string) => void
  clearCart: () => void
  isInCart: (courseId: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): Course[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Course[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items: Course[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Course[]>([])

  useEffect(() => {
    setItems(loadCart())
  }, [])

  const persist = useCallback((next: Course[]) => {
    setItems(next)
    saveCart(next)
  }, [])

  const addItem = useCallback(
    (course: Course) => {
      setItems((prev) => {
        if (prev.some((c) => c.id === course.id)) return prev
        const next = [...prev, course]
        saveCart(next)
        return next
      })
    },
    []
  )

  const removeItem = useCallback((courseId: string) => {
    setItems((prev) => {
      const next = prev.filter((c) => c.id !== courseId)
      saveCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    saveCart([])
  }, [])

  const isInCart = useCallback(
    (courseId: string) => items.some((c) => c.id === courseId),
    [items]
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      clearCart: () => {},
      isInCart: () => false,
    }
  }
  return ctx
}
