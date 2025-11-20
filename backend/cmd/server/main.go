package main


import (
"context"
"fmt"
"log"
"net/http"
"os"
"os/signal"
"time"


"money-app-backend/internal/api"
)


func main() {
addr := ":8080"
if p := os.Getenv("API_PORT"); p != "" {
addr = ":" + p
}


h := api.NewHandler()


srv := &http.Server{
Addr: addr,
Handler: h,
}


go func() {
log.Printf("Starting server on %s\n", addr)
if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
log.Fatalf("listen: %s\n", err)
}
}()


// Graceful shutdown
quit := make(chan os.Signal, 1)
signal.Notify(quit, os.Interrupt)
<-quit
log.Println("Shutting down server...")


ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
if err := srv.Shutdown(ctx); err != nil {
log.Fatalf("Server forced to shutdown: %v", err)
}
log.Println("Server exiting")
}