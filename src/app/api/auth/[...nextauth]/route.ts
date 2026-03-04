import { handlers } from "@/lib/auth"

// Expose the Auth.js GET and POST handlers at /api/auth/*
// This single file handles all Auth.js routes:
//   GET  /api/auth/signin
//   GET  /api/auth/signout
//   GET  /api/auth/callback/:provider
//   GET  /api/auth/session
//   POST /api/auth/signin/:provider
//   POST /api/auth/signout
export const { GET, POST } = handlers
