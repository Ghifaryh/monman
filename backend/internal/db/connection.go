package db

import (
	"database/sql"
	"fmt"

	"monman-backend/internal/config"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// DB holds the database connection
type DB struct {
	*sql.DB
}

// Connect establishes a connection to the database
func Connect(cfg *config.Config) (*DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{DB: db}, nil
}

// Close closes the database connection
func (d *DB) Close() error {
	return d.DB.Close()
}

// Health checks if the database is healthy
func (d *DB) Health() error {
	return d.DB.Ping()
}
