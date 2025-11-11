VICI Middleware for Go HTTP Servers

A lightweight, production‑ready Go middleware that enforces strict request handling:

    Only allows GET and POST methods – all others are rejected with 405 Method Not Allowed.
    Passes GET requests straight through without any extra processing.
    Validates POST requests by checking a form field named VICI against an environment variable VICI. Mismatches result in 401 Unauthorized.

Table of Contents

    Features
    Installation
    Usage
        Basic Example
        Integrating with Existing Handlers
    Configuration
    Error Handling
    Testing Tips
    License

Features

    Method filtering – only GET and POST are accepted.
    Zero‑overhead for GET – requests flow directly to the next handler.
    Secure token validation – compares the VICI form value with a server‑side environment variable.
    Clear HTTP responses (401, 405, 400) with appropriate Allow headers.
    Fail‑fast start‑up – panics if the required VICI environment variable is missing.

Installation

go get github.com/yourusername/vici

(Replace github.com/yourusername/vici with the actual module path where you store the middleware.)
Usage
Basic Example

package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/yourusername/vici" // adjust import path
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, world!")
}

func main() {
	// Set the expected token (normally done outside the binary, e.g., via Docker env vars)
	os.Setenv("VICI", "my-secret-token")

	mux := http.NewServeMux()
	mux.HandleFunc("/", helloHandler)

	// Wrap the mux with the VICI middleware
	handler := vici.New(mux)

	fmt.Println("Server listening on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		panic(err)
	}
}

Running the program:

$ go run .
Server listening on :8080

    GET / → Hello, world!
    POST / with form field VICI=my-secret-token → Hello, world!
    POST with wrong/missing VICI → 401 Unauthorized
    PUT / DELETE / … → 405 Method Not Allowed (with Allow: GET, POST header)

Integrating with Existing Handlers

If you already have a router (e.g., gorilla/mux, chi, etc.), simply wrap the router:

router := chi.NewRouter()
// ... define routes ...

secured := vici.New(router)
http.ListenAndServe(":8080", secured)

All routes behind the router inherit the VICI policy.
Configuration
Variable	Description	Required?
VICI	Secret token that POST requests must supply via the VICI form field.	Yes (panic if missing)

    Tip: Store VICI securely (Docker secrets, Kubernetes secrets, or environment files) and never hard‑code it.

Error Handling
Situation	HTTP Status	Response Body	Header
Unsupported method	405 Method Not Allowed	method not allowed	Allow: GET, POST
Invalid form parsing (e.g., malformed multipart)	400 Bad Request	invalid form data	—
VICI token mismatch	401 Unauthorized	unauthorized	—

You can customize these responses by wrapping the middleware with your own error‑handling layer if desired.
Testing Tips

func TestVICIMiddleware(t *testing.T) {
    os.Setenv("VICI", "test-token")
    defer os.Unsetenv("VICI")

    // Dummy handler that writes OK
    dummy := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })

    handler := vici.New(dummy)

    // 1. GET request should pass
    req := httptest.NewRequest(http.MethodGet, "/", nil)
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)
    assert.Equal(t, http.StatusOK, rr.Code)

    // 2. POST with correct token
    form := url.Values{}
    form.Add("VICI", "test-token")
    req = httptest.NewRequest(http.MethodPost, "/", strings.NewReader(form.Encode()))
    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
    rr = httptest.NewRecorder()
    handler.ServeHTTP(rr, req)
    assert.Equal(t, http.StatusOK, rr.Code)

    // 3. POST with wrong token
    form.Set("VICI", "bad-token")
    req = httptest.NewRequest(http.MethodPost, "/", strings.NewReader(form.Encode()))
    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
    rr = httptest.NewRecorder()
    handler.ServeHTTP(rr, req)
    assert.Equal(t, http.StatusUnauthorized, rr.Code)

    // 4. Unsupported method
    req = httptest.NewRequest(http.MethodPut, "/", nil)
    rr = httptest.NewRecorder()
    handler.ServeHTTP(rr, req)
    assert.Equal(t, http.StatusMethodNotAllowed, rr.Code)
}

The test suite verifies each requirement: method filtering, GET pass‑through, POST token validation, and proper error codes.
License

MIT License – feel free to use, modify, and distribute. See the LICENSE file for details.
