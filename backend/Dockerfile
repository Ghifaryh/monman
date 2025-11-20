# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app


# Install git (for modules) and ca-certificates
RUN apk add --no-cache git ca-certificates


COPY go.mod go.sum ./
RUN go mod download


COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w" -o /server ./cmd/server


# Final image
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /server /server
EXPOSE 8080
ENTRYPOINT ["/server"]