package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"monman-backend/internal/config"
	"monman-backend/internal/db"
)

func main() {
	sample := flag.Bool("sample", false, "also apply 004_dev_sample.sql")
	flag.Parse()

	cfg := config.Load()
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	root := db.BackendRoot(cwd)

	database, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer database.Close()

	if err := db.ApplySQLiteMigrations(database.DB, root, *sample); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	cfgPath := cfg.Database.Path
	fmt.Printf("OK: SQLite migrations applied (%s backend root=%s)\nDatabase: %s\n", root, cwd, cfgPath)
}
