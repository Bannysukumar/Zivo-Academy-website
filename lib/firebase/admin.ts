import { getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { readFileSync } from "fs"
import { join } from "path"

function getAdminApp(): App {
  const existing = getApps()
  if (existing.length > 0) return existing[0] as App

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const credentialsPath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH

  let credential: { projectId: string; clientEmail: string; privateKey: string }

  if (privateKey && projectId && clientEmail) {
    credential = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }
  } else if (credentialsPath) {
    const path = credentialsPath
    try {
      const json = JSON.parse(readFileSync(credentialsPath, "utf-8"))
      credential = {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key,
      }
    } catch (e) {
      throw new Error(
        "Firebase Admin: set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env, or FIREBASE_ADMIN_CREDENTIALS_PATH to your service account JSON path. " + String(e)
      )
    }
  } else {
    try {
      const path = join(process.cwd(), "zivo-academy-7c4e5-firebase-adminsdk-fbsvc-4e693d60b2.json")
      const json = JSON.parse(readFileSync(path, "utf-8"))
      credential = {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key,
      }
    } catch {
      throw new Error(
        "Firebase Admin: no credentials. Set env vars or place zivo-academy-7c4e5-firebase-adminsdk-fbsvc-4e693d60b2.json in project root."
      )
    }
  }

  return initializeApp({
    credential: cert(credential),
    projectId: credential.projectId,
  })
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp())
}

export { getAdminApp }
