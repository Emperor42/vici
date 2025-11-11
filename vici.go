package vici

import (
	"net/http"
	"os"
)

// New returns a middleware handler that enforces the VICI rules.
// Wrap your existing handler with it:
//
//   http.Handle("/", vici.New(myHandler))
//
func New(next http.Handler) http.Handler {
	// Grab the expected token once at startup.
	expected := os.Getenv("VICI")
	if expected == "" {
		// If the environment variable is missing we fail fast – the
		// middleware cannot perform its validation.
		panic("environment variable VICI is not set")
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// Requirement 2 – GET requests pass straight through.
			next.ServeHTTP(w, r)
			return

		case http.MethodPost:
			// Parse form data (supports both URL‑encoded and multipart forms).
			if err := r.ParseForm(); err != nil {
				http.Error(w, "invalid form data", http.StatusBadRequest)
				return
			}
			if r.FormValue("VICI") != expected {
				// Requirement 3 – token mismatch.
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			// Token matches – forward the request.
			next.ServeHTTP(w, r)
			return

		default:
			// Requirement 1 – reject everything else.
			w.Header().Set("Allow", "GET, POST")
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
	})
}
