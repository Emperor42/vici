VICI: Secure Session & Context Middleware for Go

VICI (Latin for "I Conquer") is a lightweight, zero-dependency session management and context injection middleware built entirely with the Go standard library. Designed as the first pillar of the Veni, Vidi, Vici suite, it provides robust anonymous tracking, secure session handling, and seamless user context propagation for high-performance Go web applications.

VICI eliminates the need for external session libraries by leveraging Go's native crypto/rand for security and context.Context for data flow, making it ideal for microservices, serverless functions, and monolithic applications requiring strict control over dependencies.
🚀 Features

    Zero External Dependencies: Built exclusively with net/http, crypto, encoding, and sync.
    Anonymous Tracking: Automatically generates secure, unique session IDs for unauthenticated users.
    Context Injection: Seamlessly injects UserID, SessionID, and AuthenticationStatus into the request context for downstream middlewares (VIDI, VENI).
    Environment-Driven Configuration: All constants (cookie names, durations, security flags) are configurable via environment variables.
    In-Memory Session Store: Fast, thread-safe session storage with automatic expiration and cleanup routines.
    Secure Defaults: HttpOnly cookies, CSRF-resistant token generation, and configurable Secure flags.
    Extensible Architecture: Designed to be chained with other middlewares in the Veni/Vidi/Vici ecosystem.

📦 Installation

go get github.com/your-org/vici

Note: Replace github.com/your-org/vici with your actual repository path.
⚙️ Configuration

VICI is configured entirely via environment variables. If not set, sensible defaults are applied.
Variable	Default	Description
VICI_COOKIE_NAME	vici_session	Name of the session cookie
VICI_SESSION_DURATION	24h	Session lifetime (e.g., 48h, 7d)
VICI_COOKIE_SECURE	false	Require HTTPS (true recommended for prod)
VICI_COOKIE_HTTPONLY	true	Prevent client-side JS access
VICI_COOKIE_DOMAIN	(empty)	Cookie domain scope
VICI_COOKIE_PATH	/	Cookie path scope
VICI_DEBUG	false	Enable verbose logging
Example Usage

export VICI_SESSION_DURATION=48h
export VICI_COOKIE_SECURE=true
export VICI_DEBUG=true
go run main.go

🛠️ Quick Start
1. Initialize the Store

import "your-module/vici"

store := vici.NewSessionStore(nil) // Loads config from env

2. Wrap Your Handler

mux := http.NewServeMux()
// ... define routes ...

handler := store.Middleware()(mux)
http.ListenAndServe(":8080", handler)

3. Access Context in Handlers

func MyHandler(w http.ResponseWriter, r *http.Request) {
    userID := vici.GetUserFromContext(r.Context())
    isAuth := vici.IsAuthenticated(r.Context())
    
    if !isAuth {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    // Use userID...
}

4. Authentication Flow

// Inside a POST /login handler
sessionID := vici.GetSessionIDFromContext(r.Context())
if err := store.Authenticate(sessionID, "admin_username"); err != nil {
    // handle error
}

🔗 The Veni, Vidi, Vici Suite

VICI is designed to interoperate seamlessly with the other components of the suite:

    VICI (Identity): Tracks users and injects context.
    VIDI (Data): Consumes VICI's context to tag data submissions (SQL/JSON/XML) with user IDs.
    VENI (View): Consumes VICI's context to conditionally inject custom web components based on user roles.

Chaining Example:

// Order matters: VICI -> VIDI -> VENI -> FileServer
handler := vici.Middleware(store)(
    vidi.Middleware(dbStore)(
        veni.Middleware(fileServer)
    )
)

📄 License

MIT License. See LICENSE for details.
🤝 Contributing

Contributions are welcome! Please ensure any new features adhere to the "Standard Library Only" constraint.