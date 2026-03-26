package vici

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Config holds all configurable values for VICI
type Config struct {
	CookieName      string
	SessionDuration time.Duration
	CookieSecure    bool
	CookieHTTPOnly  bool
	CookieDomain    string
	CookiePath      string
	DebugMode       bool
}

// DefaultConfig provides sensible defaults
var DefaultConfig = Config{
	CookieName:      "vici_session",
	SessionDuration: 24 * time.Hour,
	CookieSecure:    false,
	CookieHTTPOnly:  true,
	CookieDomain:    "",
	CookiePath:      "/",
	DebugMode:       false,
}

// ContextKey is a custom type for context keys to avoid collisions
type ContextKey string

const (
	UserIDKey          ContextKey = "vici_user_id"
	SessionIDKey       ContextKey = "vici_session_id"
	IsAuthenticatedKey ContextKey = "vici_authenticated"
	MetadataKey        ContextKey = "vici_metadata"
)

// SessionData represents a user session
type SessionData struct {
	ID            string
	UserID        string
	Authenticated bool
	CreatedAt     time.Time
	LastActive    time.Time
	Metadata      map[string]string
	mu            sync.RWMutex
}

// SessionStore manages sessions in memory
type SessionStore struct {
	sessions map[string]*SessionData
	mu       sync.RWMutex
	config   *Config
}

// NewConfigFromEnv loads configuration from environment variables
func NewConfigFromEnv() Config {
	cfg := DefaultConfig

	if val := os.Getenv("VICI_COOKIE_NAME"); val != "" {
		cfg.CookieName = val
	}

	if val := os.Getenv("VICI_SESSION_DURATION"); val != "" {
		if duration, err := time.ParseDuration(val); err == nil {
			cfg.SessionDuration = duration
		} else if hours, err := strconv.Atoi(val); err == nil {
			cfg.SessionDuration = time.Duration(hours) * time.Hour
		}
	}

	if val := os.Getenv("VICI_COOKIE_SECURE"); val != "" {
		cfg.CookieSecure = strings.ToLower(val) == "true" || val == "1"
	}

	if val := os.Getenv("VICI_COOKIE_HTTPONLY"); val != "" {
		cfg.CookieHTTPOnly = strings.ToLower(val) == "true" || val == "1"
	}

	if val := os.Getenv("VICI_COOKIE_DOMAIN"); val != "" {
		cfg.CookieDomain = val
	}

	if val := os.Getenv("VICI_COOKIE_PATH"); val != "" {
		cfg.CookiePath = val
	}

	if val := os.Getenv("VICI_DEBUG"); val != "" {
		cfg.DebugMode = strings.ToLower(val) == "true" || val == "1"
	}

	return cfg
}

// NewSessionStore creates a new session store with the given config
func NewSessionStore(cfg *Config) *SessionStore {
	if cfg == nil {
		c := NewConfigFromEnv()
		cfg = &c
	}
	return &SessionStore{
		sessions: make(map[string]*SessionData),
		config:   cfg,
	}
}

// GenerateSecureToken creates a cryptographically secure random token
func GenerateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate secure token: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// Middleware returns the HTTP middleware handler for VICI
func (s *SessionStore) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			cfg := s.config

			// Attempt to get existing session
			cookie, err := r.Cookie(cfg.CookieName)
			var session *SessionData
			isNewSession := false

			if err == nil && cookie.Value != "" {
				session, _ = s.Get(cookie.Value)
			}

			// Check if session is valid and not expired
			if session != nil {
				if time.Since(session.CreatedAt) > cfg.SessionDuration {
					s.Delete(session.ID)
					session = nil
				}
			}

			// Create new session if needed
			if session == nil {
				token, err := GenerateSecureToken(32)
				if err != nil {
					if cfg.DebugMode {
						log.Printf("[VICI] Error generating token: %v", err)
					}
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}

				session = &SessionData{
					ID:            token,
					UserID:        token, // Anonymous user ID matches session ID
					Authenticated: false,
					CreatedAt:     time.Now(),
					LastActive:    time.Now(),
					Metadata:      make(map[string]string),
				}
				s.Set(token, session)
				isNewSession = true

				// Set the cookie for new sessions
				http.SetCookie(w, &http.Cookie{
					Name:     cfg.CookieName,
					Value:    token,
					Path:     cfg.CookiePath,
					Domain:   cfg.CookieDomain,
					MaxAge:   int(cfg.SessionDuration.Seconds()),
					HttpOnly: cfg.CookieHTTPOnly,
					Secure:   cfg.CookieSecure,
					SameSite: http.SameSiteLaxMode,
				})

				if cfg.DebugMode {
					log.Printf("[VICI] Created new session: %s", token[:8]+"...")
				}
			} else {
				// Update last active
				s.UpdateActivity(session.ID)
			}

			// Inject context values
			ctx = context.WithValue(ctx, SessionIDKey, session.ID)
			ctx = context.WithValue(ctx, UserIDKey, session.UserID)
			ctx = context.WithValue(ctx, IsAuthenticatedKey, session.Authenticated)
			ctx = context.WithValue(ctx, MetadataKey, session.Metadata)

			// Add session to context for direct access if needed
			ctx = context.WithValue(ctx, "vici_session_data", session)

			if cfg.DebugMode && isNewSession {
				// Log request info for new sessions
				log.Printf("[VICI] Request: %s %s (New Session)", r.Method, r.URL.Path)
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// Get retrieves a session by ID
func (s *SessionStore) Get(id string) (*SessionData, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	session, ok := s.sessions[id]
	return session, ok
}

// Set stores a session
func (s *SessionStore) Set(id string, session *SessionData) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[id] = session
}

