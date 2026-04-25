// Provider-specific mock response generators. Each returns a JSON shape
// that mirrors the real response a developer would receive from the
// provider's documented endpoint. Vivid + slightly randomized so repeat
// calls feel different.

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min;
  const m = 10 ** decimals;
  return Math.round(v * m) / m;
}

function randomId(prefix: string, len = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${out}`;
}

function pulseLlm(): unknown {
  const completions = [
    "Arc is a payments-native L1 from Circle where USDC is the gas token, finality lands in well under a second, and stablecoin transfers settle for fractions of a cent — purpose-built for programmable money.",
    "Arc is Circle's stablecoin-first blockchain: USDC pays gas, blocks finalize in under a second, and the chain is tuned for the kind of high-frequency, low-margin payment flows that make existing L1s flinch.",
    "Arc collapses the gap between fiat rails and on-chain settlement — a sub-second L1 where USDC is the native unit of account, gas is denominated in dollars, and TPS is measured for payments, not memes.",
  ];
  const promptTokens = randInt(14, 38);
  const completionTokens = randInt(40, 110);
  return {
    id: randomId("chatcmpl", 24),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "pulse-70b",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: pick(completions),
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
    system_fingerprint: `fp_${randomId("", 10).slice(1)}`,
  };
}

function lumenGeocode(): unknown {
  const places = [
    {
      formatted: "1455 Market St, San Francisco, CA 94103, USA",
      lat: 37.77548,
      lng: -122.41743,
      locality: "San Francisco",
      admin: "California",
      postal: "94103",
      country: "US",
    },
    {
      formatted: "350 5th Ave, New York, NY 10118, USA",
      lat: 40.74844,
      lng: -73.98566,
      locality: "New York",
      admin: "New York",
      postal: "10118",
      country: "US",
    },
    {
      formatted: "60 Holborn Viaduct, London EC1A 2FD, UK",
      lat: 51.51797,
      lng: -0.10286,
      locality: "London",
      admin: "England",
      postal: "EC1A 2FD",
      country: "GB",
    },
  ];
  const p = pick(places);
  return {
    query: p.formatted,
    results: [
      {
        formatted_address: p.formatted,
        lat: p.lat + randFloat(-0.0002, 0.0002, 5),
        lng: p.lng + randFloat(-0.0002, 0.0002, 5),
        confidence: randFloat(0.91, 0.99, 3),
        components: {
          street: p.formatted.split(",")[0],
          locality: p.locality,
          admin_area: p.admin,
          postal_code: p.postal,
          country: p.country,
        },
        place_type: "rooftop",
        bbox: [
          p.lng - 0.0008,
          p.lat - 0.0008,
          p.lng + 0.0008,
          p.lat + 0.0008,
        ],
      },
    ],
    attribution: "© Lumen Geocode 2026",
  };
}

function veritOcr(): unknown {
  const merchants = ["Blue Bottle Coffee", "Tartine Bakery", "Arc Hardware Co.", "Mission Cheese"];
  const merchant = pick(merchants);
  const subtotal = randFloat(8.5, 64.0, 2);
  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const lineCount = randInt(2, 4);
  const items: { description: string; qty: number; unit_price: number; line_total: number }[] = [];
  const menu = [
    { description: "Cappuccino", price: 5.25 },
    { description: "Almond croissant", price: 4.5 },
    { description: "Avocado toast", price: 12.0 },
    { description: "Cold brew", price: 4.75 },
    { description: "Morning bun", price: 4.25 },
  ];
  for (let i = 0; i < lineCount; i++) {
    const m = pick(menu);
    const qty = randInt(1, 2);
    items.push({
      description: m.description,
      qty,
      unit_price: m.price,
      line_total: Math.round(m.price * qty * 100) / 100,
    });
  }
  return {
    document_id: randomId("doc", 12),
    pages: 1,
    detected_language: "en",
    format: "markdown",
    markdown: `# ${merchant}\n\n| Item | Qty | Price |\n|---|---:|---:|\n${items.map((i) => `| ${i.description} | ${i.qty} | $${i.line_total.toFixed(2)} |`).join("\n")}\n\n**Subtotal:** $${subtotal.toFixed(2)}  \n**Tax:** $${tax.toFixed(2)}  \n**Total:** $${total.toFixed(2)}`,
    structured: {
      merchant,
      currency: "USD",
      line_items: items,
      subtotal,
      tax,
      total,
    },
    bounding_boxes: items.map((_, idx) => ({
      region: `line_${idx}`,
      page: 1,
      bbox: [72, 240 + idx * 24, 540, 260 + idx * 24],
      confidence: randFloat(0.94, 0.998, 3),
    })),
  };
}

