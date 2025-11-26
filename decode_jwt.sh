#!/bin/bash
# JWT Token Decoder - Shows what's inside your token

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjAwOGViZjYtMGM5YS00MjVkLWJhMTQtZTBhNWMyNDIyZGZjIiwidXNlcm5hbWUiOiJteXVzZXIiLCJpc19hY3RpdmUiOnRydWUsImlzcyI6Im1vbm1hbi1hcGkiLCJzdWIiOiI2MDA4ZWJmNi0wYzlhLTQyNWQtYmExNC1lMGE1YzI0MjJkZmMiLCJleHAiOjE3NjQyMjgwMDYsIm5iZiI6MTc2NDE0MTYwNiwiaWF0IjoxNzY0MTQxNjA2fQ.u5byhVWHLYvQ7Kk5-ijQSuIEusagKgEx9FVr37XOy80"

echo "🔐 JWT Token Analysis"
echo "===================="
echo ""

# Split the token into parts
HEADER=$(echo $TOKEN | cut -d'.' -f1)
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2)
SIGNATURE=$(echo $TOKEN | cut -d'.' -f3)

echo "📋 Token Structure:"
echo "Header:    $HEADER"
echo "Payload:   $PAYLOAD"
echo "Signature: $SIGNATURE"
echo ""

# Decode header (add padding if needed)
echo "🏷️  Header (Algorithm & Type):"
echo $HEADER | base64 -d 2>/dev/null || echo $HEADER= | base64 -d 2>/dev/null || echo $HEADER== | base64 -d
echo ""

# Decode payload (add padding if needed)
echo "📦 Payload (Your Session Data):"
echo $PAYLOAD | base64 -d 2>/dev/null || echo $PAYLOAD= | base64 -d 2>/dev/null || echo $PAYLOAD== | base64 -d
echo ""

echo "🔒 Signature: This proves the token wasn't tampered with"
echo "   (Can only be verified with the JWT_SECRET on the backend)"