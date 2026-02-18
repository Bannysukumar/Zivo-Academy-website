"use client"

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

function getApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig)
  }
  return getApps()[0] as FirebaseApp
}

let analytics: Analytics | null = null

export function getFirebaseApp() {
  return getApp()
}

export function getFirebaseAuth() {
  return getAuth(getApp())
}

export function getFirestoreDb() {
  return getFirestore(getApp())
}

export function getFirebaseStorage() {
  return getStorage(getApp())
}

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null
  const supported = await isSupported()
  if (!supported) return null
  if (!analytics) analytics = getAnalytics(getApp())
  return analytics
}

// Optional: connect to emulators in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true"
  if (useEmulator) {
    try {
      connectAuthEmulator(getFirebaseAuth(), "http://127.0.0.1:9099", { disableWarnings: true })
      connectFirestoreEmulator(getFirestoreDb(), "127.0.0.1", 8080)
    } catch {
      // ignore if emulator not running
    }
  }
}
