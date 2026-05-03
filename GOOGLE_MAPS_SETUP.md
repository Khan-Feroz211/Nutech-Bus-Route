# 🗺️ Google Maps API Configuration Guide - NUTECH BusTrack

## Complete Setup for Real-Time Bus Tracking Maps

---

## Step 1️⃣: Create Google Cloud Project & Get API Key

### 1a. Go to Google Cloud Console
```
https://console.cloud.google.com
```

### 1b. Create New Project
- Click **Select a Project** (top left)
- Click **NEW PROJECT**
- Project name: `nutech-bustrack` (or your choice)
- Click **CREATE**
- Wait for it to be created (2-3 minutes)

### 1c. Enable Required APIs
Once in your project:

1. Go to **APIs & Services** → **Library**
2. Search and **ENABLE** these APIs:
   - ✅ **Maps JavaScript API** (required for real-time maps)
   - ✅ **Directions API** (optional - for route planning)
   - ✅ **Geocoding API** (optional - for address lookup)
   - ✅ **Places API** (optional - for place search)

**Steps to enable:**
- Search for API name
- Click on it
- Click **ENABLE**
- Repeat for each API

### 1d. Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. A popup shows your API key - copy it (keep it safe!)
4. You can rename it for clarity:
   - Click the pencil icon
   - Name: `NUTECH BusTrack Web`
   - Click **SAVE**

---

## Step 2️⃣: Restrict Your API Key (Security!)

**Important**: Restrict your key to prevent unauthorized usage and billing spikes.

### Set Application Restrictions
1. In **Credentials** page, click your API key
2. Go to **Application restrictions** section
3. Select **HTTP referrers (web sites)**
4. Add your domains:
   ```
   https://your-railway-domain.railway.app
   https://www.your-railway-domain.railway.app
   http://localhost:3000
   http://localhost:3000/*
   ```

### Set API Restrictions
1. Scroll to **API restrictions**
2. Select **Restrict key**
3. Check these APIs:
   - ✅ Maps JavaScript API
   - ✅ Directions API
   - ✅ Geocoding API
   - ✅ Places API
4. Click **SAVE**

---

## Step 3️⃣: Add to Your Environment

### Local Development (`.env.local`)
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBtyvqIi60vl6slqBoo8-KGLt-ZwMlKT6Q
```

**Replace** `AIzaSyBtyvqIi60vl6slqBoo8-KGLt-ZwMlKT6Q` with your actual API key from Step 1d.

### Railway Deployment
1. Go to **Railway Dashboard**
2. Select your **NUTECH-BusTrack** service
3. Go to **Variables** tab
4. Add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
5. Click **Deploy**

### Production (`.env.production`)
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

---

## Step 4️⃣: How It Works in the Code

### FleetMap Component (Real-Time Tracking)
Located in: `src/components/maps/FleetMap.tsx`

```typescript
// 1. API Key is loaded from environment
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// 2. Google Maps script is loaded
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFleetMap`;
document.head.appendChild(script);

// 3. Map is initialized with NUTECH campus center
const map = new window.google.maps.Map(mapRef.current, {
  center: { lat: 33.6502, lng: 73.1201 },  // NUTECH Coordinates
  zoom: 12,
  streetViewControl: false,
});

// 4. Routes are drawn as polylines
routes.forEach((route) => {
  new window.google.maps.Polyline({
    path: route.waypoints,
    strokeColor: route.color,
    strokeWeight: 3,
  });
});

// 5. Bus markers are updated in REAL-TIME
buses.forEach((bus) => {
  const marker = new window.google.maps.Marker({
    position: bus.currentLocation,  // Real-time GPS location
    icon: {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: colors[bus.status],  // Green = active, Yellow = idle, etc.
      rotation: bus.heading,  // Bus direction
    },
  });
});
```

---

## Step 5️⃣: Real-Time Updates (Socket.io Integration)

The maps update in real-time through Socket.io:

```typescript
// From: src/hooks/useBusLocation.ts
useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
  
  // Listen for GPS updates from drivers
  socket.on('bus:location-updated', (data) => {
    // Bus marker position updates instantly on the map
    // Route color changes based on bus status
    // Info window shows real-time speed & status
  });
  
  return () => socket.disconnect();
}, []);
```

**How it works:**
1. Driver shares GPS location via Geolocation API
2. Location is sent to Socket.io server
3. Server broadcasts to all connected clients
4. Map marker updates immediately (no page refresh!)
5. Info window shows real-time speed & status

---

## Step 6️⃣: Testing the Maps

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Go to admin/analytics or student dashboard
# Should see the map with buses
```

**If map doesn't appear:**
- Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Check API key is correct (no typos)
- Check browser console for errors (F12 → Console)
- Check Google Cloud Console for API enabled

### Production Testing
1. Go to `https://your-railway-domain.railway.app`
2. Login with test account
3. Go to tracking page
4. Map should load with real-time buses

---

## Step 7️⃣: Map Features Explained

