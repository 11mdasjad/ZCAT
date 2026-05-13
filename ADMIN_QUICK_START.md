# 🚀 Admin Dashboard - Quick Start Guide

## 📋 TL;DR - Do These 2 Things First

### 1️⃣ Fix Database Connection (2 minutes)
```bash
# Go to: https://supabase.com/dashboard
# Navigate to: Project Settings → Database → Connection String
# Select: "Transaction Pooler"
# Copy the connection string
# Update .env file with the correct DATABASE_URL
```

### 2️⃣ Run Supabase Trigger (1 minute)
```bash
# Go to: https://supabase.com/dashboard
# Navigate to: SQL Editor → New Query
# Copy contents of: supabase/user-sync-trigger.sql
# Paste and click "Run"
```

---

## 🎯 What Was Built

| Feature | Status | File |
|---------|--------|------|
| Registration (Candidate Only) | ✅ | `src/app/(auth)/register/page.tsx` |
| Recruiter Contact Banner | ✅ | `src/app/(auth)/register/page.tsx` |
| User Sync Trigger | ✅ | `supabase/user-sync-trigger.sql` |
| Admin Users API | ✅ | `src/app/api/v1/admin/users/route.ts` |
| Admin Stats API | ✅ | `src/app/api/v1/admin/stats/route.ts` |
| Live Admin Dashboard | ✅ | `src/app/(dashboard)/admin/page.tsx` |

---

## 🧪 Quick Test (5 minutes)

### Test Registration
```bash
# 1. Open browser
http://localhost:3001/register

# 2. Verify:
✓ No role selection (only candidate)
✓ "Contact Admin" banner visible
✓ Register a test user
✓ Check Supabase Auth dashboard
```

### Test Admin Dashboard
```bash
# 1. Create admin user (run in Supabase SQL Editor):
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';

# 2. Login and navigate to:
http://localhost:3001/admin

# 3. Verify:
✓ Dashboard loads
✓ KPI cards show real numbers
✓ Charts render
✓ Tables show data
✓ No console errors
```

---

## 🔗 API Endpoints

### Get All Users (Admin Only)
```bash
GET /api/v1/admin/users
GET /api/v1/admin/users?page=1&limit=10
GET /api/v1/admin/users?search=john
GET /api/v1/admin/users?role=CANDIDATE
```

### Get Dashboard Stats (Admin Only)
```bash
GET /api/v1/admin/stats
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Tenant or user not found" | Fix DATABASE_URL in .env |
| Dashboard shows no data | Run Supabase trigger |
| "Authentication required" | Login as admin user |
| Users not syncing | Run Supabase trigger |

---

## 📚 Full Documentation

- **NEXT_STEPS.md** - Detailed step-by-step guide
- **ADMIN_DASHBOARD_IMPLEMENTATION.md** - Complete implementation details
- **ADMIN_IMPLEMENTATION_SUMMARY.txt** - Visual summary

---

## ✅ Success Checklist

- [ ] Database connection fixed
- [ ] Supabase trigger installed
- [ ] Test user registered
- [ ] Admin user created
- [ ] Admin dashboard loads
- [ ] Real data displays
- [ ] No errors in console

---

**That's it! You're ready to go. 🎉**

For detailed instructions, see **NEXT_STEPS.md**
