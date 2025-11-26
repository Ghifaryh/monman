# 🔐 JWT Token Lifecycle with Your Secret Key

## 🏭 Token Creation Process

### 1. User Logs In
```bash
POST /api/auth/login
{
  "username": "myuser",
  "password": "mypass123"
}
```

### 2. Backend Loads JWT_SECRET from .env
```bash
JWT_SECRET=fc6d3ae10600b8039e7e7b43b8ec5d9d9667d7f3618d815423b875222da6d610
```

### 3. Backend Creates Signed Token
```go
// Using your secret key from .env
secretKey := "fc6d3ae10600b8039e7e7b43b8ec5d9d9667d7f3618d815423b875222da6d610"

// Create token payload
payload := {
    "user_id": "6008ebf6-0c9a-425d-ba14-e0a5c2422dfc",
    "username": "myuser",
    "is_active": true,
    "exp": 1764228006,  // 24 hours from now
    "iss": "monman-api"
}

// Sign with your secret key using HMAC-SHA256
signature := HMAC-SHA256(base64(header) + "." + base64(payload), secretKey)

// Final token = header.payload.signature
token := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoi...signature"
```

### 4. Token Sent to Frontend
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
  }
}
```

## 🔍 Token Verification Process

### 1. Frontend Sends Token
```bash
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Backend Splits Token
```bash
header    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
payload   = "eyJ1c2VyX2lkIjoiNjAwOGViZjYtMGM5YS00MjVkLWJhMTQtZTBhNWMyNDIyZGZjIi..."
signature = "u5byhVWHLYvQ7Kk5-ijQSuIEusagKgEx9FVr37XOy80"
```

### 3. Backend Verifies Signature
```go
// Recreate signature using same secret key
expectedSignature := HMAC-SHA256(header + "." + payload, secretKey)

if expectedSignature == receivedSignature {
    // ✅ Token is authentic - created by our backend
    // ✅ Token hasn't been tampered with
    // ✅ User is who they claim to be
} else {
    // ❌ Token is invalid/forged
}
```

### 4. Backend Checks Expiration
```go
claims := decode(payload)
if claims.exp > now() {
    // ✅ Token is still valid
} else {
    // ❌ Token expired, user needs to login again
}
```

## 🔑 Why Your Secret Key Matters

### Security Properties:
- **Authentication**: Only your backend can create valid tokens
- **Integrity**: Any modification breaks the signature
- **Non-repudiation**: Token proves it came from your backend
- **Expiration**: Built-in session timeout

### What If Secret Key Changes?
```bash
# Old tokens become INVALID immediately
Old JWT_SECRET: fc6d3ae10...  (old tokens use this)
New JWT_SECRET: abc123...     (new signature algorithm)

# All existing user sessions break!
# Users must login again to get new tokens
```

### What If Secret Key Leaks?
```bash
# Attackers can create fake tokens!
# Change JWT_SECRET immediately:
JWT_SECRET=new_secure_key_here

# All existing sessions become invalid
# All users must login again (security reset)
```

## 🛡️ Security Best Practices

### ✅ DO:
- Keep JWT_SECRET in environment variables only
- Use cryptographically secure random key (256-bit minimum)
- Rotate JWT_SECRET periodically (quarterly/yearly)
- Same secret across all backend servers
- Monitor for unauthorized token usage

### ❌ DON'T:
- Put JWT_SECRET in code or version control
- Use weak/predictable secrets ("password123")
- Share JWT_SECRET with frontend
- Use different secrets on different servers
- Leave default secrets in production

## 🎯 Your Current Setup

✅ **Strong Secret**: 256-bit hex key from openssl
✅ **Environment Variable**: Stored in .env file
✅ **Proper Usage**: Used for both signing and verification
✅ **24-Hour Expiration**: Automatic session timeout
✅ **HMAC-SHA256**: Industry standard algorithm

Your JWT implementation is secure and follows best practices!