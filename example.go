package main

import (
	"fmt"
	"html"
	"log"
	"net/http"
	"time"
	
	vici//"your-module/vici" // Replace with your actual module path
)

func main() {
	// Configuration is loaded from environment variables automatically
	// You can also override programmatically:
	//
	// os.Setenv("VICI_COOKIE_NAME", "my_app_session")
	// os.Setenv("VICI_SESSION_DURATION", "48h")
	// os.Setenv("VICI_DEBUG", "true")
	//

	// Initialize the session store
	store := vici.NewSessionStore(nil) // nil means use env vars + defaults

	// Start background cleanup (runs every hour)
	stopCleanup := store.StartCleanupRoutine(time.Hour)
	defer close(stopCleanup)

	// Create the mux for routing
	mux := http.NewServeMux()

	// Home page - shows session info
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		userID := vici.GetUserFromContext(r.Context())
		sessionID := vici.GetSessionIDFromContext(r.Context())
		isAuth := vici.IsAuthenticated(r.Context())

		fmt.Fprintf(w, `<!DOCTYPE html>
<html>
<head><title>VICI Demo</title></head>
<body>
	<h1>VICI Session Demo</h1>
	<p>Session ID: <code>%s</code></p>
	<p>User ID: <code>%s</code></p>
	<p>Authenticated: <strong>%v</strong></p>
	
	<h2>Login</h2>
	<form method="POST" action="/login">
		<input type="text" name="username" placeholder="Username" required><br><br>
		<input type="password" name="password" placeholder="Password" required><br><br>
		<button type="submit">Login</button>
	</form>
	
	<p><em>Demo credentials: admin / secret</em></p>
	
	%s
</body>
</html>`,
			html.EscapeString(sessionID[:16]+"..."),
			html.EscapeString(userID),
			isAuth,
			func() string {
				if isAuth {
					return `<form method="POST" action="/logout"><button type="submit">Logout</button></form>`
				}
				return ""
			}(),
		)
	})

	// Login handler
	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		username := r.FormValue("username")
		password := r.FormValue("password")

		// Demo: hardcoded credentials
		if username == "admin" && password == "secret" {
			sessionID := vici.GetSessionIDFromContext(r.Context())
			if err := store.Authenticate(sessionID, username); err != nil {
				http.Error(w, "Authentication failed", http.StatusInternalServerError)
				return
			}
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	})

	// Logout handler
	mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		sessionID := vici.GetSessionIDFromContext(r.Context())
		store.Logout(sessionID)
		http.Redirect(w, r, "/", http.StatusSeeOther)
	})

	// Protected route example
	mux.HandleFunc("/protected", func(w http.ResponseWriter, r *http.Request) {
		if !vici.IsAuthenticated(r.Context()) {
			http.Error(w, "Unauthorized - Please login first", http.StatusUnauthorized)
			return
		}

		userID := vici.GetUserFromContext(r.Context())
		fmt.Fprintf(w, "<h1>Protected Area</h1><p>Welcome, %s!</p>", html.EscapeString(userID))
	})

	// Admin stats endpoint (shows session count)
	mux.HandleFunc("/admin/stats", func(w http.ResponseWriter, r *http.Request) {
		if !vici.IsAuthenticated(r.Context()) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		fmt.Fprintf(w, `
<h1>Session Stats</h1>
<p>Active Sessions: %d</p>
<p><a href="/">Back to Home</a></p>
`, store.Count())
	})

	// Wrap the entire mux with VICI middleware
	handler := store.Middleware()(mux)

	// Start server
	port := ":8080"
	log.Printf("[VICI] Starting server on %s", port)
	log.Printf("[VICI] Configuration loaded from environment variables")
	log.Fatal(http.ListenAndServe(port, handler))
}