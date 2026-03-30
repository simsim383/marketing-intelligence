// ═══════════════════════════════════════════════════════════════════
// SUPABASE — Marketing Intelligence Database Operations
// ═══════════════════════════════════════════════════════════════════
// Shares the same Supabase instance + clients table as the Owner app.
// Users log in with the same business ID + PIN.
// Marketing data stored in: marketing_posts, marketing_schedules
// ═══════════════════════════════════════════════════════════════════
//
// SUPABASE TABLE SETUP (run these in Supabase SQL editor):
//
// CREATE TABLE IF NOT EXISTS marketing_posts (
//   id TEXT PRIMARY KEY,
//   client_id TEXT NOT NULL,
//   product_name TEXT NOT NULL,
//   price TEXT,
//   caption TEXT,
//   style TEXT,
//   template JSONB,
//   image_url TEXT,
//   media_type TEXT DEFAULT 'image',
//   show_branding BOOLEAN DEFAULT true,
//   created_at TIMESTAMPTZ DEFAULT now()
// );
//
// CREATE TABLE IF NOT EXISTS marketing_schedules (
//   id SERIAL PRIMARY KEY,
//   client_id TEXT NOT NULL,
//   post_id TEXT NOT NULL,
//   day_index INTEGER NOT NULL,
//   week_start DATE,
//   created_at TIMESTAMPTZ DEFAULT now()
// );
//
// -- RLS policies (same pattern as other tables):
// ALTER TABLE marketing_posts ENABLE ROW LEVEL SECURITY;
// ALTER TABLE marketing_schedules ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anon_all_marketing_posts" ON marketing_posts FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "anon_all_marketing_schedules" ON marketing_schedules FOR ALL USING (true) WITH CHECK (true);
// ═══════════════════════════════════════════════════════════════════

import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

const HDR = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function sbGet(t, p = "") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${p}`, { headers: HDR });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.message || `GET ${t} failed`); }
  return r.json();
}

async function sbPost(t, b) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}`, { method: "POST", headers: HDR, body: JSON.stringify(b) });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.message || `POST ${t} failed`); }
  return r.json();
}

async function sbDelete(t, p) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${p}`, { method: "DELETE", headers: HDR });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.message || `DELETE ${t} failed`); }
  return r.json();
}

async function sbPatch(t, p, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${p}`, {
    method: "PATCH", headers: { ...HDR, Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.message || `PATCH ${t} failed`); }
  return r.json();
}

// ─── LOCAL AUTH HELPERS (same as Owner app) ─────────────────────
export function getSavedOwnerId() {
  return localStorage.getItem("mi_owner_id") || null;
}
export function saveOwnerId(id) {
  localStorage.setItem("mi_owner_id", id);
}
export function getSavedPin() {
  const ownerId = getSavedOwnerId();
  return ownerId ? localStorage.getItem(`mi_pin_${ownerId}`) : null;
}
export function savePin(ownerId, pin) {
  localStorage.setItem(`mi_pin_${ownerId}`, pin);
}
export function logout() {
  const ownerId = getSavedOwnerId();
  if (ownerId) localStorage.removeItem(`mi_pin_${ownerId}`);
  localStorage.removeItem("mi_owner_id");
}

// ─── SUPABASE AUTH (shares clients table with Owner app) ────────
export async function verifyPin(clientId, pin) {
  if (!clientId || !pin) return false;
  try {
    const rows = await sbGet("clients", `id=eq.${encodeURIComponent(clientId)}&select=pin`);
    if (!rows.length) return false;
    if (!rows[0].pin) return true; // No PIN set = first login
    return rows[0].pin === pin;
  } catch (e) { console.error("PIN verify:", e); return false; }
}

export async function getOrCreateClient(ownerId) {
  if (!ownerId) return null;
  try {
    const existing = await sbGet("clients", `name=eq.${encodeURIComponent(ownerId)}`);
    if (existing.length > 0) return existing[0];
    // Don't auto-create for marketing — must exist from Owner app or invite flow
    return null;
  } catch (e) { console.error("Client lookup failed:", e); return null; }
}

