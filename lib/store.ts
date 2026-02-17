"use client"

import { createContext, useContext } from "react"
import type { User, CartItem, Notification } from "./types"
import { mockUsers, mockNotifications } from "./mock-data"

// Simple context-based store (replaces Zustand for demo)
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

// Demo auth helpers
export function getDemoUser(role: string = "student"): User | null {
  return mockUsers.find(u => u.role === role) || null
}

export function getDemoNotifications(userId: string): Notification[] {
  return mockNotifications.filter(n => n.userId === userId)
}

// Pure format utils are in @/lib/format - import them from there directly
