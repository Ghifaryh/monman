package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"monman-backend/internal/config"

	_ "modernc.org/sqlite"
)

// DB holds the database connection
type DB struct {
	*sql.DB
}

// Connect establishes a connection to SQLite
func Connect(cfg *config.Config) (*DB, error) {
	path := filepath.Clean(cfg.Database.Path)

	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, fmt.Errorf("create sqlite directory: %w", err)
	}

	dsn := fmt.Sprintf(
		"file:%s?_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)",
		path,
	)
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if _, err := db.Exec(`PRAGMA foreign_keys = ON;`); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("pragma foreign_keys: %w", err)
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
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

// BackendRoot tries to locate the backend module root when running from arbitrary cwd.
func BackendRoot(cwd string) string {
	dir := cwd
	for i := 0; i < 6; i++ {
		goMod := filepath.Join(dir, "go.mod")
		migDir := filepath.Join(dir, "migrations", "sqlite")
		if fi, err := os.Stat(goMod); err == nil && !fi.IsDir() {
			if _, err := os.Stat(migDir); err == nil {
				return dir
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return cwd
}

// ApplySQLiteMigrations runs SQL files from migrations/sqlite in lexical order (001..., 004...).
// Set includeSample to apply 004_dev_sample.sql (extra rows for developer test user).
func ApplySQLiteMigrations(db *sql.DB, backendRoot string, includeSample bool) error {
	dir := os.Getenv("SQLITE_MIGRATIONS_DIR")
	if dir == "" {
		dir = filepath.Join(backendRoot, "migrations", "sqlite")
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("read migrations/sqlite: %w", err)
	}
	var names []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(strings.ToLower(e.Name()), ".sql") {
			continue
		}
		if strings.HasPrefix(e.Name(), "004_") && !includeSample {
			continue
		}
		names = append(names, e.Name())
	}

	sort.Strings(names)
	for _, name := range names {
		path := filepath.Join(dir, name)
		body, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read %s: %w", path, err)
		}
		if _, err := db.Exec(string(body)); err != nil {
			return fmt.Errorf("exec migration %s: %w", name, err)
		}
	}
	return nil
}
