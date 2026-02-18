"use client"

import type { User, CartItem, Notification } from "./types"

// App state types (user/notifications come from Firebase Auth + Firestore)
export interface AppState {
  user: User | null
  cart: CartItem[]
  notifications: Notification[]
  setUser: (user: User | null) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (courseId: string) => void
  clearCart: () => void
  markNotificationRead: (id: string) => void
}

export function getDemoUser(_role?: string): User | null {
  return null
}

export function getDemoNotifications(_userId: string): Notification[] {
  return []
}
