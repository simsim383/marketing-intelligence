# Marketing Intelligence

AI-powered social media content engine for independent UK convenience stores.

Part of the **Retail Intelligence** suite — alongside Owner Intelligence and Staff Intelligence.

---

## What It Does

- **Snap** — Take a product photo or upload from gallery
- **Template** — Apply branded frames (6 styles: Midnight, Classic, Fresh, Bold, Premium, Clean)
- **AI Caption** — Claude generates natural, engaging Facebook posts matched to your tone
- **Schedule** — Plan your week visually, assign posts to days
- **Post** — Copy caption + open Facebook in one tap

---

## Tech Stack

- React 18 + Vite
- Anthropic Claude API (AI captions)
- localStorage (posts, schedule, auth)
- Lucide React (icons)

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/marketing-intelligence.git
cd marketing-intelligence
npm install
```

### 2. Add Your API Key

Create `.env.local` in the project root:

```
VITE_ANTHROPIC_KEY=sk-ant-your-key-here
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import the repo
3. Vercel auto-detects Vite — leave defaults
4. Add Environment Variable: `VITE_ANTHROPIC_KEY` = your Anthropic API key
5. Click **Deploy** ✓

---

## Project Structure

```
marketing-intelligence/
├── index.html            ← Vite entry
├── package.json
├── vite.config.js
├── vercel.json           ← SPA routing
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          ← React root
    ├── App.jsx           ← All components (auth, hub, creator, scheduler)
    ├── config.js          ← API key config
    └── index.css          ← Global styles
```

---

## Features

### Post Creator (4-step flow)
1. **Photo** — Camera snap or gallery upload, product name + price
2. **Template** — 6 branded styles with live preview, price badge, store branding
3. **Caption** — AI-generated with tone control (Friendly / Promotional / Informative / Fun)
4. **Preview** — Full Facebook-style mockup with "Copy & Open Facebook" flow

### Post Library
- All created posts saved locally
- Edit, copy caption, open Facebook, or delete
- Scheduled status shown per post

### Weekly Scheduler
- Tap-to-assign flow (tap post → tap day)
- Visual week overview on hub dashboard
- Remove/reassign posts easily

### Inspiration Hub
- Seasonal, everyday, community, and viral hook post ideas
- Tap any idea to start creating

---

## Roadmap

- [ ] Facebook Graph API auto-posting (requires Meta App Review)
- [ ] Instagram posting support
- [ ] Background removal API integration
- [ ] AI image enhancement
- [ ] Supabase backend (multi-device sync)
- [ ] "What others are posting" community feed
- [ ] Trend suggestions from Owner Intelligence data
- [ ] Scheduled auto-posting via serverless cron

---

© 2026 Retail Intelligence · Built in the UK
