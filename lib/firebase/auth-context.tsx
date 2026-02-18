"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { getFirebaseAuth, getFirestoreDb } from "./client"
import { COLLECTIONS } from "./collections"
import type { User } from "@/lib/types"

interface AuthState {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, referralCode?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

/** Firestore does not allow undefined; omit those keys when writing. */
function withoutUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<User | null> {
  const db = getFirestoreDb()
  const userRef = doc(db, COLLECTIONS.users, firebaseUser.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data() as User
    if (data.blocked) return null
    return data
  }
  const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User"
  const referralCode = generateReferralCode()
  const profile: User = {
    id: firebaseUser.uid,
    name: displayName,
    email: firebaseUser.email || "",
    ...(firebaseUser.photoURL && { avatar: firebaseUser.photoURL }),
    role: "student",
    referralCode,
    createdAt: new Date().toISOString().slice(0, 10),
    blocked: false,
  }
  await setDoc(userRef, withoutUndefined(profile as Record<string, unknown>))
  return profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  })

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth()
    await firebaseSignOut(auth)
    setState((s) => ({ ...s, user: null, firebaseUser: null, error: null }))
  }, [])

  const syncUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setState((s) => ({ ...s, user: null, firebaseUser: null, loading: false }))
      return
    }
    try {
      const profile = await getOrCreateUserProfile(firebaseUser)
      if (profile === null) {
        await firebaseSignOut(getFirebaseAuth())
        setState((s) => ({
          ...s,
          user: null,
          firebaseUser: null,
          loading: false,
          error: "Your account has been blocked. Contact support.",
        }))
        return
      }
      setState((s) => ({ ...s, user: profile, firebaseUser, loading: false, error: null }))
    } catch (e) {
      setState((s) => ({
        ...s,
        user: null,
        firebaseUser: firebaseUser,
        loading: false,
        error: "Could not load profile.",
      }))
    }
  }, [])

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      syncUser(firebaseUser)
    })
    return () => unsub()
  }, [syncUser])

  useEffect(() => {
    const firebaseUser = state.firebaseUser
    if (!firebaseUser) return
    const db = getFirestoreDb()
    const userRef = doc(db, COLLECTIONS.users, firebaseUser.uid)
    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      if (data?.blocked === true) {
        firebaseSignOut(getFirebaseAuth())
        setState((s) => ({
          ...s,
          user: null,
          firebaseUser: null,
          error: "Your account has been blocked. Contact support.",
        }))
      }
    })
    return () => unsub()
  }, [state.firebaseUser?.uid])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const auth = getFirebaseAuth()
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await syncUser(cred.user)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed"
      setState((s) => ({ ...s, loading: false, error: message }))
      throw e
    }
  }, [syncUser])

  const signup = useCallback(
    async (email: string, password: string, name: string, referralCode?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const auth = getFirebaseAuth()
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const db = getFirestoreDb()
        const userRef = doc(db, COLLECTIONS.users, cred.user.uid)
        const code = generateReferralCode()
        const profileForDb: Record<string, unknown> = {
          id: cred.user.uid,
          name,
          email,
          role: "student",
          referralCode: code,
          createdAt: new Date().toISOString().slice(0, 10),
          blocked: false,
        }
        if (referralCode?.trim()) profileForDb.referredBy = referralCode.trim().toUpperCase()
        await setDoc(userRef, withoutUndefined(profileForDb))
        await syncUser(cred.user)
        setState((s) => ({ ...s, loading: false, error: null }))
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Sign up failed"
        setState((s) => ({ ...s, loading: false, error: message }))
        throw e
      }
    },
    [syncUser]
  )

  const signInWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const auth = getFirebaseAuth()
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      await syncUser(cred.user)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Google sign-in failed"
      setState((s) => ({ ...s, loading: false, error: message }))
      throw e
    }
  }, [syncUser])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    signInWithGoogle,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
