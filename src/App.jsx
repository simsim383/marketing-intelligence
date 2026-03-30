// ═══════════════════════════════════════════════════════════════════
// MARKETING INTELLIGENCE — AI Social Media Content Engine
// ═══════════════════════════════════════════════════════════════════
// Standalone app for independent UK convenience stores
// Snap → Template → AI Caption → Schedule → Post
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera, Upload, Sparkles, Calendar, Copy, ExternalLink, Eye, Trash2,
  ChevronLeft, ChevronRight, Clock, TrendingUp, Image as ImageIcon,
  Type, Palette, LayoutTemplate, RefreshCw, Check, X, Plus, Star,
  Megaphone, Share2, Zap, ArrowRight, Sun, Moon, GripVertical,
  LogOut, Lock, Store, Edit3, Send, Layers, Wand2, ChevronDown,
} from "lucide-react";

// ─── THEME ──────────────────────────────────────────────────────
const C = {
  bg: "#060A13", card: "#0D1420", surface: "#111927",
  border: "#1A2540", borderLight: "#243352",
  text: "#F1F5F9", white: "#FFFFFF",
  muted: "#8494B2", dim: "#4A5A7A",
  amber: "#F59E0B", amberDim: "rgba(245,158,11,0.12)",
  green: "#10B981", greenDim: "rgba(16,185,129,0.12)",
  blue: "#3B6FD4", blueDim: "rgba(59,111,212,0.12)",
  red: "#EF4444", redDim: "rgba(239,68,68,0.12)",
  purple: "#A855F7", purpleDim: "rgba(168,85,247,0.12)",
  purpleGlow: "rgba(168,85,247,0.25)",
};

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const DISPLAY = "'Fraunces', Georgia, serif";

// ─── BRANDED TEMPLATES ──────────────────────────────────────────
const TEMPLATES = [
  { id: "midnight",  name: "Midnight",   bg: "#0D1420", accent: "#A855F7", textColor: "#FFFFFF", badge: "#E9D5FF", style: "dark" },
  { id: "classic",   name: "Classic",    bg: "#0F172A", accent: "#F59E0B", textColor: "#FFFFFF", badge: "#FEF3C7", style: "dark" },
  { id: "fresh",     name: "Fresh",      bg: "#ECFDF5", accent: "#059669", textColor: "#064E3B", badge: "#D1FAE5", style: "light" },
  { id: "bold",      name: "Bold",       bg: "#7F1D1D", accent: "#FCA5A5", textColor: "#FFFFFF", badge: "#FEE2E2", style: "dark" },
  { id: "premium",   name: "Premium",    bg: "#1C1917", accent: "#D4A574", textColor: "#FAFAF9", badge: "#F5F0EB", style: "dark" },
  { id: "clean",     name: "Clean",      bg: "#FFFFFF", accent: "#2563EB", textColor: "#1E293B", badge: "#DBEAFE", style: "light" },
];

// ─── POST TONE OPTIONS ──────────────────────────────────────────
const TONES = [
  { id: "friendly",    label: "Friendly",      emoji: "😊", desc: "Warm, approachable" },
  { id: "promo",       label: "Promotional",   emoji: "🔥", desc: "Deal-focused, urgent" },
  { id: "informative", label: "Informative",   emoji: "📋", desc: "Clear, factual" },
  { id: "fun",         label: "Fun & Playful",  emoji: "🎉", desc: "Light-hearted, engaging" },
];

// ─── TRENDING IDEAS ─────────────────────────────────────────────
const TREND_IDEAS = [
  { cat: "Seasonal",  icon: "🗓️", ideas: ["Easter egg deals", "Summer BBQ bundles", "Back to school snacks", "Christmas countdown"] },
  { cat: "Everyday",  icon: "🛒", ideas: ["Meal deal of the day", "New arrival spotlight", "Staff pick of the week", "Friday treat night"] },
  { cat: "Community", icon: "🏘️", ideas: ["Local delivery shoutout", "Customer of the week", "Supporting local causes", "Store makeover update"] },
  { cat: "Hooks",     icon: "📱", ideas: ["\"You won't believe this deal\"", "\"Our customers asked…\"", "\"Before vs after\" display", "\"Rate our display 1–10\""] },
];

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


