# Run with defaults
go run main.go

# Run with custom configuration
VICI_COOKIE_NAME=myapp_auth \
VICI_SESSION_DURATION=48h \
VICI_DEBUG=true \
go run main.go