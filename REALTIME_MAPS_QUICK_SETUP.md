# 🚀 Google Maps Real-Time Setup - Quick Guide

## ✅ FILES WHERE YOU PUT THE API KEY

### **File 1: `.env.local` (Your Local Machine - KEEP PRIVATE)**
**Location**: `d:\Nutech-Bus-Route\Nutech-Bus-Route\.env.local`

**What to do:**
```bash
# Find this line:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Replace with your actual key from Google Cloud:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBtyvqIi60vl6slqBoo8-KGLt-ZwMlKT6Q
```

**Important:**
- ✅ This file is in `.gitignore` (won't be pushed to GitHub)
- ✅ Safe to put real key here
- ❌ Never commit this file

---

### **File 2: `.env.example` (Template for Everyone - NO REAL KEY)**
**Location**: `d:\Nutech-Bus-Route\Nutech-Bus-Route\.env.example`

**What to do:**
```bash
# This stays as PLACEHOLDER (safe to commit):
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Purpose:**
- Shows other developers what env vars are needed
- They copy this to their own `.env.local`
- Helps with onboarding

---

### **File 3: Railway Dashboard (Production)**
**Don't put in any file!** Instead:

1. Go to: https://railway.app/dashboard
2. Click **NUTECH-BusTrack** service
3. Go to **Variables** tab
4. Click **Add Variable**
5. Add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBtyvqIi60vl6slqBoo8-KGLt-ZwMlKT6Q
   ```
6. Click **Save**
7. Click **Redeploy** button

---

## 🔄 How Real-Time Maps Work

### **Step 1: Load API Key from Environment**
Your code in `src/components/maps/FleetMap.tsx`:
```typescript
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
// Loads from .env.local (local dev) or Railway Variables (production)
```

### **Step 2: Load Google Maps Library**
```typescript
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
document.head.appendChild(script);
```

### **Step 3: Initialize Map on Page**
```typescript
const map = new window.google.maps.Map(mapRef.current, {
  center: { lat: 33.6502, lng: 73.1201 },  // NUTECH campus
  zoom: 12,
});
```

### **Step 4: Draw Routes**
```typescript
routes.forEach((route) => {
  new window.google.maps.Polyline({
    path: route.waypoints,
    strokeColor: route.color,
    map: map,
  });
});
```

### **Step 5: Add Bus Markers (Updates in Real-Time)**
```typescript
buses.forEach((bus) => {
  const marker = new window.google.maps.Marker({
    position: bus.currentLocation,  // Real-time GPS location
    map: map,
    icon: {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      rotation: bus.heading,  // Direction arrow
      fillColor: bus.status === 'active' ? '#22C55E' : '#EAB308',
    },
  });
});
```

### **Step 6: Socket.io Updates (Real-Time)**
```typescript
// From: src/hooks/useBusLocation.ts
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

// Driver sends GPS location
socket.on('bus:location-updated', (data) => {
  // Map marker moves immediately
  // No page refresh needed
  // All users see update in 1-2 seconds
});
```

---

## 🗺️ Real-Time Map Features (What You'll See)

### **On Local Dev** (`npm run dev`)
- Go to: http://localhost:3000
- Login as student/driver/admin
- See the map with:
  - 🟢 **Green arrows** = Buses moving (active)
  - 🟡 **Yellow arrows** = Buses waiting (idle)
  - Colored lines = Bus routes
  - Click bus → See speed, status, route

### **On Production** (Railway)
- Same features
- Real-time updates from actual buses
- Multiple users see updates simultaneously
- No page refresh needed

---

## 📋 Configuration Checklist

- [ ] Get API key from Google Cloud Console
- [ ] Add to `.env.local`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY`
- [ ] Test locally: `npm run dev`
- [ ] Maps load without errors? ✅
- [ ] Add to Railway Variables
- [ ] Redeploy Railway
- [ ] Test on live domain
- [ ] Real-time bus markers moving? ✅

---

## ✨ Local Testing

```bash
# 1. Make sure API key is in .env.local
cat .env.local | grep GOOGLE_MAPS

# 2. Start dev server
npm run dev

# 3. Open in browser
open http://localhost:3000

# 4. Login with test account:
# Email: admin@nutech.edu.pk
# Password: admin123

# 5. Go to admin/analytics or student dashboard
# 6. You should see the map with buses

# 7. Check browser console (F12) for errors
```

---

## 🚀 Production Testing

```bash
# 1. Add to Railway Variables
# Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Value: YOUR_ACTUAL_KEY

# 2. Redeploy
# Click Redeploy button in Railway dashboard

# 3. Wait for build to finish
# Check logs for any errors

# 4. Visit your live domain
# https://your-railway-domain.railway.app

# 5. Login and check maps
# Should see real-time buses on the map
```

---

## 🔧 If Maps Don't Show

### **Local Dev**
```bash
# 1. Check .env.local has the key
cat .env.local | grep GOOGLE_MAPS

# 2. Check key is not empty
# If it shows: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
# Then the key is missing!

# 3. Check browser console (F12 → Console)
# Look for errors like:
# "The provided API key is invalid"
# "Maps JavaScript API has not been used"

# 4. Check Google Cloud
# Go to console.cloud.google.com
# Make sure "Maps JavaScript API" is ENABLED
```

### **Production**
```bash
# 1. Check Railway logs
# Dashboard → Deployments → View Logs
# Look for: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" errors

# 2. Check API key restriction
# Google Cloud → APIs & Services → Credentials
# Make sure domain is whitelisted

# 3. Check browser console on live domain
# F12 → Console tab
# Look for JavaScript errors
```

---

## 📝 Summary

| Where | File | Contains | Commits to Git? |
|-------|------|----------|-----------------|
| Local | `.env.local` | Real API key | ❌ NO (.gitignore) |
| Template | `.env.example` | Placeholder | ✅ YES |
| Production | Railway Variables | Real API key | N/A (Dashboard) |

**Your job:**
1. Put real key in `.env.local`
2. That's it! Push code to GitHub
3. Add key to Railway dashboard separately
4. Maps work everywhere! 🗺️

---

## 🎯 Next Steps

1. ✅ Get Google Maps API key from Google Cloud
2. ✅ Put in `.env.local` on line with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. ✅ Test locally: `npm run dev` → should see map
4. ✅ Push code to GitHub (API key NOT included)
5. ✅ Add to Railway Variables
6. ✅ Redeploy Railway
7. ✅ Test on live domain → should see real-time map

**Let me know when you add the key to `.env.local` and I'll help you test! 🚀**
