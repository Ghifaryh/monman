# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app


# Install git (for modules) and ca-certificates
RUN apk add --no-cache git ca-certificates


COPY go.mod go.sum ./
RUN go mod download


COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w" -o /server ./cmd/server \
    && CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w" -o /migrate ./cmd/migrate


# Final image
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app

COPY --from=builder /server /migrate /usr/local/bin/
COPY --from=builder /app/migrations /app/migrations

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV SQLITE_MIGRATIONS_DIR=/app/migrations/sqlite
ENV SQLITE_PATH=/data/monman.db

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
