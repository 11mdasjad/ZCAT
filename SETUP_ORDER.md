# 🚀 ZCAT Platform - Complete Setup Order

## ⚠️ IMPORTANT: Follow This Exact Order

You're getting errors because steps are being done out of order. Follow this sequence:

---

## 📋 Setup Sequence

### ✅ Step 1: Fix Database Connection (5 minutes)

**Problem:** Your DATABASE_URL is incorrect, causing "Tenant or user not found" error.

**Solution:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `clzkcwjhyjddknyzphgf`
3. Go to: **Project Settings** → **Database**
4. Find: **Connection String** section
5. Select: **Transaction Pooler** (not Session Pooler)
6. Copy the connection string

**Update `.env` file:**
```bash
# Replace these lines in your .env file:

DATABASE_URL="postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Important:**
- Replace `[YOUR-PASSWORD]` with your actual password
- If password has special characters, URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`

**Test connection:**
```bash
npx prisma db pull
```
Should succeed without errors.

---

### ✅ Step 2: Create Database Tables (2 minutes)

**Now that connection works, create all tables:**

```bash
# Generate Prisma Client
npx prisma generate

# Create all tables in database
npx prisma db push
```

**This creates 30+ tables:**
- users
- profiles
- candidate_profiles
- recruiter_profiles
- assessments
- questions
- submissions
- exam_sessions
- violations
- certificates
- And more...

**Verify tables exist:**
```bash
npx prisma studio
```
Opens a GUI showing all your tables.

---

### ✅ Step 3: Seed LeetCode Questions (1 minute)

**Populate questions table with 203 LeetCode questions:**

```bash
npx prisma db seed
```

**Verify questions were added:**
```bash
npx prisma studio
```
Check the `questions` table - should have 203 rows.

---

### ✅ Step 4: Setup Supabase User Sync Trigger (2 minutes)

**This syncs Supabase Auth users to your Prisma tables:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open file: `supabase/user-sync-trigger.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click **Run** (or press Cmd+Enter)
7. Verify "Success" message

**What this does:**
- Automatically syncs new users from Supabase Auth to your database
- Creates records in: users, profiles, candidate_profiles
- Creates audit logs
- Syncs email verification status

---

### ✅ Step 5: Setup Supabase Storage Buckets (2 minutes)

**This creates storage for avatars and resumes:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open file: `supabase/storage-buckets-setup.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click **Run**
7. Verify "Success" message

**What this creates:**
- `avatars` bucket (public) - for profile pictures
- `resumes` bucket (private) - for resume files
- Storage policies for access control

**Verify buckets exist:**
1. Go to Supabase Dashboard → **Storage**
2. Should see two buckets: `avatars` and `resumes`

---

### ✅ Step 6: Test Everything (5 minutes)

**6.1 Test Registration:**
```bash
# Make sure dev server is running
npm run dev

# Open browser
http://localhost:3001/register

# Register a test candidate
# Use a real email you can access
```

**Verify:**
- Check Supabase Dashboard → Authentication → Users
- Should see your new user
- Check Prisma Studio → users table
- Should see your new user there too

**6.2 Test Profile Page:**
```bash
# Login with test user
http://localhost:3001/login

# Navigate to profile
http://localhost:3001/candidate/profile
```

**Verify:**
- Profile data loads
- All fields visible
- No console errors

**6.3 Test Avatar Upload:**
- Click upload button on avatar
- Select an image
- Should upload successfully
- Avatar should update

**6.4 Test Resume Upload:**
- Click upload area in Resume section
- Select a PDF or DOC file
- Should upload successfully
- "View" and "Replace" buttons should appear

**6.5 Test Auto-Save:**
- Edit any field (name, bio, etc.)
- Wait 1 second
- Should see "Saving..." → "Saved [time]"
- Refresh page
- Changes should persist

**6.6 Test Admin Dashboard:**
```bash
# First, make your user an admin
# Run this in Supabase SQL Editor:
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';

# Then navigate to admin dashboard
http://localhost:3001/admin
```

**Verify:**
- Dashboard loads
- KPI cards show real numbers
- Charts render
- Tables show data

---

## 🎯 Quick Command Summary

```bash
# 1. Fix DATABASE_URL in .env (get from Supabase)

# 2. Create tables
npx prisma generate
npx prisma db push

# 3. Seed questions
npx prisma db seed

# 4. Run in Supabase SQL Editor:
#    - supabase/user-sync-trigger.sql
#    - supabase/storage-buckets-setup.sql

# 5. Start server
npm run dev

# 6. Test
#    - Register: http://localhost:3001/register
#    - Profile: http://localhost:3001/candidate/profile
#    - Admin: http://localhost:3001/admin
```

---

## ✅ Completion Checklist

- [ ] DATABASE_URL fixed in .env
- [ ] `npx prisma db push` succeeded
- [ ] Tables visible in Prisma Studio
- [ ] `npx prisma db seed` succeeded
- [ ] 203 questions in database
- [ ] User sync trigger installed
- [ ] Storage buckets created
- [ ] Test user registered
- [ ] Test user appears in database
- [ ] Profile page loads
- [ ] Avatar upload works
- [ ] Resume upload works
- [ ] Auto-save works
- [ ] Admin dashboard loads

---

## 🐛 Common Issues

### "Tenant or user not found"
→ DATABASE_URL is wrong. Get correct one from Supabase.

### "relation 'public.users' does not exist"
→ Tables not created. Run `npx prisma db push`.

### "Failed to upload file"
→ Storage buckets not created. Run `storage-buckets-setup.sql`.

### "Failed to save profile"
→ Check browser console and server logs for specific error.

---

## 📞 Still Having Issues?

1. **Check Supabase project is not paused:**
   - Go to Supabase Dashboard
   - Look for "Project paused" banner

2. **Verify connection string:**
   - Copy it again from Supabase
   - Make sure using Transaction Pooler
   - Double-check password

3. **Check logs:**
   - Browser console (F12)
   - Server terminal
   - Supabase logs

4. **Test basic connection:**
   ```bash
   npx prisma db pull
   ```
   Should work without errors.

---

## 🎉 Success!

Once all steps are complete, you'll have:

✅ Full database with all tables
✅ 203 LeetCode questions loaded
✅ User registration with auto-sync
✅ Profile management with auto-save
✅ Avatar and resume uploads
✅ Admin dashboard with live data
✅ All features working!

---

**Current Status:** Need to fix DATABASE_URL first, then follow steps in order.

**Next Action:** Get correct DATABASE_URL from Supabase Dashboard and update `.env` file.
