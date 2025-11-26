# 🔐 JWT Authentication Flow Explained

## 🏗️ Architecture Overview
```
Frontend (Browser)          Backend Server
     |                           |
     |                    [JWT_SECRET=abc123]
     |                           |
     |    1. POST /login          |
     |   {username, password} ────┤
     |                           |
     |                      2. Check password
     |                      3. Create JWT token
     |                         using JWT_SECRET
     |                           |
     |    4. Return JWT token     |
     | ◄─────────────────────────┤
[Store in localStorage]          |
     |                           |
     |    5. API requests with    |
     |   Authorization: Bearer    |
     |      <JWT_TOKEN> ─────────┤
     |                           |
     |                      6. Verify token
     |                         using JWT_SECRET
     |                           |
     |    7. Return data          |
     | ◄─────────────────────────┤
```

## 🔑 What Each Component Knows

### Frontend (Browser) 📱
```javascript
// ✅ What frontend HAS:
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzIn0.signature"

// ❌ What frontend NEVER sees:
const JWT_SECRET = "abc123"  // BACKEND ONLY!

// Frontend usage:
localStorage.setItem('auth_token', token)
fetch('/api/profile', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Backend Server 🖥️
```go
// ✅ What backend HAS:
JWT_SECRET = "abc123"  // From environment variable

// Backend usage:
func generateToken(userID string) string {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signedToken, _ := token.SignedString([]byte(JWT_SECRET))  // Uses secret
    return signedToken
}

func verifyToken(tokenString string) bool {
    token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte(JWT_SECRET), nil  // Uses same secret
    })
    return token.Valid
}
```

## 🔍 Step-by-Step Authentication

### Step 1: User Login
```bash
# Frontend sends:
POST /api/auth/login
{
  "username": "john",
  "password": "mypassword123"
}

# Backend does:
1. Hash "mypassword123" with bcrypt
2. Compare with stored password hash
3. If match, create JWT token using JWT_SECRET
4. Send token back to frontend
```

### Step 2: JWT Token Creation (Backend Only)
```go
// Backend creates token (pseudocode):
claims := JWTClaims{
    UserID: "user-123",
    Username: "john",
    ExpiresAt: time.Now().Add(24 * time.Hour)
}

// Sign with JWT_SECRET (frontend never sees this!)
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
signedToken := token.SignedString([]byte("abc123"))  // JWT_SECRET

// Returns: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### Step 3: Frontend Stores Token
```javascript
// Frontend receives and stores:
const response = await login('john', 'mypassword123')
localStorage.setItem('auth_token', response.token)

// Frontend NEVER needs to know JWT_SECRET!
```

### Step 4: Protected API Requests
```javascript
// Frontend sends token with requests:
const token = localStorage.getItem('auth_token')
fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Step 5: Backend Verifies Token
```go
// Backend receives token and verifies:
tokenString := "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

// Verify using SAME JWT_SECRET:
token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
    return []byte("abc123"), nil  // Must be same secret!
})

if token.Valid {
    // Allow access
} else {
    // Reject request
}
```

## 🛡️ Security Boundary: Frontend vs Backend

### Frontend (Browser) - PUBLIC ZONE ⚠️
```bash
# ✅ Frontend .env (safe - not secrets):
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=MonMan
VITE_DEFAULT_THEME=light

# ❌ Frontend should NEVER have:
JWT_SECRET=...          # ← DANGER! Users can see this!
DB_PASSWORD=...         # ← DANGER! Database compromise!
BCRYPT_COST=...         # ← Not needed, backend handles this
```

**Why?** Frontend code is downloaded to user's browser. Anyone can view it!

### Backend (Server) - PRIVATE ZONE 🔒
```bash
# ✅ Backend .env (secure - server only):
JWT_SECRET=fc6d3ae10...610    # ← Safe, users never see server files
DB_PASSWORD=monman_pass       # ← Safe, only server accesses database
BCRYPT_COST=12               # ← Safe, only server hashes passwords
```

**Why?** Backend runs on your server. Users never see server files.

## 🔄 Data Processing Flow

### Frontend Role: "Data Collector & Displayer"
```javascript
// Frontend job: Collect user input, send to backend
const userInput = {
  username: document.getElementById('username').value,  // ← Just collects
  password: document.getElementById('password').value   // ← Just collects
}

// Send to backend for processing
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(userInput)  // ← Just sends, no processing
})

// Display result from backend
const result = await response.json()
if (result.token) {
  localStorage.setItem('token', result.token)  // ← Just stores
  showDashboard()  // ← Just displays
}
```

### Backend Role: "Security Processor"
```go
// Backend job: Secure processing using environment secrets
func handleLogin(w http.ResponseWriter, r *http.Request) {
    // 1. Get data frontend sent
    var loginReq models.LoginRequest
    json.NewDecoder(r.Body).Decode(&loginReq)

    // 2. USE ENVIRONMENT SECRETS for security processing
    cost, _ := strconv.Atoi(os.Getenv("BCRYPT_COST"))  // ← Uses .env
    err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(loginReq.Password))

    // 3. CREATE TOKEN using secret from .env
    jwtSecret := os.Getenv("JWT_SECRET")  // ← Uses .env
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signedToken, _ := token.SignedString([]byte(jwtSecret))

    // 4. Send processed result back to frontend
    json.NewEncoder(w).Encode(map[string]string{"token": signedToken})
}
```

## 🚨 Security Rules

### ✅ DO:
- Keep JWT_SECRET in backend environment variables only
- Use same JWT_SECRET across all backend servers
- Rotate JWT_SECRET periodically (but coordinate across servers)
- Store JWT tokens in frontend localStorage/sessionStorage
- **Let backend do ALL security processing**
- **Frontend just sends data and displays results**

### ❌ DON'T:
- Put JWT_SECRET in frontend code
- Put JWT_SECRET in version control
- Use different JWT_SECRETs on different servers
- Send JWT_SECRET to frontend
- **Do security processing in frontend (users can modify it!)**
- **Put any secrets in frontend .env**

## 🏭 Production Deployment

### Same Secret Across Servers:
```bash
# Server 1 (Docker container):
JWT_SECRET=abc123

# Server 2 (Docker container):
JWT_SECRET=abc123  # MUST BE SAME!

# Load balancer can send requests to either server
# Both servers can verify tokens from either server
```

### Environment Management:
```bash
# Development (.env):
JWT_SECRET=dev-secret-123

# Staging (.env):
JWT_SECRET=staging-secret-456

# Production (.env):
JWT_SECRET=prod-secret-789

# All servers in same environment use SAME secret!
```