// Delete removes a session
func (s *SessionStore) Delete(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, id)
}

// UpdateActivity updates the LastActive timestamp
func (s *SessionStore) UpdateActivity(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if session, ok := s.sessions[id]; ok {
		session.LastActive = time.Now()
	}
}

// Authenticate marks a session as authenticated with a specific user ID
func (s *SessionStore) Authenticate(sessionID, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found")
	}

	session.Authenticated = true
	session.UserID = userID
	session.LastActive = time.Now()

	if s.config.DebugMode {
		log.Printf("[VICI] Session authenticated: %s -> %s", sessionID[:8]+"...", userID)
	}

	return nil
}

// Logout de-authenticates a session, returning it to anonymous state
func (s *SessionStore) Logout(sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found")
	}

	session.Authenticated = false
	session.UserID = sessionID // Revert to anonymous
	session.LastActive = time.Now()

	return nil
}

// CleanupExpired removes all expired sessions from the store
func (s *SessionStore) CleanupExpired() int {
	s.mu.Lock()
	defer s.mu.Unlock()

	count := 0
	for id, session := range s.sessions {
		if time.Since(session.CreatedAt) > s.config.SessionDuration {
			delete(s.sessions, id)
			count++
		}
	}

	if s.config.DebugMode && count > 0 {
		log.Printf("[VICI] Cleaned up %d expired sessions", count)
	}

	return count
}

// StartCleanupRoutine runs periodic cleanup of expired sessions
func (s *SessionStore) StartCleanupRoutine(interval time.Duration) chan struct{} {
	stop := make(chan struct{})
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				s.CleanupExpired()
			case <-stop:
				return
			}
		}
	}()
	return stop
}

// Count returns the number of active sessions
func (s *SessionStore) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.sessions)
}

// --- Context Helper Functions ---

// GetUserFromContext retrieves the user ID from the request context
func GetUserFromContext(ctx context.Context) string {
	if val := ctx.Value(UserIDKey); val != nil {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

// GetSessionIDFromContext retrieves the session ID from the request context
func GetSessionIDFromContext(ctx context.Context) string {
	if val := ctx.Value(SessionIDKey); val != nil {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

// IsAuthenticated checks if the user is logged in
func IsAuthenticated(ctx context.Context) bool {
	if val := ctx.Value(IsAuthenticatedKey); val != nil {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}

// GetMetadata retrieves session metadata from context
func GetMetadata(ctx context.Context) map[string]string {
	if val := ctx.Value(MetadataKey); val != nil {
		if m, ok := val.(map[string]string); ok {
			return m
		}
	}
	return nil
}

// SetMetadata sets a key-value pair in the session metadata
func (s *SessionStore) SetMetadata(sessionID, key, value string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found")
	}

	session.mu.Lock()
	session.Metadata[key] = value
	session.mu.Unlock()

	return nil
}

// GetSessionFromContext retrieves the full session data from context
func GetSessionFromContext(ctx context.Context) *SessionData {
	if val := ctx.Value("vici_session_data"); val != nil {
		if session, ok := val.(*SessionData); ok {
			return session
		}
	}
	return nil
}
