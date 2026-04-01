// ═══════════════════════════════════════════════════════════════════
// /api/generate-caption.js — Vercel Serverless Function
// ═══════════════════════════════════════════════════════════════════
// Keeps ANTHROPIC_KEY server-side only. No VITE_ prefix.
// In Vercel dashboard: add ANTHROPIC_KEY to Environment Variables.
// ═══════════════════════════════════════════════════════════════════

const STYLE_GUIDES = {
  hype_drop: `Write like this product is FLYING off the shelves. Stack urgency + FOMO hard.
Use CAPS on key phrases (not every word). Use ‼️ and 🔥 and 👀 naturally.
Real example to match this energy:
"🚨💙 IT'S BACK... AND FLYING OUT AGAIN! 💙🚨
The viral Echo Falls Blue Raspberry is BACK IN STOCK 🔥 MAX 2 BOTTLES PER CUSTOMER ‼️
(Sold out last week... and we know what's about to happen again 👀)
This one's been going CRAZY – everyone's talking about it! 💙🍷
Sweet, refreshing & perfect for the weekend vibes 🙌
⚠️ Be quick... once it's gone, it's GONE again!"
Match THIS level of hype. Not generic marketing — real excited shop owner energy.`,

  new_arrival: `Just landed energy. Lead with "NEW" in caps. Name the products specifically.
Short punchy lines. Let the product do the talking.
Real example to match:
"🍫 NEW CHOCOLATE BARS 🍫
4 New Varieties Of Chocolate Now At Chopwell Londis!! 😱
Tony's Chocolonely, Cadbury Creme Egg & Milkybar Mini Eggs Bar *ALL AVAILABLE* Now!! 😋
Be Quick As They're Flying Out!! ⏳
📍 CHOPWELL LONDIS
2 THE GREEN - NE17 7ER"
Notice: product names listed out, store address included, urgency at the end.`,

  price_hero: `Lead with the product name and price — make price the HERO. Short, punchy, no waffle.
Include "In Store" and "Be Quick". Add the Snappy Shopper link mention if relevant.
Real example to match:
"New Areo Pistachio Now Available In Store And On The Snappy Shopper App! Be Quick!!
#horsleyhillpremier #fyp #bossman"
Or: "Echo Falls Blue Fruit Fusion Blue Rasberry Wine Just £6.49!
Grab It While Stock Last!
Download The Snappy Shopper App"
Keep it direct. Price upfront. No fluff.`,

  local_shoutout: `Community feel. Warm, personal. Thank your customers. Mention the store by name.
Include the store location/postcode if known. Personal touch — "you asked, we listened" energy.
Real example to match:
"Huge congratulations to our Creme Egg Giveaway winner, Wend Holleran! 🐣🍫
Please pop into the store to collect your prize 🎁
A big thank you to everyone who took part – keep an eye out for more giveaways coming soon 👀✨"
Warm, genuine, community-building.`,

  weekend_vibe: `Relaxed, lifestyle energy. Perfect for drinks, snacks, Friday/Saturday posts.
"Perfect for tonight" vibes. Make it sound like you're talking to a mate.
Real example energy:
"Sweet, refreshing & perfect for the weekend vibes 🙌
Just in time for the weekend! Whether you're chilling at home or stocking up for a get-together... don't miss this!"
Casual, inviting, makes you want to pop in.`,

  staff_pick: `Personal recommendation from the team. "We tried it and loved it" energy.
Honest, opinion-led. "Honestly? This one caught us off guard" type feel.
Example energy:
"Monster Voodoo Grape Now At Horsley Hill Premier! 🍇😈
American Flavour Only £3.49 🇺🇸
In Store And On The Snappy Shopper App!"
Product excitement from the team's perspective. Personal, authentic.`,
};

function buildPrompt(productName, price, storeName, style) {
  const guide = STYLE_GUIDES[style] || STYLE_GUIDES.new_arrival;
  const storeTag = storeName ? `#${storeName.replace(/\s/g, '').toLowerCase()}` : '#localshop';

  return `You are the social media voice for ${storeName || 'a local convenience store'}, a UK independent convenience store.

Write a Facebook post for this product. It MUST sound like a real, excited shop owner — NOT a marketing agency. Study the style guide carefully and match that EXACT energy.

Product: ${productName}
${price ? `Price: £${price}` : ''}
Store: ${storeName || 'our local shop'}

Style guide: ${guide.replace('{storeName}', storeName || 'our shop')}

CRITICAL RULES:
- Sound like a REAL person running a shop, not a copywriter
- Use CAPITALS on 2-3 key words/phrases for emphasis (like BACK IN STOCK, ALL AVAILABLE, FLYING OUT)
- Use !! for excitement — real shop owners do this
- 3-5 emojis placed naturally through the text (not just at the start of lines)
- Short punchy lines — not long paragraphs
- Include the store name and location pin emoji naturally
- If there is a price, make it prominent
- End with urgency: "Be quick", "Once it is gone it is GONE", "Flying out" etc
- 2-3 hashtags at the end: always include ${storeTag}
- Under 120 words — these posts are punchy, not essays
- Each style must feel DISTINCTLY DIFFERENT from the others
- Write ONLY the post text. No quotes, no explanation, no preamble, no "Here is a post"`;
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
    return res.status(500).json({ error: 'ANTHROPIC_KEY not configured on server', detail: 'missing_key' });
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
      return res.status(502).json({ error: 'AI generation failed', detail: err.slice(0, 300) });
    }

    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '';

    return res.status(200).json({ caption: text.trim() });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