export async function checkInviteCode(code) {
  const rows = await sbGet("invite_codes", `code=eq.${encodeURIComponent(code)}&limit=1`);
  if (!rows.length) return { valid: false, error: "Invalid code" };
  if (rows[0].used) return { valid: false, error: "Code already used" };
  return { valid: true };
}

export async function claimOwnerId(id, inviteCode) {
  const [takenOwner, takenClient] = await Promise.all([
    sbGet("owner_ids", `id=eq.${encodeURIComponent(id)}&limit=1`),
    sbGet("clients", `name=eq.${encodeURIComponent(id)}&limit=1`),
  ]);
  if (takenOwner.length > 0 || takenClient.length > 0) throw new Error("ID already taken");
  await sbPost("owner_ids", [{ id, created_at: new Date().toISOString() }]);
  await sbPatch("invite_codes", `code=eq.${encodeURIComponent(inviteCode)}`, {
    used: true, used_by: id, used_at: new Date().toISOString(),
  });
  await sbPost("clients", [{ name: id, owner_name: id }]);
  return { ok: true };
}

export async function setPin(clientId, pin) {
  if (!clientId || !pin) return;
  await sbPatch("clients", `id=eq.${encodeURIComponent(clientId)}`, { pin });
}

// ─── MARKETING POSTS ────────────────────────────────────────────
export async function saveMarketingPost(clientId, post) {
  const row = {
    id: post.id,
    client_id: clientId,
    product_name: post.productName,
    price: post.price || null,
    caption: post.caption || "",
    style: post.style || "new_arrival",
    template: post.template || null,
    image_url: post.imageUrl || null,
    media_type: post.mediaType || "image",
    show_branding: post.showBranding !== false,
    created_at: post.createdAt || new Date().toISOString(),
  };
  // Upsert: try insert, if conflict update
  try {
    await sbPost("marketing_posts", [row]);
  } catch {
    // Conflict = already exists, patch instead
    await sbPatch("marketing_posts", `id=eq.${encodeURIComponent(post.id)}`, row);
  }
  return row;
}

export async function loadMarketingPosts(clientId) {
  if (!clientId) return [];
  try {
    const rows = await sbGet("marketing_posts", `client_id=eq.${encodeURIComponent(clientId)}&order=created_at.desc&limit=100`);
    return rows.map(r => ({
      id: r.id,
      productName: r.product_name,
      price: r.price,
      caption: r.caption,
      style: r.style,
      template: r.template,
      imageUrl: r.image_url,
      mediaType: r.media_type || "image",
      showBranding: r.show_branding,
      createdAt: r.created_at,
    }));
  } catch (e) { console.error("Load posts:", e); return []; }
}

export async function deleteMarketingPost(postId) {
  // Also clean up schedule entries
  try { await sbDelete("marketing_schedules", `post_id=eq.${encodeURIComponent(postId)}`); } catch {}
  await sbDelete("marketing_posts", `id=eq.${encodeURIComponent(postId)}`);
}

// ─── MARKETING SCHEDULE ─────────────────────────────────────────
export async function saveMarketingSchedule(clientId, schedule) {
  // schedule = { 0: ["post_id1"], 2: ["post_id2", "post_id3"], ... }
  // Delete existing schedule for this client, then insert fresh
  try { await sbDelete("marketing_schedules", `client_id=eq.${encodeURIComponent(clientId)}`); } catch {}
  const rows = [];
  Object.entries(schedule).forEach(([dayIdx, postIds]) => {
    postIds.forEach(pid => {
      rows.push({ client_id: clientId, post_id: pid, day_index: parseInt(dayIdx) });
    });
  });
  if (rows.length > 0) await sbPost("marketing_schedules", rows);
}

export async function loadMarketingSchedule(clientId) {
  if (!clientId) return {};
  try {
    const rows = await sbGet("marketing_schedules", `client_id=eq.${encodeURIComponent(clientId)}&order=day_index.asc`);
    const schedule = {};
    rows.forEach(r => {
      const d = r.day_index;
      schedule[d] = [...(schedule[d] || []), r.post_id];
    });
    return schedule;
  } catch (e) { console.error("Load schedule:", e); return {}; }
}
