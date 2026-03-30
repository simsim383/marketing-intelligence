// ═══════════════════════════════════════════════════════════════════
// CONFIG — Marketing Intelligence
// ═══════════════════════════════════════════════════════════════════
// Supabase: same instance as Owner app — shares clients table
// Anthropic: server-side only via /api/generate-caption.js
// In Vercel: add VITE_SUPABASE_URL, VITE_SUPABASE_KEY, ANTHROPIC_KEY
// ═══════════════════════════════════════════════════════════════════

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
