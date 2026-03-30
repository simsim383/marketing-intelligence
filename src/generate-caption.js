// ═══════════════════════════════════════════════════════════════════
// /api/generate-caption.js — Vercel Serverless Function
// ═══════════════════════════════════════════════════════════════════
// Keeps ANTHROPIC_KEY server-side only. No VITE_ prefix.
// In Vercel dashboard: add ANTHROPIC_KEY to Environment Variables.
// ═══════════════════════════════════════════════════════════════════

const STYLE_GUIDES = {
  hype_drop: `Write like this is flying off the shelves. Use CAPS on key words (not every word).
Stack urgency + FOMO. Example style: 'MAX 2 BOTTLES PER CUSTOMER 🔥
Sold out last week... and we know what's about to happen again 👀
Once it's gone, it's GONE again!'`,

  new_arrival: `Just landed energy. Curiosity-led. Short and punchy.
Example style: 'Just landed in store 👀 Be quick before they're gone.'`,

  price_hero: `Lead with the price — make it the hero. Justify the value.
Example style: 'Just £X.XX — grab it while stock lasts!'`,

  local_shoutout: `Community feel. Include the store name naturally.
Warm, personal, address-anchored. Example style:
'You asked, we listened. Now available at {storeName} — pop in today 📍'`,

  weekend_vibe: `Relaxed, lifestyle energy. Perfect for Friday/Saturday posts.
Example style: 'Perfect for tonight 👌 Sweet, refreshing & made for the weekend vibes 🙌'`,

  staff_pick: `Personal recommendation. We love this one.
Example style: 'Honestly? This one caught us off guard. Give it a try — you won't regret it 👏'`,
};

function buildPrompt(productName, price, storeName, style) {
  const guide = STYLE_GUIDES[style] || STYLE_GUIDES.new_arrival;
  const storeTag = storeName ? `#${storeName.replace(/\s/g, '').toLowerCase()}` : '#localshop';

  return `You are the social media voice for ${storeName || 'a local convenience store'}, a UK independent convenience store.

Write a Facebook post for this product that sounds HUMAN, LOCAL and REAL — not like a marketing agency.

Product: ${productName}
${price ? `Price: £${price}` : ''}

Style guide: ${guide.replace('{storeName}', storeName || 'our shop')}

Rules:
- Write like a real shop owner who is excited about their stock
- Use CAPITALS occasionally on key words for emphasis (not every word, not every line)
- 2-4 emojis placed naturally mid-text, not just at line starts
- Include light urgency or FOMO where it feels natural
- 3-4 hashtags at the end: always include ${storeTag}
- If there's a price, feature it — don't hide it
- End with a soft local call to action (pop in, come grab one, you know where we are)
- Under 150 words
- Write ONLY the post text. No quotes, no explanation, no preamble.`;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { productName, price, storeName, style } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'productName is required' });
  }

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_KEY not configured on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildPrompt(productName, price, storeName, style) }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '';

    return res.status(200).json({ caption: text.trim() });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
