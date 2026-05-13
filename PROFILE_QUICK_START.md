# 🚀 Profile Management - Quick Start Guide

## 📋 Setup (5 minutes)

### Step 1: Create Supabase Storage Buckets
```bash
# 1. Go to: https://supabase.com/dashboard
# 2. Navigate to: SQL Editor → New Query
# 3. Copy contents of: supabase/storage-buckets-setup.sql
# 4. Paste and click "Run"
# 5. Verify success message
```

### Step 2: Verify Buckets Created
```sql
-- Run this in Supabase SQL Editor:
SELECT * FROM storage.buckets WHERE id IN ('avatars', 'resumes');

-- Should return 2 rows:
-- - avatars (public: true)
-- - resumes (public: false)
```

---

## 🧪 Quick Test (2 minutes)

### Test Profile Page
```bash
# 1. Start dev server (if not running)
npm run dev

# 2. Login to application
http://localhost:3001/login

# 3. Navigate to profile
http://localhost:3001/candidate/profile

# 4. Verify:
✓ Profile data loads
✓ All fields visible
✓ No console errors
```

### Test Auto-Save
```bash
# 1. Edit any field (name, bio, etc.)
# 2. Wait 1 second
# 3. Verify:
✓ "Saving..." appears
✓ "Saved [time]" appears
✓ Refresh page - changes persist
```

### Test Avatar Upload
```bash
# 1. Click upload button on avatar
# 2. Select an image (JPEG, PNG, etc.)
# 3. Verify:
✓ Upload spinner appears
✓ Avatar updates
✓ Success notification
✓ Refresh - avatar persists
```

### Test Resume Upload
```bash
# 1. Click upload area in Resume section
# 2. Select a PDF or DOC file
# 3. Verify:
✓ Upload spinner appears
✓ "View" and "Replace" buttons appear
✓ Success notification
✓ Click "View" - opens in new tab
```

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| Auto-Save | Changes save automatically after 1 second | ✅ |
| Avatar Upload | Upload profile picture from device | ✅ |
| Resume Upload | Upload resume (PDF, DOC, DOCX) | ✅ |
| Skills Management | Add/remove skills with auto-save | ✅ |
| Social Links | GitHub, LinkedIn, Portfolio URLs | ✅ |
| Visual Feedback | Loading, saving, success indicators | ✅ |
| Error Handling | Graceful error messages | ✅ |

---

## 🎨 User Experience

### Auto-Save Indicator
- **Yellow Badge:** "Saving..." (while saving)
- **Green Badge:** "Saved 10:30 AM" (after save)
- **Smooth Animations:** Fade in/out transitions

### File Upload
- **Avatar:** Click button → Select image → Auto-upload
- **Resume:** Click area → Select file → Auto-upload
- **Progress:** Spinner during upload
- **Validation:** File type and size checked

### Field Editing
- **Type:** Edit any field
- **Wait:** 1 second after stopping
- **Save:** Automatic save triggers
- **Feedback:** Visual indicator appears

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to upload file" | Run storage setup SQL script |
| "Failed to save profile" | Check DATABASE_URL in .env |
| Auto-save not working | Check browser console for errors |
| Avatar not displaying | Check Supabase Storage dashboard |

---

## 📚 Documentation

- **PROFILE_MANAGEMENT_IMPLEMENTATION.md** - Complete implementation details
- **PROFILE_QUICK_START.md** - This file (quick reference)
- **supabase/storage-buckets-setup.sql** - Storage setup script

---

## 🎯 Success Checklist

- [ ] Storage buckets created
- [ ] Profile page loads
- [ ] Auto-save works
- [ ] Avatar upload works
- [ ] Resume upload works
- [ ] Skills management works
- [ ] No console errors

---

**That's it! You're ready to use the profile management system. 🎉**

For detailed documentation, see **PROFILE_MANAGEMENT_IMPLEMENTATION.md**
