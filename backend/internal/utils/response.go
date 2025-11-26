package utils

import (
	"encoding/json"
	"net/http"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// WriteJSON writes a JSON response
func WriteJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// WriteSuccess writes a successful JSON response
func WriteSuccess(w http.ResponseWriter, data interface{}) {
	response := Response{
		Success: true,
		Data:    data,
	}
	WriteJSON(w, http.StatusOK, response)
}

// WriteError writes an error JSON response
func WriteError(w http.ResponseWriter, statusCode int, message string) {
	response := Response{
		Success: false,
		Error:   message,
	}
	WriteJSON(w, statusCode, response)
}

// WriteBadRequest writes a 400 Bad Request response
func WriteBadRequest(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusBadRequest, message)
}

// WriteUnauthorized writes a 401 Unauthorized response
func WriteUnauthorized(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Unauthorized"
	}
	WriteError(w, http.StatusUnauthorized, message)
}

// WriteNotFound writes a 404 Not Found response
func WriteNotFound(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Resource not found"
	}
	WriteError(w, http.StatusNotFound, message)
}

// WriteInternalServerError writes a 500 Internal Server Error response
func WriteInternalServerError(w http.ResponseWriter, message string) {
	if message == "" {
		message = "Internal server error"
	}
	WriteError(w, http.StatusInternalServerError, message)
}

// WriteErrorResponse is an alias for WriteError to match API handler usage
func WriteErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	WriteError(w, statusCode, message)
}

// WriteJSONResponse writes a raw JSON response with status code
func WriteJSONResponse(w http.ResponseWriter, data interface{}, statusCode int) {
	WriteJSON(w, statusCode, data)
}
