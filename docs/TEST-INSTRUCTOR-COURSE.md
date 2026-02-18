# Test: Create a sample course (instructor)

With the dev server running (`npm run dev`), follow these steps.

## 1. Log in as instructor

- Open **http://localhost:3000/auth/login**
- If you use **seed data**: log in with  
  - Email: `priya@example.com`  
  - Password: (whatever you set for seed users; if you only seeded Firestore, create this user in Firebase Auth with the same UID `u2`, or use a user whose Firestore `users/{uid}` doc has `role: "instructor"`)
- If you don’t have an instructor yet: create a user in Firebase Auth, then in Firestore set `users/{that-uid}` with `role: "instructor"` (and other required fields: name, email, referralCode, createdAt, blocked).

## 2. Open the course builder

- Go to **http://localhost:3000/instructor/courses/new**  
- (If you weren’t logged in, you’ll be sent to login first; after login you’ll be redirected back to this URL.)

## 3. Create a sample course

**Minimum to save:**

- **Course Title** (required): e.g. `Test Course – Sample`
- Leave other fields default or fill as you like.

**Optional but useful:**

- **Short Description:** e.g. `A short sample course.`
- **Pricing:** Selling Price `999`, Original Price `1999`
- **Curriculum:** Keep the default section/lessons or add more.

## 4. Save and publish

**Option A – Publish immediately**

- Open the **Settings** tab.
- Click **Save & Publish Course**.  
- You should see: “Course published! It will appear on the courses page.” and be redirected to **My Courses**.

**Option B – Draft first**

- Click **Save Draft** (top right).  
- Toast: “Course saved as draft…”  
- Then open **Settings** and click **Publish Course**.  
- You should see the same success message and redirect.

## 5. Confirm it appears

- Open **http://localhost:3000/courses** (public courses page).
- Your new course should appear in the list.
- If it doesn’t, focus the tab/window again (refetch on focus) or refresh the page.
- Click the course to open its detail page (`/courses/{slug}`).

## 6. Optional: check Firebase

- In Firebase Console → Firestore:
  - **courses**: one document with your course (e.g. `status: "published"`).
  - **sections**: one or more documents with `courseId` equal to that course’s id and a `lessons` array.

## Troubleshooting

- **“Sign in again to save the course”**  
  You’re not logged in or the session expired. Log in again and go back to `/instructor/courses/new`.

- **“Enter a course title”**  
  Leave the Course Title field empty. Enter any non‑empty title.

- **Course not on /courses**  
  - Ensure you clicked **Save & Publish** or **Publish Course** (not only Save Draft).  
  - Refresh `/courses` or switch to another tab and back.  
  - In Firestore, confirm the course document has `status: "published"`.

- **403 on POST /api/instructor/courses**  
  Your Firestore `users/{uid}` must have `role: "instructor"` (or admin/superadmin).