// ═══════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function Card({ children, style, onClick, className }) {
  return (
    <div onClick={onClick} className={className} style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: 20, transition: "border-color 0.25s, transform 0.25s", ...style
    }}>
      {children}
    </div>
  );
}

function Badge({ children, color = C.purple, style }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10,
      fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "4px 10px", borderRadius: 8,
      background: `${color}18`, color, ...style
    }}>{children}</span>
  );
}

function Btn({ children, primary, small, ghost, disabled, onClick, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: small ? "8px 14px" : "12px 20px",
    borderRadius: 10, border: "none", cursor: disabled ? "default" : "pointer",
    fontSize: small ? 12 : 13, fontWeight: 700, fontFamily: FONT,
    transition: "all 0.2s ease", opacity: disabled ? 0.45 : 1,
  };
  const v = primary
    ? { background: C.purple, color: "#fff", boxShadow: `0 0 20px ${C.purpleGlow}` }
    : ghost
    ? { background: "transparent", color: C.muted, border: `1px solid ${C.border}` }
    : { background: C.surface, color: C.muted, border: `1px solid ${C.border}` };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v, ...style }}>{children}</button>;
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: value ? C.purple : C.border, position: "relative", transition: "background 0.2s",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, left: value ? 23 : 3, transition: "left 0.2s",
        }} />
      </button>
    </div>
  );
}

function SectionLabel({ children, icon, style }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: C.dim, textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 6, ...style
    }}>
      {icon} {children}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// AUTH SCREEN — Simple localStorage-based login
