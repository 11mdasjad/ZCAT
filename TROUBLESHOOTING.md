# ZCAT Platform - Troubleshooting Guide

## 🔧 Server Connection Issues

### Issue: "Safari Can't Connect to the Server"

Your Next.js server is running correctly on **http://localhost:3001**, but Safari can't connect.

### ✅ Quick Fixes

#### 1. Try a Different Browser
Safari sometimes has issues with localhost. Try:
- **Chrome**: http://localhost:3001
- **Firefox**: http://localhost:3001
- **Edge**: http://localhost:3001

#### 2. Clear Safari Cache
1. Safari → Settings → Privacy
2. Click "Manage Website Data"
3. Remove localhost entries
4. Restart Safari

#### 3. Use Network URL Instead
Try the network URL shown in the terminal:
- **http://192.168.1.10:3001**

#### 4. Check if Port is Accessible
```bash
# Test if server is responding
curl http://localhost:3001

# Should return HTML content
```

#### 5. Restart the Server
```bash
# In terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

---

## 🌐 Server Status

### Current Configuration
- **Port**: 3001 (3000 was in use)
- **Status**: ✅ Running
- **Local URL**: http://localhost:3001
- **Network URL**: http://192.168.1.10:3001

### Verify Server is Running
```bash
# Check if process is running
lsof -i :3001

# Should show node process
```

---

## 🔍 Common Issues & Solutions

### 1. Port Already in Use
**Error**: `Port 3000 is in use`

**Solution**: Server automatically uses port 3001. This is normal.

To use port 3000:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart server
npm run dev
```

### 2. Module Not Found Errors
**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart server
npm run dev
```

### 3. TypeScript Errors
**Error**: Type errors in console

**Solution**:
```bash
# Check types
npm run type-check

# Regenerate Prisma types
npx prisma generate
```

### 4. Environment Variables Not Loading
**Error**: `undefined` for env variables

**Solution**:
```bash
# Ensure .env.local exists
ls -la .env.local

# Restart server (required after env changes)
npm run dev
```

### 5. Build Errors
**Error**: Build fails

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo

# Rebuild
npm run dev
```

---

## 🚀 Alternative Access Methods

### Method 1: Use Chrome/Firefox
Safari sometimes has localhost issues. Chrome and Firefox work better for development.

### Method 2: Use Network IP
Access via your local network IP:
- **http://192.168.1.10:3001**

### Method 3: Use 127.0.0.1
Instead of localhost:
- **http://127.0.0.1:3001**

### Method 4: Configure Safari
1. Safari → Settings → Advanced
2. Enable "Show Develop menu"
3. Develop → Disable Local File Restrictions

---

## 📊 Verify Everything is Working

### 1. Check Server Status
```bash
# Server should show:
# ✓ Ready in XXXms
# - Local: http://localhost:3001
```

### 2. Test with curl
```bash
curl http://localhost:3001

# Should return HTML
```

### 3. Check Network
```bash
# Verify network interface
ifconfig | grep "inet "

# Should show 192.168.1.10
```

### 4. Test API Endpoint
```bash
curl http://localhost:3001/api/health

# Should return JSON (if endpoint exists)
```

---

## 🔧 Advanced Troubleshooting

### Check Firewall
```bash
# macOS: Check if firewall is blocking
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If enabled, add exception for node
```

### Check Hosts File
```bash
# Verify localhost mapping
cat /etc/hosts | grep localhost

# Should show:
# 127.0.0.1 localhost
```

### Check Node Version
```bash
node --version
# Should be 18.x or higher

npm --version
# Should be 9.x or higher
```

### Verbose Logging
```bash
# Run with debug output
DEBUG=* npm run dev
```

---

## 📱 Mobile/Tablet Access

To access from mobile device on same network:

1. Find your computer's IP: `192.168.1.10`
2. On mobile, visit: `http://192.168.1.10:3001`
3. Ensure both devices are on same WiFi

---

## 🆘 Still Not Working?

### Step 1: Verify Server is Running
```bash
# Check terminal output
# Should see: ✓ Ready in XXXms
```

### Step 2: Try Different Browser
- Chrome (recommended for development)
- Firefox
- Edge

### Step 3: Use Network URL
- http://192.168.1.10:3001

### Step 4: Restart Everything
```bash
# Stop server (Ctrl+C)
# Clear cache
rm -rf .next

# Restart
npm run dev
```

### Step 5: Check Logs
Look for errors in terminal output

---

## ✅ Recommended Setup

### For Development
1. **Browser**: Chrome or Firefox (better dev tools)
2. **URL**: http://localhost:3001
3. **Extensions**: React DevTools, Redux DevTools

### For Testing
1. **Multiple browsers**: Test in Chrome, Firefox, Safari
2. **Mobile**: Test on actual devices
3. **Network**: Test via network URL

---

## 📞 Quick Reference

### Server URLs
- **Local**: http://localhost:3001
- **Network**: http://192.168.1.10:3001
- **Alternative**: http://127.0.0.1:3001

### Commands
```bash
# Start server
npm run dev

# Stop server
Ctrl+C

# Clear cache
rm -rf .next

# Check port
lsof -i :3001
```

### Files to Check
- `.env.local` - Environment variables
- `next.config.ts` - Next.js configuration
- `package.json` - Dependencies

---

## 🎯 Next Steps

1. **Try Chrome**: http://localhost:3001
2. **Or use Network URL**: http://192.168.1.10:3001
3. **If still issues**: Check terminal for errors
4. **Need help**: Review error messages in terminal

---

**Most Common Solution**: Use Chrome instead of Safari for development! 🚀
