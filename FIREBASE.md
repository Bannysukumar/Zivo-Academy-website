# Firebase Setup (ZIVO Academy)

The app uses **Firebase Auth** (Email/Password + Google) and **Firestore** for data. The client config is in `.env`; the Admin SDK uses the same env vars or the service account JSON file for server-side (e.g. seed API).

## 1. Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/) → your project **zivo-academy-7c4e5**.
2. **Authentication** → Sign-in method:
   - Enable **Email/Password**.
   - Enable **Google** and set support email.
3. **Firestore Database** → Create database (production or test mode). Use **Firestore** (not Realtime Database) for this app.
4. (Optional) **Firestore** → Indexes: deploy the app’s indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```
   Or create any indexes suggested by the SDK error messages in the console.

## 2. Environment variables

- **Client (browser):** Already in `.env` as `NEXT_PUBLIC_FIREBASE_*`.
- **Server (Admin SDK):**
  - **Local dev:** The file `zivo-academy-7c4e5-firebase-adminsdk-fbsvc-4e693d60b2.json` in the project root is used (via `FIREBASE_ADMIN_CREDENTIALS_PATH` or default path).
  - **Production:** Set these in your host (e.g. Vercel):
    - `FIREBASE_ADMIN_PROJECT_ID`
    - `FIREBASE_ADMIN_CLIENT_EMAIL`
    - `FIREBASE_ADMIN_PRIVATE_KEY` (paste the private key from the JSON; newlines as `\n`)

Do **not** commit the service account JSON or `.env` to git.

## 3. Seed Firestore (one-time)

To load categories, courses, and other mock data into Firestore:

```bash
curl -X POST "http://localhost:3000/api/seed?secret=seed"
```

Or open in browser (POST with a tool like Postman):

`POST https://your-domain.com/api/seed?secret=seed`

**Security:** Change the `secret` query value in `app/api/seed/route.ts` (e.g. to a long random string) and only call the seed endpoint in a trusted environment.

## 4. User roles

- New sign-ups get role **student** and a document in the `users` collection.
- To make a user **instructor** or **admin**, update their document in Firestore: `users/{uid}` → set `role` to `"instructor"` or `"admin"`.

## 5. Production checklist

- [ ] Email/Password and Google sign-in enabled in Firebase Console.
- [ ] Firestore created and indexes deployed (or created from error links).
- [ ] Production env vars set (`FIREBASE_ADMIN_*`) on the hosting platform.
- [ ] Seed run once (with a safe `secret`) so Firestore has initial data.
- [ ] `.env` and service account JSON are in `.gitignore` and not deployed.