// ═══════════════════════════════════════════════════════════════════
function AuthScreen({ onAuth }) {
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const name = storeName.trim();
    if (!name) { setError("Enter your store name"); return; }
    localStorage.setItem("mi_store_name", name);
    onAuth(name);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "-20%", left: "30%", width: 400, height: 400,
        background: `radial-gradient(circle, ${C.purpleGlow} 0%, transparent 70%)`,
        pointerEvents: "none", filter: "blur(60px)",
      }} />

      <div style={{ width: "100%", maxWidth: 380, textAlign: "center", position: "relative" }}>
        {/* Logo */}
        <div className="fade-up d1" style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 24px",
          background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px ${C.purpleGlow}`,
        }}>
          <Megaphone size={32} color="#fff" strokeWidth={2.2} />
        </div>

        <h1 className="fade-up d2" style={{
          fontFamily: DISPLAY, fontSize: 28, fontWeight: 800, color: C.white, marginBottom: 6,
        }}>
          Marketing <span style={{ color: C.purple }}>Intelligence</span>
        </h1>
        <p className="fade-up d3" style={{ fontSize: 13, color: C.dim, marginBottom: 32, lineHeight: 1.6 }}>
          AI-powered social content for your store.<br />Snap it. Style it. Post it.
        </p>

        <div className="fade-up d4" style={{
          background: C.card, borderRadius: 16, padding: 24,
          border: `1px solid ${C.border}`, textAlign: "left",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Store Name
          </div>
          <input
            value={storeName}
            onChange={e => { setStoreName(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. Londis Horden"
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12,
              background: C.surface, color: C.white, border: `1.5px solid ${C.border}`,
              fontSize: 15, outline: "none", fontFamily: FONT,
              boxSizing: "border-box", marginBottom: 12,
            }}
          />
          {error && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{error}</div>}

          <button onClick={handleSubmit} style={{
            width: "100%", padding: 16, borderRadius: 12, border: "none",
            background: storeName.trim() ? C.purple : C.surface,
            color: storeName.trim() ? "#fff" : C.dim,
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
            transition: "all 0.2s", boxShadow: storeName.trim() ? `0 0 30px ${C.purpleGlow}` : "none",
          }}>
            Get Started <ArrowRight size={16} style={{ verticalAlign: "middle", marginLeft: 4 }} />
          </button>
        </div>

        <p className="fade-up d5" style={{ fontSize: 11, color: C.dim, marginTop: 20 }}>
          Part of <span style={{ color: C.muted, fontWeight: 600 }}>Retail Intelligence</span>
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// MAIN APP SHELL
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [storeName, setStoreName] = useState(localStorage.getItem("mi_store_name") || "");
  const [view, setView] = useState("hub");
  const [posts, setPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mi_posts") || "[]"); } catch { return []; }
  });
  const [schedule, setSchedule] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mi_schedule") || "{}"); } catch { return {}; }
  });
  const [editingPost, setEditingPost] = useState(null);

  // Persist posts & schedule
  useEffect(() => { localStorage.setItem("mi_posts", JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem("mi_schedule", JSON.stringify(schedule)); }, [schedule]);

  const logout = () => {
    localStorage.removeItem("mi_store_name");
    setStoreName("");
  };

  if (!storeName) return <AuthScreen onAuth={setStoreName} />;

  if (view === "create") return (
    <CreatePostView
      existingPost={editingPost}
      storeName={storeName}
      onSave={(post) => {
        if (editingPost) {
          setPosts(prev => prev.map(p => p.id === post.id ? post : p));
        } else {
          setPosts(prev => [post, ...prev]);
        }
        setEditingPost(null);
        setView("hub");
      }}
      onBack={() => { setEditingPost(null); setView("hub"); }}
    />
  );

  if (view === "schedule") return (
    <ScheduleView
      posts={posts}
      schedule={schedule}
      onUpdate={setSchedule}
      onBack={() => setView("hub")}
    />
  );

  return (
    <HubView
      storeName={storeName}
      posts={posts}
      schedule={schedule}
      onCreateNew={() => { setEditingPost(null); setView("create"); }}
      onEditPost={(p) => { setEditingPost(p); setView("create"); }}
      onSchedule={() => setView("schedule")}
      onDeletePost={(id) => {
        setPosts(prev => prev.filter(p => p.id !== id));
        setSchedule(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => { next[k] = next[k].filter(pid => pid !== id); });
          return next;
        });
      }}
      onLogout={logout}
    />
  );
}


// ═══════════════════════════════════════════════════════════════════
// HUB VIEW — Main dashboard
// ═══════════════════════════════════════════════════════════════════
function HubView({ storeName, posts, schedule, onCreateNew, onEditPost, onSchedule, onDeletePost, onLogout }) {
  const scheduledIds = Object.values(schedule).flat();
  const scheduledCount = scheduledIds.length;
  const unscheduledPosts = posts.filter(p => !scheduledIds.includes(p.id));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text }}>
      {/* ── HEADER ── */}
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `linear-gradient(180deg, ${C.card} 0%, ${C.bg} 100%)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Megaphone size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.white, fontFamily: DISPLAY }}>
              Marketing <span style={{ color: C.purple }}>Intelligence</span>
            </div>
            <div style={{ fontSize: 11, color: C.dim, display: "flex", alignItems: "center", gap: 4 }}>
              <Store size={10} /> {storeName}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "6px 10px", color: C.dim, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 600, fontFamily: FONT,
        }}>
          <LogOut size={12} /> Sign Out
        </button>
      </div>

      <div style={{ padding: 20, maxWidth: 540, margin: "0 auto" }}>

        {/* ── QUICK STATS ── */}
        <div className="fade-up d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Created",   value: posts.length,           color: C.purple, icon: <Layers size={15} /> },
            { label: "Scheduled", value: scheduledCount,         color: C.green,  icon: <Calendar size={15} /> },
            { label: "Ready",     value: unscheduledPosts.length, color: C.amber,  icon: <Clock size={15} /> },
          ].map(s => (
            <Card key={s.label} style={{ padding: 16, textAlign: "center" }}>
              <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.white, fontFamily: DISPLAY }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="fade-up d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          <Btn primary onClick={onCreateNew} style={{ justifyContent: "center", padding: 16, borderRadius: 14 }}>
            <Camera size={16} /> New Post
          </Btn>
          <Btn onClick={onSchedule} style={{
            justifyContent: "center", padding: 16, borderRadius: 14,
            background: C.purpleDim, color: C.purple, border: `1px solid ${C.purple}33`,
          }}>
            <Calendar size={16} /> Schedule
          </Btn>
        </div>

        {/* ── WEEK AT A GLANCE ── */}
        <Card className="fade-up d3" style={{ marginBottom: 20 }}>
          <SectionLabel icon={<Calendar size={11} color={C.purple} />}>This Week</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {DAYS_SHORT.map((d, i) => {
              const dayPosts = (schedule[i] || []).map(id => posts.find(p => p.id === id)).filter(Boolean);
              const has = dayPosts.length > 0;
              return (
                <div key={d} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.dim, marginBottom: 5, letterSpacing: "0.05em" }}>{d}</div>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, margin: "0 auto",
                    background: has ? C.purpleDim : C.surface,
                    border: `1.5px solid ${has ? C.purple + "55" : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: has ? C.purple : C.dim,
                    transition: "all 0.2s",
                  }}>
                    {has ? dayPosts.length : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── POST IDEAS ── */}
        <Card className="fade-up d4" style={{ marginBottom: 20 }}>
          <SectionLabel icon={<Sparkles size={11} color={C.amber} />}>Post Ideas & Inspiration</SectionLabel>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TREND_IDEAS.map(cat => (
              <div key={cat.cat} style={{
                background: C.surface, borderRadius: 12, padding: 14,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>
                  {cat.icon} {cat.cat}
                </div>
                {cat.ideas.map(idea => (
                  <div key={idea} onClick={onCreateNew} style={{
                    fontSize: 11, color: C.text, padding: "6px 0",
                    cursor: "pointer", borderBottom: `1px solid ${C.border}08`,
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.purple}
                  onMouseLeave={e => e.currentTarget.style.color = C.text}
                  >
                    <Plus size={9} color={C.purple} style={{ flexShrink: 0 }} /> {idea}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* ── POST LIBRARY ── */}
        {posts.length > 0 && (
          <Card className="fade-up d5">
            <SectionLabel icon={<Layers size={11} color={C.blue} />}>Your Posts</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  isScheduled={scheduledIds.includes(post.id)}
                  onEdit={() => onEditPost(post)}
                  onDelete={() => onDeletePost(post.id)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* ── EMPTY STATE ── */}
        {posts.length === 0 && (
          <Card className="fade-up d5" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📸</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.white, marginBottom: 6, fontFamily: DISPLAY }}>No posts yet</div>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 20, lineHeight: 1.7, maxWidth: 280, margin: "0 auto 20px" }}>
              Take a photo of a product, pick a branded template, and let AI write the perfect caption.
            </div>
            <Btn primary onClick={onCreateNew}><Camera size={14} /> Create Your First Post</Btn>
          </Card>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "32px 0 20px", fontSize: 11, color: C.dim }}>
          Part of <span style={{ fontWeight: 600, color: C.muted }}>Retail Intelligence</span> · Built in the UK
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// POST CARD — Library item
// ═══════════════════════════════════════════════════════════════════
function PostCard({ post, isScheduled, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copyCaption = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: C.surface, borderRadius: 12, overflow: "hidden",
      border: `1px solid ${C.border}`, transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", gap: 12, padding: 12 }}>
        {post.imageUrl && (
          <div style={{
            width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0,
            background: post.template?.bg || C.card,
          }}>
            <img src={post.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 3 }}>{post.productName || "Untitled"}</div>
          <div style={{ fontSize: 11, color: C.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>
            {post.caption?.slice(0, 70)}…
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Badge color={C.purple} style={{ fontSize: 8, padding: "2px 7px" }}>{post.template?.name || "Classic"}</Badge>
            <Badge color={C.green} style={{ fontSize: 8, padding: "2px 7px" }}>{TONES.find(t => t.id === post.tone)?.label || "Friendly"}</Badge>
            {isScheduled && <Badge color={C.blue} style={{ fontSize: 8, padding: "2px 7px" }}>Scheduled</Badge>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
        {[
          { icon: <Edit3 size={11} />, label: "Edit",   fn: onEdit,   color: C.blue },
          { icon: copied ? <Check size={11} /> : <Copy size={11} />, label: copied ? "Copied!" : "Copy", fn: copyCaption, color: C.green },
          { icon: <ExternalLink size={11} />, label: "Facebook", fn: () => { navigator.clipboard.writeText(post.caption); setTimeout(() => window.open("https://www.facebook.com", "_blank"), 300); }, color: C.blue },
          { icon: <Trash2 size={11} />, label: "Delete", fn: (e) => { e.stopPropagation(); onDelete(); }, color: C.red },
        ].map((a, idx) => (
          <button key={a.label} onClick={a.fn} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "10px 0", background: "none", border: "none",
            borderRight: idx < 3 ? `1px solid ${C.border}` : "none",
            color: a.color, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// CREATE POST VIEW — 4-step flow
// ═══════════════════════════════════════════════════════════════════
function CreatePostView({ existingPost, storeName, onSave, onBack }) {
  const [step, setStep] = useState(1);
  const fileRef = useRef(null);

  const [imageUrl, setImageUrl] = useState(existingPost?.imageUrl || null);
  const [productName, setProductName] = useState(existingPost?.productName || "");
  const [price, setPrice] = useState(existingPost?.price || "");
  const [template, setTemplate] = useState(existingPost?.template || TEMPLATES[0]);
  const [tone, setTone] = useState(existingPost?.tone || "friendly");
  const [caption, setCaption] = useState(existingPost?.caption || "");
  const [generating, setGenerating] = useState(false);
  const [showBranding, setShowBranding] = useState(existingPost?.showBranding !== false);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const generateCaption = async () => {
    setGenerating(true);
    const toneObj = TONES.find(t => t.id === tone);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content:
            `You are a social media manager for "${storeName}", a UK independent convenience store. Write a Facebook post:

Product: ${productName}
${price ? `Price: £${price}` : ""}
Tone: ${toneObj?.label} — ${toneObj?.desc}

Rules:
- Under 120 words
- 2-3 emojis placed naturally (not line starts)
- 2-3 hashtags at the end
- Genuine, not corporate
- Highlight value if there's a price
- End with a soft call to action (pop in, grab one, swing by, etc.)
- Write ONLY the post text, nothing else — no quotes, no preamble` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setCaption(text.trim());
    } catch (err) {
      console.error("Caption gen error:", err);
      setCaption(`Check out ${productName}${price ? ` — just £${price}` : ""}! Pop in and grab yours today 🔥\n\n#LocalShop #Deals #${storeName.replace(/\s/g, "")}`);
    }
    setGenerating(false);
  };

  const handleSave = () => {
    onSave({
      id: existingPost?.id || `post_${Date.now()}`,
      imageUrl, productName, price, template, tone, caption, showBranding,
      createdAt: existingPost?.createdAt || new Date().toISOString(),
    });
  };

  const steps = [
    { n: 1, label: "Photo",    icon: <Camera size={11} /> },
    { n: 2, label: "Template", icon: <LayoutTemplate size={11} /> },
    { n: 3, label: "Caption",  icon: <Type size={11} /> },
    { n: 4, label: "Preview",  icon: <Eye size={11} /> },
  ];

  const canAdvance = (s) => {
    if (s === 1) return imageUrl && productName;
    if (s === 2) return template;
    if (s === 3) return caption;
    return true;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.white }}>
            {existingPost ? "Edit Post" : "Create Post"}
          </span>
        </div>
        {step === 4 && <Btn primary small onClick={handleSave}><Check size={12} /> Save</Btn>}
      </div>

      {/* Step bar */}
      <div style={{
        padding: "10px 20px", display: "flex", gap: 2, justifyContent: "center",
        background: C.card, borderBottom: `1px solid ${C.border}`,
      }}>
        {steps.map((s, idx) => (
          <button key={s.n} onClick={() => { if (s.n <= step || canAdvance(s.n - 1)) setStep(s.n); }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "7px 16px", borderRadius: 8, border: "none",
              background: step === s.n ? C.purpleDim : "transparent",
              color: step === s.n ? C.purple : step > s.n ? C.green : C.dim,
              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.2s",
            }}>
            {step > s.n ? <Check size={10} strokeWidth={3} /> : s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>

        {/* ═══ STEP 1: PHOTO ═══ */}
        {step === 1 && (
          <div className="fade-up">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: "none" }} />

            {!imageUrl ? (
              <Card onClick={() => fileRef.current?.click()} style={{
                textAlign: "center", padding: 48, cursor: "pointer",
                border: `2px dashed ${C.borderLight}`, background: C.surface,
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, margin: "0 auto 20px",
                  background: C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Camera size={32} color={C.purple} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 6, fontFamily: DISPLAY }}>
                  Add a product photo
                </div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
                  Take a snap or choose from your gallery.<br />
                  A clear, well-lit shot works best.
                </div>
              </Card>
            ) : (
              <>
                <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ position: "relative" }}>
                    <img src={imageUrl} alt="" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
                    <button onClick={() => setImageUrl(null)} style={{
                      position: "absolute", top: 10, right: 10, width: 32, height: 32,
                      borderRadius: 8, background: "rgba(0,0,0,0.65)", border: "none",
                      color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(8px)",
                    }}><X size={14} /></button>
                    <button onClick={() => fileRef.current?.click()} style={{
                      position: "absolute", top: 10, left: 10, padding: "6px 12px",
                      borderRadius: 8, background: "rgba(0,0,0,0.65)", border: "none",
                      color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: FONT,
                      display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(8px)",
                    }}><RefreshCw size={11} /> Change</button>
                  </div>
                </Card>

                <Card style={{ marginBottom: 14 }}>
                  <SectionLabel>Product Details</SectionLabel>
                  <input value={productName} onChange={e => setProductName(e.target.value)}
                    placeholder="Product name (e.g. Coca-Cola 2L)"
                    style={{
                      width: "100%", padding: "13px 14px", borderRadius: 10,
                      background: C.surface, color: C.white, border: `1px solid ${C.border}`,
                      fontSize: 14, outline: "none", fontFamily: FONT, boxSizing: "border-box", marginBottom: 8,
                    }} />
                  <input value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="Price — optional (e.g. 1.99)"
                    style={{
                      width: "100%", padding: "13px 14px", borderRadius: 10,
                      background: C.surface, color: C.white, border: `1px solid ${C.border}`,
                      fontSize: 14, outline: "none", fontFamily: FONT, boxSizing: "border-box",
                    }} />
                </Card>

                <Card style={{ marginBottom: 16 }}>
                  <SectionLabel>Options</SectionLabel>
                  <Toggle value={showBranding} onChange={setShowBranding} label="Branded template frame" />
                </Card>
              </>
            )}

            {imageUrl && productName && (
              <Btn primary onClick={() => setStep(2)}
                style={{ width: "100%", justifyContent: "center", padding: 16, borderRadius: 14 }}>
                Next: Choose Template <ArrowRight size={14} />
              </Btn>
            )}
          </div>
        )}

        {/* ═══ STEP 2: TEMPLATE ═══ */}
        {step === 2 && (
          <div className="fade-up">
            <SectionLabel style={{ marginBottom: 12 }}>Choose a style</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t)} style={{
                  padding: 0, border: template.id === t.id ? `2.5px solid ${C.purple}` : `2px solid ${C.border}`,
                  borderRadius: 14, overflow: "hidden", cursor: "pointer", background: "none",
                  transition: "border-color 0.2s, transform 0.15s",
                  transform: template.id === t.id ? "scale(1.03)" : "scale(1)",
                }}>
                  <div style={{
                    background: t.bg, padding: 18, height: 88,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: t.accent,
                      marginBottom: 8, boxShadow: `0 2px 8px ${t.accent}44`,
                    }} />
                    <div style={{ fontSize: 9, fontWeight: 800, color: t.textColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {imageUrl && (
              <Card style={{ marginBottom: 18, padding: 0, overflow: "hidden" }}>
                <TemplatePreview
                  imageUrl={imageUrl} productName={productName} price={price}
                  template={template} showBranding={showBranding} storeName={storeName}
                />
              </Card>
            )}

            <Btn primary onClick={() => { setStep(3); if (!caption) generateCaption(); }}
              style={{ width: "100%", justifyContent: "center", padding: 16, borderRadius: 14 }}>
              Next: AI Caption <Sparkles size={14} />
            </Btn>
          </div>
        )}

        {/* ═══ STEP 3: CAPTION ═══ */}
        {step === 3 && (
          <div className="fade-up">
            <SectionLabel style={{ marginBottom: 10 }}>Post tone</SectionLabel>
            <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                  border: tone === t.id ? `1.5px solid ${C.purple}` : `1px solid ${C.border}`,
                  background: tone === t.id ? C.purpleDim : C.surface,
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 20 }}>{t.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: C.dim }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <Btn onClick={generateCaption} disabled={generating}
              style={{
                width: "100%", justifyContent: "center", marginBottom: 14, padding: 14, borderRadius: 12,
                background: C.purpleDim, color: C.purple, border: `1px solid ${C.purple}33`,
              }}>
              {generating
                ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Writing your post…</>
                : <><Wand2 size={14} /> {caption ? "Regenerate Caption" : "Generate with AI"}</>}
            </Btn>

            <textarea value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Your AI caption will appear here — or write your own…"
              rows={8}
              style={{
                width: "100%", padding: 16, borderRadius: 14,
                background: C.surface, color: C.white, border: `1px solid ${C.border}`,
                fontSize: 13, lineHeight: 1.7, outline: "none", fontFamily: FONT,
                resize: "vertical", boxSizing: "border-box", marginBottom: 16,
              }} />

            {caption && (
              <Btn primary onClick={() => setStep(4)}
                style={{ width: "100%", justifyContent: "center", padding: 16, borderRadius: 14 }}>
                Preview Post <Eye size={14} />
              </Btn>
            )}
          </div>
        )}

        {/* ═══ STEP 4: PREVIEW ═══ */}
        {step === 4 && (
          <PreviewStep
            imageUrl={imageUrl} productName={productName} price={price}
            template={template} showBranding={showBranding} caption={caption}
            storeName={storeName} onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// TEMPLATE PREVIEW — Branded image render
// ═══════════════════════════════════════════════════════════════════
function TemplatePreview({ imageUrl, productName, price, template, showBranding, storeName, size = "medium" }) {
  const h = size === "small" ? 140 : size === "large" ? 380 : 260;

  return (
    <div style={{
      background: template.bg, padding: showBranding ? 16 : 0,
      position: "relative", overflow: "hidden",
    }}>
      {/* Corner accent */}
      {showBranding && (
        <>
          <div style={{
            position: "absolute", top: 0, right: 0, width: 100, height: 100,
            background: `linear-gradient(135deg, ${template.accent}22, transparent)`,
            borderBottomLeftRadius: 60,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, width: 60, height: 60,
            background: `linear-gradient(315deg, ${template.accent}15, transparent)`,
            borderTopRightRadius: 40,
          }} />
        </>
      )}

      {/* Image */}
      <div style={{
        width: "100%", height: h, borderRadius: showBranding ? 12 : 0,
        overflow: "hidden", position: "relative",
      }}>
        <img src={imageUrl} alt={productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {price && showBranding && (
          <div style={{
            position: "absolute", bottom: 12, right: 12,
            background: template.accent, color: template.style === "light" ? "#fff" : "#000",
            padding: "10px 16px", borderRadius: 12,
            fontSize: 20, fontWeight: 900, fontFamily: DISPLAY,
            boxShadow: `0 4px 16px rgba(0,0,0,0.35)`,
          }}>
            £{price}
          </div>
        )}
      </div>

      {showBranding && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 14, paddingTop: 12,
          borderTop: `1px solid ${template.accent}25`,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: template.textColor, fontFamily: DISPLAY }}>
              {productName}
            </div>
            {storeName && (
              <div style={{ fontSize: 10, color: template.textColor, opacity: 0.55, marginTop: 3, display: "flex", alignItems: "center", gap: 3 }}>
                <Store size={9} /> {storeName}
              </div>
            )}
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `${template.accent}20`, border: `1.5px solid ${template.accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: template.accent,
          }}>
            RI
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// PREVIEW STEP — Facebook mockup + actions
// ═══════════════════════════════════════════════════════════════════
function PreviewStep({ imageUrl, productName, price, template, showBranding, caption, storeName, onSave }) {
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);

  const copyAndOpen = () => {
    navigator.clipboard.writeText(caption).then(() => {
      setOpening(true);
      setTimeout(() => { window.open("https://www.facebook.com", "_blank"); setOpening(false); }, 600);
    });
  };

  return (
    <div className="fade-up">
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        {/* FB header */}
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff",
          }}>
            {(storeName || "S").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{storeName || "Your Store"}</div>
            <div style={{ fontSize: 11, color: C.dim }}>Just now · 🌍</div>
          </div>
        </div>

        {/* Caption */}
        <div style={{ padding: "0 16px 14px", fontSize: 13, color: C.text, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {caption}
        </div>

        {/* Image */}
        <TemplatePreview
          imageUrl={imageUrl} productName={productName} price={price}
          template={template} showBranding={showBranding} storeName={storeName}
          size="large"
        />

        {/* FB reactions mock */}
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: C.dim }}>👍 ❤️ 12</span>
          <span style={{ fontSize: 12, color: C.dim }}>3 comments · 2 shares</span>
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn primary onClick={copyAndOpen} style={{ width: "100%", justifyContent: "center", padding: 16, borderRadius: 14 }}>
          {opening
            ? <><Check size={14} /> Copied — opening Facebook…</>
            : <><ExternalLink size={14} /> Copy Caption & Open Facebook</>}
        </Btn>
        <Btn onClick={() => {
          navigator.clipboard.writeText(caption);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }} style={{ width: "100%", justifyContent: "center", padding: 14, borderRadius: 12 }}>
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Caption Only</>}
        </Btn>
        <Btn onClick={onSave} style={{
          width: "100%", justifyContent: "center", padding: 14, borderRadius: 12,
          background: C.greenDim, color: C.green, border: `1px solid ${C.green}33`,
        }}>
          <Check size={14} /> Save to Library
        </Btn>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// SCHEDULE VIEW — Weekly planner
// ═══════════════════════════════════════════════════════════════════
function ScheduleView({ posts, schedule, onUpdate, onBack }) {
  const [assigning, setAssigning] = useState(null);
  const scheduledIds = Object.values(schedule).flat();
  const unscheduled = posts.filter(p => !scheduledIds.includes(p.id));

  const assignToDay = (dayIdx) => {
    if (!assigning) return;
    const current = schedule[dayIdx] || [];
    if (current.includes(assigning.id)) return;
    onUpdate({ ...schedule, [dayIdx]: [...current, assigning.id] });
    setAssigning(null);
  };

  const removeFromDay = (dayIdx, postId) => {
    onUpdate({ ...schedule, [dayIdx]: (schedule[dayIdx] || []).filter(id => id !== postId) });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text }}>
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>Weekly Schedule</div>
          <div style={{ fontSize: 11, color: C.dim }}>Tap a post below, then tap a day to assign it</div>
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>

        {assigning && (
          <div className="fade-in" style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 14,
            background: C.purpleDim, border: `1px solid ${C.purple}44`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: C.purple, fontWeight: 700 }}>
              <Zap size={11} style={{ verticalAlign: "middle" }} /> Assigning: {assigning.productName}
            </span>
            <button onClick={() => setAssigning(null)} style={{ background: "none", border: "none", color: C.purple, cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Weekly grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {DAYS_FULL.map((day, i) => {
            const dayPostIds = schedule[i] || [];
            const dayPosts = dayPostIds.map(id => posts.find(p => p.id === id)).filter(Boolean);
            return (
              <Card key={day} onClick={() => assigning && assignToDay(i)}
                style={{
                  padding: 14, cursor: assigning ? "pointer" : "default",
                  border: assigning ? `1.5px solid ${C.purple}44` : `1px solid ${C.border}`,
                  transition: "all 0.2s",
                }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: dayPosts.length ? 8 : 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{day}</span>
                  <Badge color={dayPosts.length ? C.purple : C.dim} style={{ fontSize: 9 }}>
                    {dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {dayPosts.map(p => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 8px",
                    background: C.surface, borderRadius: 8, marginBottom: 4,
                  }}>
                    {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover" }} />}
                    <span style={{ fontSize: 11, color: C.text, flex: 1, fontWeight: 500 }}>{p.productName}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFromDay(i, p.id); }}
                      style={{ background: "none", border: "none", color: C.red, cursor: "pointer", padding: 2, opacity: 0.7 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {!dayPosts.length && !assigning && (
                  <div style={{ fontSize: 11, color: C.dim, fontStyle: "italic" }}>No posts</div>
                )}
                {assigning && !dayPosts.find(p => p.id === assigning.id) && (
                  <div style={{ fontSize: 11, color: C.purple, fontWeight: 700, marginTop: 4 }}>+ Tap to assign here</div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Unscheduled */}
        {unscheduled.length > 0 && (
          <Card>
            <SectionLabel icon={<Layers size={11} color={C.amber} />}>
              Unscheduled ({unscheduled.length})
            </SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {unscheduled.map(p => (
                <button key={p.id} onClick={() => setAssigning(p)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: assigning?.id === p.id ? C.purpleDim : C.surface,
                  border: assigning?.id === p.id ? `1.5px solid ${C.purple}` : `1px solid ${C.border}`,
                  borderRadius: 10, cursor: "pointer", width: "100%", textAlign: "left",
                  transition: "all 0.2s",
                }}>
                  {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{p.productName}</div>
                    <div style={{ fontSize: 10, color: C.dim }}>{TONES.find(t => t.id === p.tone)?.label || "Friendly"} · {p.template?.name}</div>
                  </div>
                  <ArrowRight size={12} color={C.purple} />
                </button>
              ))}
            </div>
          </Card>
        )}

        {posts.length === 0 && (
          <Card style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 12, color: C.dim }}>Create some posts first, then come back here to schedule them.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
