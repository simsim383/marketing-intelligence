// ═══════════════════════════════════════════════════════════════════
// /api/generate-caption.js — Vercel Serverless Function
// ═══════════════════════════════════════════════════════════════════

const STYLE_GUIDES = {
  hype_drop: `Write like this product is going absolutely mental. Short punchy lines. CAPS on 2-3 key words only.
Real examples from a top UK convenience store Instagram — match this EXACT energy:

"New Monster Voodoo Grape 🍇 And Strawberry Shot! 🍓 Now Available In Store And On The Snappy Shopper App!!"
"The Rarest Doritos Flavour! 🔥 Doritos Golden Sriracha! Just £2.50 Instore Only! #doritos"
"🚨 IT'S BACK AND FLYING OUT AGAIN! The viral Echo Falls Blue Raspberry is BACK IN STOCK 🔥 MAX 2 BOTTLES PER CUSTOMER ‼️ (Sold out last week... and we know what's about to happen again 👀)"

Pattern: Hook (creates urgency/FOMO) → Product name → Price → In store now → Hashtags
Keep under 60 words. Real shop owner voice, not marketing agency.`,

  new_arrival: `Just landed energy. Lead with "NEW" or "NOW IN STORE". Name the product specifically including variant.
Real examples to match:

"KA Remix Rum Now In Store! 🥃 Just £2.29 Or 3 For £6 In Store And On The Snappy Shopper App Download The App Today!"
"New Aero Pistachio Now Available In Store And On The Snappy Shopper App! Be Quick!!"
"🍫 NEW CHOCOLATE BARS 🍫 4 New Varieties Now Available!! Tony's Chocolonely, Cadbury Creme Egg & Milkybar Mini Eggs Bar *ALL AVAILABLE* Now!! Be Quick As They're Flying Out!! ⏳"

Pattern: NEW [Product] Now In Store! → Price → Be Quick / Flying Out → Hashtags
Under 60 words. Excited but direct.`,

  price_hero: `Price is the entire point. Lead with product, then price — make it impossible to miss.
Real examples to match:

"Doritos Golden Sriracha! Just £2.50 Instore Only! 🔥"
"KA Remix Rum Just £2.29 Or 3 For £6 In Store Now!"
"Echo Falls Blue Fruit Fusion Just £6.49! Grab It While Stock Lasts!"

Pattern: Product Name → Price (JUST £X.XX) → In Store / Only → Be Quick → Hashtags
Price must be on its own line or heavily emphasised. No waffle. Under 50 words.`,

  local_shoutout: `Warm, community feel. Talk to your regulars like they're mates. Personal, not corporate.
Real examples to match:

"Huge congratulations to our Creme Egg Giveaway winner, Wend Holleran! 🐣🍫 Please pop into the store to collect your prize 🎁 A big thank you to everyone who took part – keep an eye out for more giveaways coming soon 👀✨"
"You asked, we listened 👏 [Product] is now available! Pop in and grab yours."

Pattern: Personal hook → product/news → invite them in → thank you / community feeling → Hashtags
Warm and genuine. Under 70 words.`,

  weekend_vibe: `Friday/Saturday energy. Relaxed, like you're texting a mate. Perfect for drinks, crisps, snacks.
Real examples to match:

"Sweet, refreshing & perfect for the weekend vibes 🙌 Just in time for the weekend! Whether you're chilling at home or stocking up for a get-together..."
"Weekend sorted? Not yet 👀 [Product] — just £X.XX — the perfect grab for tonight 🍻"

Pattern: Weekend hook → product → price → perfect for tonight → pop in → Hashtags
Casual, inviting. Under 60 words.`,

  staff_pick: `Honest personal recommendation. "We tried it and it's brilliant" energy. Authentic opinion-led.
Real examples to match:

"Monster Voodoo Grape Now At The Store! 🍇😈 We Had To Try It — American Flavour And It Did NOT Disappoint!! Only £3.49 🇺🇸 In Store Now!"
"Honestly? This one caught us off guard 👏 [Product] — [price] and worth every penny. Trust us on this one."

Pattern: Personal reaction → product → price → honest endorsement → In Store → Hashtags
Feels like a real person, not a script. Under 65 words.`,
};

function buildPrompt(productName, price, storeName, style) {
  const guide = STYLE_GUIDES[style] || STYLE_GUIDES.new_arrival;
  const storeTag = storeName ? `#${storeName.replace(/\s+/g, '').toLowerCase()}` : '#localshop';
  const priceStr = price ? `£${price}` : null;

  return `You are the social media voice for ${storeName || 'a local UK convenience store'}.

Write ONE Facebook/Instagram post caption for this product. Study the real examples in the style guide and match that EXACT pattern and energy.

Product: ${productName}
${priceStr ? `Price: ${priceStr}` : 'No price provided — do not mention price'}
Store: ${storeName || 'our store'}

STYLE GUIDE — follow this precisely:
${guide}

RULES:
- Sound like a REAL excited shop owner, not a marketing copywriter
- If a price is given, include it prominently — this is one of the most important parts
- Always end with "In Store Now" or "In Store Only" or "Now Available In Store" — this drives footfall
- Include "Be Quick" or "Flying Out" or similar urgency at the end
- 2-3 hashtags maximum: always include ${storeTag}
- Under 80 words total
- Short punchy lines — never long paragraphs
- Write ONLY the caption text. No quotes around it, no explanation, no "Here's a post:"`;
}

export default async function handler(req, res) {
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
        max_tokens: 400,
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
