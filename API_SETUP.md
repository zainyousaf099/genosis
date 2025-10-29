# API Setup Guide

## Understanding the CORS Error

**CORS (Cross-Origin Resource Sharing)** error occurs when:
- Your frontend (running on `http://127.0.0.1:5502`) tries to access
- Your backend API (e.g., `http://localhost:3000`)
- But the backend doesn't allow requests from your frontend's origin

## Quick Fix: Configure Your Backend

### Option 1: Node.js/Express Backend

Add CORS middleware to your Express server:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins (development only)
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  credentials: true
}));

// Or allow specific origins
app.use(cors({
  origin: ['http://127.0.0.1:5502', 'http://localhost:5502'],
  credentials: true
}));

// Your routes...
app.post('/api/auth/login', ...);
app.post('/api/auth/register', ...);
```

Install CORS package:
```bash
npm install cors
```

### Option 2: If Backend is Not Running

1. **Make sure your backend server is running** on `http://localhost:3000` (or your configured port)
2. **Update the API URL** in `assets/js/config.js` if your backend uses a different port

### Option 3: Temporary - Override API URL in Browser

You can temporarily override the API URL by running this in the browser console:

```javascript
localStorage.setItem('API_BASE_URL', 'http://localhost:3000/api');
```

Then refresh the page and try again.

## Configuration

### Default API URL

The system automatically detects development vs production:
- **Development** (localhost/127.0.0.1): `http://localhost:3000/api`
- **Production**: Configure in `assets/js/config.js`

### Change API URL

Edit `assets/js/config.js`:

```javascript
// For local development with different port:
BASE_URL = 'http://localhost:YOUR_PORT/api';

// For production:
BASE_URL = 'https://your-actual-api-domain.com/api';
```

Or use localStorage override (see Option 3 above).

## Backend API Endpoints Required

Your backend must implement these endpoints:

### POST `/api/auth/register`
Request body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "companyName": "string (optional)"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### POST `/api/auth/login`
Request body:
```json
{
  "username": "string (email or username)",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

## Testing Without Backend

For testing purposes, you can create a mock backend or use a service like:
- JSONPlaceholder (limited)
- MockAPI.io
- Local mock server

## Need Help?

Check the browser console for detailed error messages. The system now provides specific guidance for:
- CORS errors
- Network connection errors
- API URL configuration issues

