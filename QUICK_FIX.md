# Quick Fix for API Connection Issue

## The Problem
You're getting: "Cannot connect to API server at https://api.rjautonomous.com/api/auth/login"

## Most Likely Causes:

### 1. API Endpoints Don't Have `/api` Prefix
Your API might be structured like:
- ✅ `https://api.rjautonomous.com/auth/login`
- ❌ Not: `https://api.rjautonomous.com/api/auth/login`

### 2. CORS Issue
Your backend isn't allowing requests from your frontend origin.

## Quick Fixes:

### Option 1: Try Without `/api` Prefix
Open browser console (F12) and run:
```javascript
localStorage.setItem('API_BASE_URL', 'https://api.rjautonomous.com');
```
Then refresh the page and try login again.

### Option 2: Update Config File
Edit `assets/js/config.js` and change line 24 from:
```javascript
BASE_URL = 'https://api.rjautonomous.com/api';
```
To:
```javascript
BASE_URL = 'https://api.rjautonomous.com';
```

### Option 3: Check What Your API Actually Returns
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the failed request:
   - What's the actual URL?
   - What's the error? (CORS, 404, 500, etc.)
   - What status code?

## Verify Your API Structure

Test in browser console:
```javascript
// Test endpoint without /api
fetch('https://api.rjautonomous.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test' })
})
.then(r => console.log('Without /api:', r.status))
.catch(e => console.log('Without /api error:', e.message));

// Test endpoint with /api
fetch('https://api.rjautonomous.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test' })
})
.then(r => console.log('With /api:', r.status))
.catch(e => console.log('With /api error:', e.message));
```

The one that doesn't give "Failed to fetch" is probably the correct structure.

## Fix CORS on Backend (If Needed)

If your backend is Node.js/Express:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://127.0.0.1:5502', 'http://localhost:5502'],
  credentials: true
}));
```

## Check API Status

Make sure your API at `https://api.rjautonomous.com` is actually:
1. ✅ Running and accessible
2. ✅ Has the `/auth/login` endpoint
3. ✅ Allows CORS from your frontend origin

