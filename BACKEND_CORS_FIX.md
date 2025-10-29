# Backend CORS Fix for Signup Endpoint

## Problem
- ✅ Login endpoint (`POST /Account/`) works perfectly
- ❌ Signup endpoints (`POST /Account/Register`, etc.) fail with CORS errors

## Root Cause
The Register endpoint doesn't handle **OPTIONS preflight requests** that browsers send before POST requests when CORS is involved.

## Solution for Backend Team

### For ASP.NET Core / .NET API:

**Option 1: Add CORS middleware globally (Recommended)**
```csharp
// Program.cs or Startup.cs

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Use CORS
app.UseCors("AllowAll");
```

**Option 2: Handle OPTIONS requests manually**
```csharp
[HttpOptions("/Account/Register")]
public IActionResult HandleRegisterOptions()
{
    Response.Headers.Add("Access-Control-Allow-Origin", "*");
    Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
    Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
    return Ok();
}

[HttpPost("/Account/Register")]
public IActionResult Register([FromBody] RegisterModel model)
{
    // Your registration logic
    return Ok(result);
}
```

**Option 3: Use [EnableCors] attribute**
```csharp
[HttpPost("/Account/Register")]
[EnableCors("AllowAll")]
public IActionResult Register([FromBody] RegisterModel model)
{
    // Your registration logic
}
```

### For Express.js / Node.js:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Or handle OPTIONS manually
app.options('/Account/Register', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});
```

### For Flask / Python:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Or manually:
@app.route('/Account/Register', methods=['OPTIONS'])
def register_options():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
```

## Testing the Fix

After implementing the fix, test with:

```bash
# Test OPTIONS request
curl -X OPTIONS https://api.rjautonomous.com/Account/Register \
  -H "Origin: http://127.0.0.1:5502" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Should return headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Why Login Works But Signup Doesn't

- Login endpoint (`/Account/`) likely has CORS configured in routing/filters
- Register endpoint (`/Account/Register`) might be added later without CORS
- Or Register endpoint is in a different controller/route group without CORS

## Quick Check

Ask your backend developer to:
1. ✅ Verify `/Account/` has CORS enabled
2. ❌ Check if `/Account/Register` has the same CORS configuration
3. ❌ Ensure OPTIONS requests are handled for `/Account/Register`

## Expected Response Headers

For OPTIONS request to `/Account/Register`:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

For POST request to `/Account/Register`:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: application/json
```

