# 🔧 Fix Database Connection - Step by Step

## Current Issue
Your database connection is failing with error: **"Tenant or user not found"**

This means the DATABASE_URL in your `.env` file is not correct.

---

## 🎯 Solution: Get Correct Connection String from Supabase

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. You should see your project: **clzkcwjhyjddknyzphgf**
4. Click on your project to open it

### Step 2: Navigate to Database Settings

1. In the left sidebar, click the **⚙️ Settings** icon (gear icon at bottom)
2. Click **Database** in the settings menu
3. Scroll down to find the **Connection String** section

### Step 3: Copy the Correct Connection String

You'll see several connection string options. You need **TWO** different strings:

#### A. Transaction Pooler (for DATABASE_URL)
1. Click on **Transaction** tab
2. You'll see a connection string like:
   ```
   postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
3. **IMPORTANT**: Notice it uses port **6543**
4. Copy this entire string

#### B. Direct Connection (for DIRECT_URL)
1. Click on **Session** tab (or Direct Connection)
2. You'll see a connection string like:
   ```
   postgresql://postgres.clzkcwjhyjddknyzphgf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
3. **IMPORTANT**: Notice it uses port **5432**
4. Copy this entire string

### Step 4: Get Your Database Password

If you see `[YOUR-PASSWORD]` in the connection strings:

1. In the same Database settings page, look for **Database Password** section
2. If you don't remember your password, click **Reset Database Password**
3. Copy the new password
4. **IMPORTANT**: Save this password somewhere safe!

### Step 5: URL-Encode Your Password

If your password contains special characters, you MUST URL-encode them:

| Character | URL-Encoded |
|-----------|-------------|
| `@`       | `%40`       |
| `#`       | `%23`       |
| `$`       | `%24`       |
| `%`       | `%25`       |
| `&`       | `%26`       |
| `+`       | `%2B`       |
| `=`       | `%3D`       |
| `?`       | `%3F`       |
| `/`       | `%2F`       |
| `:`       | `%3A`       |

**Example:**
- Original password: `Asjad@9934#`
- URL-encoded: `Asjad%409934%23`

### Step 6: Update Your .env File

Open your `.env` file and update these two lines:

```bash
# Transaction Pooler (port 6543) - add ?pgbouncer=true at the end
DATABASE_URL="postgresql://postgres.clzkcwjhyjddknyzphgf:[URL-ENCODED-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (port 5432)
DIRECT_URL="postgresql://postgres.clzkcwjhyjddknyzphgf:[URL-ENCODED-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Replace `[URL-ENCODED-PASSWORD]` with your actual URL-encoded password!**

---

## ✅ Step 7: Test the Connection

After updating your `.env` file, test the connection:

```bash
npx prisma db pull
```

**Expected Result:**
- Should succeed without errors
- Might say "No tables found" - that's OK! We'll create them next.

**If it still fails:**
- Double-check the connection string is EXACTLY as shown in Supabase
- Verify password is URL-encoded correctly
- Make sure you're using port 6543 for DATABASE_URL
- Make sure you're using port 5432 for DIRECT_URL
- Verify your Supabase project is not paused (check dashboard)

---

## 🚀 Step 8: Create Database Tables

Once the connection works, create all tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create all 30+ tables in your database
npx prisma db push

# Seed 203 LeetCode questions
npx prisma db seed
```

**This will create:**
- ✅ 30+ database tables
- ✅ All relationships and indexes
- ✅ 203 LeetCode questions loaded

---

## 🔍 Step 9: Verify Tables Were Created

Open Prisma Studio to see your tables:

```bash
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can see all your tables.

---

## 📦 Step 10: Setup Supabase Features

### A. User Sync Trigger

1. Go to Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/user-sync-trigger.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd+Enter)
7. Should see "Success. No rows returned"

### B. Storage Buckets

1. Still in SQL Editor
2. Click **New Query**
3. Copy the entire contents of `supabase/storage-buckets-setup.sql`
4. Paste into the SQL Editor
5. Click **Run**
6. Should see "Success. No rows returned"

---

## 🧪 Step 11: Test Everything

### Test 1: Registration
```bash
npm run dev
```
1. Open http://localhost:3001/register
2. Register a test user
3. Check Supabase Dashboard → Authentication → Users
4. User should appear in Auth
5. Open Prisma Studio → users table
6. User should also appear in database

### Test 2: Profile Page
1. Login with your test user
2. Go to http://localhost:3001/candidate/profile
3. Profile should load
4. Try uploading an avatar
5. Try editing your name - should auto-save

### Test 3: Questions
1. Go to http://localhost:3001/challenges
2. Should see 203 LeetCode questions
3. Click on any question
4. Should load the question details

### Test 4: Admin Dashboard
1. Open Prisma Studio
2. Find your user in the `users` table
3. Change `role` from `CANDIDATE` to `ADMIN`
4. Refresh your browser
5. Go to http://localhost:3001/admin
6. Should see admin dashboard with real data

---

## 🐛 Common Issues

### Issue: "Tenant or user not found"
**Solution:** Connection string is wrong. Go back to Step 2 and copy the exact string from Supabase.

### Issue: "Password authentication failed"
**Solution:** Password is wrong or not URL-encoded. Reset password in Supabase and URL-encode it.

### Issue: "relation 'public.users' does not exist"
**Solution:** Tables not created yet. Run `npx prisma db push`

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate` first

### Issue: "No seed command found"
**Solution:** Check that `prisma/seed.ts` exists and `package.json` has:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## 📋 Quick Checklist

- [ ] Got correct DATABASE_URL from Supabase (port 6543)
- [ ] Got correct DIRECT_URL from Supabase (port 5432)
- [ ] URL-encoded password if it has special characters
- [ ] Updated `.env` file
- [ ] Tested connection with `npx prisma db pull`
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push`
- [ ] Ran `npx prisma db seed`
- [ ] Ran `supabase/user-sync-trigger.sql` in Supabase
- [ ] Ran `supabase/storage-buckets-setup.sql` in Supabase
- [ ] Tested registration
- [ ] Tested profile page
- [ ] Tested admin dashboard

---

## 🎉 Success!

Once all steps are complete, your ZCAT platform will be fully functional with:

✅ Database connected and all tables created
✅ 203 LeetCode questions loaded
✅ User registration working
✅ Profile management with auto-save
✅ Avatar and resume uploads
✅ Admin dashboard with live data
✅ All features ready to use

---

## 📞 Still Need Help?

If you're still stuck after following all steps:

1. **Check Supabase Project Status:**
   - Dashboard → Project Settings → General
   - Verify project is not paused
   - Check if there are any billing issues

2. **Verify Connection String Format:**
   ```
   postgresql://postgres.PROJECT_ID:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true
   ```

3. **Test with psql (if installed):**
   ```bash
   psql "YOUR_DATABASE_URL_HERE"
   ```

4. **Check Supabase Logs:**
   - Dashboard → Logs
   - Look for connection errors

---

**Current Status:** Waiting for you to get the correct connection string from Supabase Dashboard.

**Next Step:** Follow Step 1-6 above to get and update your DATABASE_URL.