function mirageImage(): unknown {
  const seed = randInt(100000, 999999999);
  const id = randomId("gen", 18);
  return {
    id,
    object: "image.generation",
    created: Math.floor(Date.now() / 1000),
    model: "mirage-v3",
    prompt: "An aerial photograph of a futuristic floating city at dusk",
    style: "photoreal",
    size: "1024x1024",
    seed,
    images: [
      {
        url: `https://cdn.mirage-image.ai/v1/${id}.png`,
        width: 1024,
        height: 1024,
        nsfw_score: randFloat(0.0, 0.02, 4),
        watermarked: false,
      },
    ],
    safety: { passed: true, categories: [] },
    timing_ms: randInt(2800, 4400),
    license: "royalty_free_commercial",
  };
}

function haloWeather(): unknown {
  const conditions = ["Clear", "Partly cloudy", "Overcast", "Light rain", "Thunderstorms", "Fog"];
  const days = 7;
  const today = new Date();
  const forecast: {
    date: string;
    condition: string;
    high_c: number;
    low_c: number;
    precip_mm: number;
    precip_probability: number;
    wind_kph: number;
    uv_index: number;
  }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const high = randFloat(14, 28, 1);
    forecast.push({
      date: d.toISOString().slice(0, 10),
      condition: pick(conditions),
      high_c: high,
      low_c: Math.round((high - randFloat(5, 11, 1)) * 10) / 10,
      precip_mm: randFloat(0, 14, 1),
      precip_probability: randFloat(0, 0.95, 2),
      wind_kph: randFloat(4, 32, 1),
      uv_index: randInt(1, 9),
    });
  }
  return {
    location: { lat: 40.7128, lon: -74.006, name: "New York, NY", timezone: "America/New_York" },
    current: {
      observed_at: new Date().toISOString(),
      condition: pick(conditions),
      temperature_c: randFloat(14, 26, 1),
      feels_like_c: randFloat(13, 27, 1),
      humidity: randFloat(0.32, 0.88, 2),
      wind_kph: randFloat(4, 28, 1),
      pressure_hpa: randInt(1004, 1024),
    },
    forecast,
    alerts: [],
    grid_resolution_km: 1,
  };
}

function tideSentiment(): unknown {
  const text = "The onboarding was magical but billing felt confusing.";
  const polarity = randFloat(-0.15, 0.45, 3);
  const label = polarity > 0.15 ? "positive" : polarity < -0.15 ? "negative" : "mixed";
  return {
    text,
    language: "en",
    overall: {
      polarity,
      label,
      confidence: randFloat(0.84, 0.97, 3),
    },
    sentences: [
      {
        text: "The onboarding was magical",
        polarity: randFloat(0.55, 0.92, 3),
        label: "positive",
        emotions: { joy: randFloat(0.6, 0.9, 2), trust: randFloat(0.4, 0.7, 2) },
      },
      {
        text: "but billing felt confusing.",
        polarity: randFloat(-0.65, -0.3, 3),
        label: "negative",
        emotions: { confusion: randFloat(0.55, 0.85, 2), frustration: randFloat(0.3, 0.6, 2) },
      },
    ],
    aspects: [
      { aspect: "onboarding", polarity: randFloat(0.6, 0.9, 3), label: "positive" },
      { aspect: "billing", polarity: randFloat(-0.7, -0.35, 3), label: "negative" },
    ],
    token_attribution: [
      { token: "magical", weight: randFloat(0.5, 0.85, 3) },
      { token: "confusing", weight: randFloat(-0.85, -0.5, 3) },
    ],
  };
}

function sentinelModeration(): unknown {
  const categories = [
    "harassment",
    "hate",
    "self_harm",
    "sexual",
    "violence",
    "spam",
    "pii",
    "malware",
  ];
  const scores: Record<string, number> = {};
  for (const c of categories) scores[c] = randFloat(0.0, 0.08, 4);
  // Bump one category slightly to look interesting
  const bumped = pick(categories);
  scores[bumped] = randFloat(0.12, 0.34, 4);
  const flagged = Object.entries(scores).filter(([, v]) => v > 0.5).map(([k]) => k);
  return {
    id: randomId("mod", 16),
    input_type: "text",
    policy: "default",
    flagged: flagged.length > 0,
    categories: scores,
    redaction_spans: [],
    decision: flagged.length > 0 ? "block" : "allow",
    review_required: false,
    model: "sentinel-v4",
    latency_ms: randInt(38, 96),
  };
}

export function generateSandboxResponse(providerId: string): unknown {
  switch (providerId) {
    case "pulse-llm":
      return pulseLlm();
    case "lumen-geocode":
      return lumenGeocode();
    case "verit-ocr":
      return veritOcr();
    case "mirage-image":
      return mirageImage();
    case "halo-weather":
      return haloWeather();
    case "tide-sentiment":
      return tideSentiment();
    case "sentinel-moderation":
      return sentinelModeration();
    default:
      return {
        message: "Sandbox response",
        providerId,
        timestamp: new Date().toISOString(),
      };
  }
}
