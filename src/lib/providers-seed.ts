import type { Provider } from "./types";

export const PROVIDERS_SEED: Provider[] = [
  {
    id: "pulse-llm",
    name: "Pulse LLM",
    category: "LLM inference",
    shortDescription:
      "Low-latency 70B inference with streaming, tool use, and JSON mode.",
    longDescription:
      "Pulse LLM serves a fine-tuned 70B foundation model optimized for production agents. Median time-to-first-token is under 180ms across US and EU regions. Includes streaming, tool calling, and strict JSON output modes — pay only for completed tokens.",
    basePricePerCallUsdc: 0.012,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.012 },
      { units: 100, pricePerUnitUsdc: 0.0098 },
      { units: 1000, pricePerUnitUsdc: 0.0072 },
      { units: 10000, pricePerUnitUsdc: 0.0048 },
    ],
    sampleEndpoint: "https://api.pulse-llm.dev/v1/chat/completions",
    sampleRequestSnippet: `curl https://api.pulse-llm.dev/v1/chat/completions \\
  -H "Authorization: Bearer $ARC_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "pulse-70b",
    "messages": [{ "role": "user", "content": "Summarize Arc in one line." }],
    "stream": true
  }'`,
    bulkBuyersThisMonth: 1247,
  },
  {
    id: "lumen-geocode",
    name: "Lumen Geocode",
    category: "Geocoding",
    shortDescription:
      "Forward + reverse geocoding with sub-meter accuracy in 180 countries.",
    longDescription:
      "Lumen Geocode resolves addresses to coordinates and back, with structured component output (street, locality, admin area, postal code). Built on a continuously updated open dataset plus proprietary mobility signals, with confidence scores attached to every match.",
    basePricePerCallUsdc: 0.002,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.002 },
      { units: 100, pricePerUnitUsdc: 0.0016 },
      { units: 1000, pricePerUnitUsdc: 0.0011 },
      { units: 10000, pricePerUnitUsdc: 0.0007 },
    ],
    sampleEndpoint: "https://api.lumen-geocode.io/v1/forward",
    sampleRequestSnippet: `const res = await fetch("https://api.lumen-geocode.io/v1/forward?q=" +
  encodeURIComponent("1455 Market St, San Francisco"), {
  headers: { Authorization: \`Bearer \${process.env.ARC_ACCESS_TOKEN}\` }
});
const { results } = await res.json();
console.log(results[0].lat, results[0].lng);`,
    bulkBuyersThisMonth: 612,
  },
  {
    id: "verit-ocr",
    name: "Verit OCR",
    category: "OCR",
    shortDescription:
      "Document OCR with layout preservation, tables, and handwritten text.",
    longDescription:
      "Verit OCR turns PDFs and images into structured Markdown or JSON with bounding boxes for every region. Strong on receipts, invoices, and scanned multi-column documents. Outputs include line-level confidence and detected language.",
    basePricePerCallUsdc: 0.018,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.018 },
      { units: 100, pricePerUnitUsdc: 0.0145 },
      { units: 1000, pricePerUnitUsdc: 0.0102 },
      { units: 10000, pricePerUnitUsdc: 0.0064 },
    ],
    sampleEndpoint: "https://api.verit-ocr.com/v1/extract",
    sampleRequestSnippet: `curl https://api.verit-ocr.com/v1/extract \\
  -H "Authorization: Bearer $ARC_ACCESS_TOKEN" \\
  -F "file=@invoice.pdf" \\
  -F "format=markdown"`,
    bulkBuyersThisMonth: 89,
  },
  {
    id: "mirage-image",
    name: "Mirage Image",
    category: "Image generation",
    shortDescription:
      "Photo-real text-to-image with style controls and 4K upscaling.",
    longDescription:
      "Mirage Image produces 1024x1024 photo-real and stylized images from text prompts in under 4 seconds. Supports negative prompts, seed pinning, ControlNet conditioning, and a built-in 4K upscaler. Royalty-free commercial license for every generated asset.",
    basePricePerCallUsdc: 0.045,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.045 },
      { units: 100, pricePerUnitUsdc: 0.038 },
      { units: 1000, pricePerUnitUsdc: 0.029 },
      { units: 10000, pricePerUnitUsdc: 0.019 },
    ],
    sampleEndpoint: "https://api.mirage-image.ai/v1/generations",
    sampleRequestSnippet: `curl https://api.mirage-image.ai/v1/generations \\
  -H "Authorization: Bearer $ARC_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "An aerial photograph of a futuristic floating city at dusk",
    "size": "1024x1024",
    "style": "photoreal"
  }'`,
    bulkBuyersThisMonth: 423,
  },
  {
    id: "halo-weather",
    name: "Halo Weather",
    category: "Weather",
    shortDescription:
      "Hyperlocal forecasts and historical weather down to 1km grids.",
    longDescription:
      "Halo Weather delivers current conditions, 14-day forecasts, and historical reanalysis at 1km resolution. Includes severe-weather alerts, lightning density, and ensemble probability bands. Tuned for logistics, agriculture, and outdoor planning.",
    basePricePerCallUsdc: 0.0009,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.0009 },
      { units: 100, pricePerUnitUsdc: 0.00072 },
      { units: 1000, pricePerUnitUsdc: 0.00051 },
      { units: 10000, pricePerUnitUsdc: 0.00029 },
    ],
    sampleEndpoint: "https://api.halo-weather.net/v1/forecast",
    sampleRequestSnippet: `const res = await fetch(
  "https://api.halo-weather.net/v1/forecast?lat=40.7128&lon=-74.0060&days=7",
  { headers: { Authorization: \`Bearer \${process.env.ARC_ACCESS_TOKEN}\` } }
);
const forecast = await res.json();`,
    bulkBuyersThisMonth: 23,
  },
  {
    id: "tide-sentiment",
    name: "Tide Sentiment",
    category: "Sentiment analysis",
    shortDescription:
      "Multilingual sentiment, emotion, and aspect-based scoring.",
    longDescription:
      "Tide Sentiment analyzes text across 28 languages with sentence-level polarity, six-class emotion detection, and aspect extraction. Trained on a curated corpus of social, support, and review data. Outputs include token-level attribution for explainability.",
    basePricePerCallUsdc: 0.0011,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.0011 },
      { units: 100, pricePerUnitUsdc: 0.00089 },
      { units: 1000, pricePerUnitUsdc: 0.00064 },
      { units: 10000, pricePerUnitUsdc: 0.00038 },
    ],
    sampleEndpoint: "https://api.tide-sentiment.io/v1/analyze",
    sampleRequestSnippet: `curl https://api.tide-sentiment.io/v1/analyze \\
  -H "Authorization: Bearer $ARC_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "text": "The onboarding was magical but billing felt confusing." }'`,
    bulkBuyersThisMonth: 185,
  },
  {
    id: "sentinel-moderation",
    name: "Sentinel Moderation",
    category: "Content moderation",
    shortDescription:
      "Real-time text and image moderation with policy-tunable thresholds.",
    longDescription:
      "Sentinel Moderation classifies text and images across 14 harm categories with calibrated confidence scores. Supports custom policy profiles, allow/deny lists, and child-safety reviewers in the loop for high-risk content. Returns redaction-ready spans for text inputs.",
    basePricePerCallUsdc: 0.003,
    bulkTiers: [
      { units: 1, pricePerUnitUsdc: 0.003 },
      { units: 100, pricePerUnitUsdc: 0.0024 },
      { units: 1000, pricePerUnitUsdc: 0.0017 },
      { units: 10000, pricePerUnitUsdc: 0.00098 },
    ],
    sampleEndpoint: "https://api.sentinel-mod.dev/v1/classify",
    sampleRequestSnippet: `curl https://api.sentinel-mod.dev/v1/classify \\
  -H "Authorization: Bearer $ARC_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input_type": "text",
    "input": "User-generated comment goes here",
    "policy": "default"
  }'`,
    bulkBuyersThisMonth: 941,
  },
];