### 1. **Route Polylines** (Colored Lines)
```typescript
// Draws the bus route path on the map
new window.google.maps.Polyline({
  path: route.waypoints,  // Array of {lat, lng}
  strokeColor: '#FF0000', // Red line
  strokeWeight: 3,        // Thickness
});
```

### 2. **Bus Markers** (Animated Arrows)
```typescript
// Shows bus position with direction arrow
new window.google.maps.Marker({
  position: { lat: 33.65, lng: 73.12 },
  icon: {
    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    fillColor: '#22C55E',   // Green (active)
    rotation: 45,           // Direction the bus is heading
    scale: 5,
  },
});
```

**Status Colors:**
- 🟢 **Green** = Active (in service)
- 🟡 **Yellow** = Idle (waiting at stop)
- ⚫ **Gray** = Offline (not connected)
- 🔴 **Red** = Maintenance

### 3. **Info Window** (Click on Bus)
```typescript
// Shows bus details when you click the marker
const infoWindow = new window.google.maps.InfoWindow({
  content: `
    <b>PK-123</b><br/>
    Route A: Rawalpindi Saddar<br/>
    Speed: 45 km/h<br/>
    Status: Active
  `,
});
```

### 4. **Campus Marker** (Blue Dot)
```typescript
// Shows NUTECH campus location
new window.google.maps.Marker({
  position: { lat: 33.6502, lng: 73.1201 },
  title: 'NUTECH Campus',
  icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
});
```

---

## Troubleshooting

### "Map not showing"
```
❌ Blank rectangle where map should be
✅ Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
✅ Verify API key is correct (copy from Google Cloud)
✅ Check "Maps JavaScript API" is enabled in Google Cloud
```

### "API key invalid"
```
❌ Error in console: "The provided API key is invalid"
✅ Go to Google Cloud Console
✅ Make sure the API key is for the correct project
✅ Check application restrictions (HTTP referrers)
✅ Regenerate a new key if needed
```

### "Quota exceeded"
```
❌ Error: "You have exceeded your quota"
✅ This happens if you get too many requests
✅ Go to Google Cloud → Quotas
✅ Increase Maps JavaScript API quota
✅ Or implement caching to reduce requests
```

### "Maps JavaScript not loaded"
```
❌ Error: "google is not defined"
✅ Make sure script loads before component renders
✅ Check no ad blockers blocking googleapis.com
✅ Check network tab in DevTools
```

### "Real-time updates not working"
```
❌ Bus markers don't move in real-time
✅ Check Socket.io server is running
✅ Check NEXT_PUBLIC_SOCKET_URL is correct
✅ Check WebSocket connection in DevTools (Network → WS)
✅ Check server is emitting 'bus:location-updated' events
```

---

## Cost Estimation

### Pricing Tiers
| Feature | Free | Paid |
|---------|------|------|
| Maps JS API | $0 (28k requests/day) | $5-10/month |
| Directions API | $0 (100 requests/day) | $0.40-0.50 per 100 |
| Geocoding API | $0 (100 requests/day) | $0.005 per request |

**For a university with 2,000 students:**
- ~500 active users/day
- ~10k map loads/day
- **Cost: ~$10-15/month** (mostly within free tier)

**How to optimize:**
- Cache route polylines (don't redraw every time)
- Throttle GPS updates to 5-second intervals
- Use client-side clustering for 50+ buses

---

## Advanced: Adding Custom Map Controls

### Add "Center on NUTECH" Button
```typescript
// Create button
const centerButton = document.createElement('button');
centerButton.textContent = 'Center on Campus';
centerButton.style.margin = '10px';
centerButton.style.padding = '8px 12px';
centerButton.style.backgroundColor = '#22C55E';
centerButton.style.color = 'white';
centerButton.style.border = 'none';
centerButton.style.borderRadius = '4px';

// Add click handler
centerButton.addEventListener('click', () => {
  map.setCenter({ lat: 33.6502, lng: 73.1201 });
  map.setZoom(14);
});

// Add to map controls
map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerButton);
```

---

## Security Checklist

- ✅ API key restricted to HTTP referrers (domains)
- ✅ API key restricted to Maps JavaScript API only
- ✅ API key in `.env.local` (not committed to git)
- ✅ Different keys for dev/staging/production
- ✅ Rotate keys every 6 months
- ✅ Monitor quota usage in Google Cloud
- ✅ Set billing alert ($50/month max)

---

## Next Steps

1. ✅ Create Google Cloud project
2. ✅ Enable Maps JavaScript API
3. ✅ Create and restrict API key
4. ✅ Add to `.env.local`
5. ✅ Test locally: `npm run dev`
6. ✅ Add to Railway variables
7. ✅ Deploy and test
8. ✅ Share your live map! 🗺️

---

**Questions?**
- Google Maps Docs: https://developers.google.com/maps/documentation/javascript
- Google Cloud Pricing: https://cloud.google.com/maps-platform/pricing
- Check Railway logs if maps don't load in production
