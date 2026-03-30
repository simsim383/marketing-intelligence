// ═══════════════════════════════════════════════════════════════════
// CONFIG — API Keys & Environment
// ═══════════════════════════════════════════════════════════════════
// For local dev: create .env.local with VITE_ANTHROPIC_KEY=sk-...
// For Vercel: add VITE_ANTHROPIC_KEY in Environment Variables

export const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";
