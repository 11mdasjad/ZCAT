# 🗄️ Database Setup Guide - CRITICAL

## ⚠️ Current Issue

You're getting the error: **"relation 'public.users' does not exist"**

This means your Prisma database tables haven't been created yet. Here's how to fix it:

---

## 📋 Step-by-Step Setup

### Step 1: Fix Database Connection (CRITICAL)

Your current `DATABASE_URL` is incorrect. You need to get the right connection string from Supabase.

**Instructions:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `clzkcwjhyjddknyzphgf`
3. Go to **Project Settings** (gear icon in sidebar)
4. Click **Database** in the left menu
5. Scroll to **Connection String** section
6. Select **Transaction Pooler** (not Session Pooler)
7. Copy the connection string

**It should look like this:**
```
postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Update your `.env` file:**
```bash
# Replace the DATABASE_URL line with the correct one from Supabase
DATABASE_URL="postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Also update DIRECT_URL (use port 5432 instead of 6543)
DIRECT_URL="postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` with your actual database password
- Use port **6543** for DATABASE_URL (Transaction Pooler)
- Use port **5432** for DIRECT_URL (Direct Connection)
- URL encode special characters in password (e.g., `@` becomes `%40`, `#` becomes `%23`)

---

### Step 2: Create Database Tables

Once your connection is fixed, run Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init
```

**This will create all 30+ tables:**
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
- notifications
- audit_logs
- And more...

**Verify tables were created:**
```bash
npx prisma studio
```
This opens a GUI where you can see all your tables.

---

### Step 3: Seed Database with Questions

After tables are created, seed the LeetCode questions:

```bash
npx prisma db seed
```

This will populate the `questions` table with 203 LeetCode questions.

---

### Step 4: Run Supabase Triggers

Now you can run the SQL scripts in Supabase:

**4.1 User Sync Trigger:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/user-sync-trigger.sql`
3. Paste and run
4. Verify success

**4.2 Storage Buckets:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/storage-buckets-setup.sql`
3. Paste and run
4. Verify success

---

## 🧪 Verification Steps

### 1. Test Database Connection
```bash
npx prisma db pull
```
Should succeed without errors.

### 2. Check Tables Exist
```bash
npx prisma studio
```
Should show all tables in the GUI.

### 3. Test Registration
1. Go to `http://localhost:3001/register`
2. Register a test user
3. Check Supabase Auth dashboard - user should appear
4. Check `users` table in Prisma Studio - user should appear

### 4. Test Profile Page
1. Login with test user
2. Go to `http://localhost:3001/candidate/profile`
3. Profile should load without errors

---

## 🐛 Troubleshooting

### Error: "Tenant or user not found"

**Cause:** Incorrect DATABASE_URL

**Solution:**
1. Double-check connection string from Supabase
2. Verify password is correct
3. Verify password is URL-encoded
4. Verify using Transaction Pooler (port 6543)
5. Verify project ID is correct

**Test connection:**
```bash
# Try connecting with psql
psql "postgresql://postgres.clzkcwjhyjddknyzphgf:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

### Error: "relation 'public.users' does not exist"

**Cause:** Tables not created yet

**Solution:**
```bash
npx prisma db push
```

---

### Error: "Password authentication failed"

**Cause:** Wrong password or not URL-encoded

**Solution:**
1. Go to Supabase Dashboard → Project Settings → Database
2. Click "Reset Database Password"
3. Copy new password
4. URL-encode special characters:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`
5. Update `.env` file

---

### Error: "SSL connection required"

**Cause:** Missing SSL parameter

**Solution:**
Add `?sslmode=require` to connection string:
```
postgresql://...?pgbouncer=true&sslmode=require
```

---

## 📝 Complete Setup Checklist

- [ ] Get correct DATABASE_URL from Supabase
- [ ] Update `.env` file with correct connection strings
- [ ] URL-encode password if it has special characters
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push` (creates tables)
- [ ] Verify tables exist with `npx prisma studio`
- [ ] Run `npx prisma db seed` (seeds questions)
- [ ] Run `supabase/user-sync-trigger.sql` in Supabase
- [ ] Run `supabase/storage-buckets-setup.sql` in Supabase
- [ ] Test registration flow
- [ ] Test profile page
- [ ] Test admin dashboard

---

## 🎯 Quick Fix (TL;DR)

```bash
# 1. Fix DATABASE_URL in .env (get from Supabase Dashboard)

# 2. Create tables
npx prisma db push

# 3. Seed questions
npx prisma db seed

# 4. Run SQL scripts in Supabase SQL Editor:
#    - supabase/user-sync-trigger.sql
#    - supabase/storage-buckets-setup.sql

# 5. Test
npm run dev
# Open http://localhost:3001/register
```

---

## 📞 Need Help?

If you're still having issues:

1. **Check Supabase Project Status:**
   - Go to Supabase Dashboard
   - Verify project is not paused
   - Check database is healthy

2. **Verify Connection String:**
   - Copy connection string again from Supabase
   - Make sure you're using Transaction Pooler
   - Double-check password

3. **Check Logs:**
   - Browser console (F12)
   - Server logs in terminal
   - Supabase logs in dashboard

4. **Test Simple Query:**
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1"
   ```
   Should return `1` if connection works.

---

## 🚀 After Setup

Once everything is working:

1. ✅ Registration flow works
2. ✅ Users sync to database automatically
3. ✅ Profile page loads
4. ✅ Avatar upload works
5. ✅ Resume upload works
6. ✅ Admin dashboard shows real data
7. ✅ All features functional

---

**Current Status:** Database connection needs to be fixed first, then tables can be created.

**Next Step:** Get the correct DATABASE_URL from Supabase Dashboard and update your `.env` file.
