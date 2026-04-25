"use client";

import type { SandboxResponse } from "@/lib/types";

type Props = {
  response: SandboxResponse;
};

// Outer frame shared by all visualizations.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-surface/40 p-4 text-arc-text">
      <div className="flex flex-col gap-3 break-words">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-wider text-arc-muted">
      {children}
    </div>
  );
}

// ---------- pulse-llm ----------
type PulseData = {
  model?: string;
  choices?: Array<{ message?: { content?: string; role?: string } }>;
  usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
};

function PulseLlmView({ data }: { data: PulseData }) {
  const reply = data?.choices?.[0]?.message?.content ?? "(no reply)";
  const userPrompt = "Summarize Arc in one line.";
  const totalTokens = data?.usage?.total_tokens ?? 0;
  const model = data?.model ?? "pulse";
  return (
    <Frame>
      <SectionLabel>Pulse LLM · chat</SectionLabel>
      <div className="flex flex-col gap-2">
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-arc-border bg-arc-surface px-3 py-2 text-sm text-arc-text break-words">
            {userPrompt}
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-arc-glow/40 bg-arc-glow/20 px-3 py-2 text-sm text-arc-text break-words">
            {reply}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-arc-muted">
        <span className="font-mono">{model}</span>
        <span>{totalTokens} tokens</span>
      </div>
    </Frame>
  );
}

// ---------- lumen-geocode ----------
type LumenData = {
  results?: Array<{
    formatted_address?: string;
    lat?: number;
    lng?: number;
    confidence?: number;
    place_type?: string;
    components?: {
      street?: string;
      locality?: string;
      admin_area?: string;
      postal_code?: string;
      country?: string;
    };
  }>;
};

function LumenGeocodeView({ data }: { data: LumenData }) {
  const r = data?.results?.[0];
  const lat = typeof r?.lat === "number" ? r.lat.toFixed(5) : "—";
  const lng = typeof r?.lng === "number" ? r.lng.toFixed(5) : "—";
  const confidence = typeof r?.confidence === "number" ? r.confidence : 0;
  const confPct = Math.round(confidence * 100);
  const c = r?.components ?? {};
  return (
    <Frame>
      <SectionLabel>Lumen Geocode · result</SectionLabel>
      <div className="text-base font-medium leading-snug break-words">
        {r?.formatted_address ?? "Unknown address"}
      </div>

      {/* Stylized map */}
      <div
        className="relative h-24 w-full overflow-hidden rounded-md border border-arc-border"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #12141B 0%, #1F2536 50%, #0A0B0F 100%)",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
        >
          <path d="M0 60 Q40 40 80 55 T160 50 T200 60" stroke="#00E0B0" strokeWidth="0.6" fill="none" />
          <path d="M0 75 Q50 65 110 70 T200 72" stroke="#7C5CFF" strokeWidth="0.5" fill="none" />
          <path d="M30 0 L30 100" stroke="#1F222C" strokeWidth="0.4" />
          <path d="M120 0 L120 100" stroke="#1F222C" strokeWidth="0.4" />
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-arc-accent shadow-[0_0_12px_rgba(0,224,176,0.8)]" />
            <div className="absolute -top-1 -left-1 h-5 w-5 animate-ping rounded-full bg-arc-accent/40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-arc-border bg-arc-surface/60 p-2">
          <div className="text-[10px] uppercase tracking-wider text-arc-muted">LAT</div>
          <div className="font-mono text-sm">{lat}</div>
        </div>
        <div className="rounded-md border border-arc-border bg-arc-surface/60 p-2">
          <div className="text-[10px] uppercase tracking-wider text-arc-muted">LNG</div>
          <div className="font-mono text-sm">{lng}</div>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-arc-muted">
          <span>Match confidence</span>
          <span className="text-arc-text">{confPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-arc-surface">
          <div
            className="h-full rounded-full bg-arc-accent transition-all"
            style={{ width: `${confPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {[
          ["Street", c.street],
          ["Locality", c.locality],
          ["Admin", c.admin_area],
          ["Postal", c.postal_code],
          ["Country", c.country],
          ["Type", r?.place_type],
        ].map(([label, value]) => (
          <div key={String(label)} className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-arc-muted">
              {label}
            </span>
            <span className="break-words text-arc-text">{value ?? "—"}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ---------- verit-ocr ----------
type VeritData = {
  document_id?: string;
  pages?: number;
  detected_language?: string;
  structured?: {
    merchant?: string;
    currency?: string;
    line_items?: Array<{ description?: string; qty?: number; line_total?: number }>;
    subtotal?: number;
    tax?: number;
    total?: number;
  };
  bounding_boxes?: unknown[];
};

function VeritOcrView({ data }: { data: VeritData }) {
  const s = data?.structured;
  const items = s?.line_items ?? [];
  const blocks = data?.bounding_boxes?.length ?? 0;
  const fmt = (n: number | undefined) =>
    typeof n === "number" ? `$${n.toFixed(2)}` : "—";

  return (
    <Frame>
      <SectionLabel>Verit OCR · structured doc</SectionLabel>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md border border-arc-border bg-arc-surface px-2 py-0.5 font-mono text-arc-muted break-all">
          {data?.document_id ?? "doc"}
        </span>
        <span className="rounded-md border border-arc-border bg-arc-surface px-2 py-0.5 uppercase text-arc-muted">
          {data?.detected_language ?? "—"}
        </span>
        <span className="rounded-md border border-arc-border bg-arc-surface px-2 py-0.5 text-arc-muted">
          {data?.pages ?? 1} pg
        </span>
        <span className="ml-auto text-arc-muted">
          {blocks} block{blocks === 1 ? "" : "s"} detected
        </span>
      </div>

      <div className="rounded-md border border-arc-border bg-arc-surface/70 p-3">
        <div className="mb-2 text-base font-semibold break-words">
          {s?.merchant ?? "Merchant"}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-arc-border text-arc-muted">
                <th className="py-1 text-left font-normal">Item</th>
                <th className="py-1 text-right font-normal">Qty</th>
                <th className="py-1 text-right font-normal">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-arc-border/50 last:border-0">
                  <td className="py-1 pr-2 break-words">{it?.description ?? "—"}</td>
                  <td className="py-1 text-right tabular-nums">{it?.qty ?? 1}</td>
                  <td className="py-1 text-right tabular-nums">{fmt(it?.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex flex-col gap-0.5 border-t border-arc-border pt-2 text-xs">
          <div className="flex justify-between text-arc-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{fmt(s?.subtotal)}</span>
          </div>
          <div className="flex justify-between text-arc-muted">
            <span>Tax</span>
            <span className="tabular-nums">{fmt(s?.tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-arc-accent">
            <span>Total</span>
            <span className="tabular-nums">{fmt(s?.total)}</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ---------- mirage-image ----------
type MirageData = {
  prompt?: string;
  model?: string;
  size?: string;
  seed?: number;
  images?: Array<{ width?: number; height?: number; watermarked?: boolean }>;
  safety?: { passed?: boolean };
  license?: string;
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function MirageImageView({ data }: { data: MirageData }) {
  const seed = data?.seed ?? 0;
  const prompt = data?.prompt ?? "";
  const size = data?.size ?? "1024x1024";
  const safetyPassed = data?.safety?.passed !== false;
  const h = hashSeed(`${seed}-${prompt}`);
  const hue1 = h % 360;
  const hue2 = (hue1 + 70 + ((h >> 8) % 100)) % 360;
  const hue3 = (hue1 + 160 + ((h >> 16) % 80)) % 360;

  return (
    <Frame>
      <SectionLabel>Mirage Image · generation</SectionLabel>
      <div
        className="relative w-full overflow-hidden rounded-md border border-arc-border"
        style={{
          aspectRatio: "1 / 1",
          background: `radial-gradient(circle at 30% 30%, hsl(${hue1} 70% 55%) 0%, hsl(${hue2} 65% 40%) 45%, hsl(${hue3} 60% 18%) 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded bg-black/40 px-2 py-1 font-mono text-[10px] text-white/90 backdrop-blur-sm">
          <span>{size}</span>
          <span>seed {seed}</span>
        </div>
      </div>
      <p className="break-words text-sm italic text-arc-text">&ldquo;{prompt}&rdquo;</p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md border border-arc-glow/40 bg-arc-glow/15 px-2 py-0.5 font-mono text-arc-text">
          {data?.model ?? "mirage"}
        </span>
        {safetyPassed ? (
          <span className="rounded-md border border-arc-accent/40 bg-arc-accent/15 px-2 py-0.5 text-arc-accent">
            Safety passed
          </span>
        ) : (
          <span className="rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-rose-300">
            Safety review
          </span>
        )}
        <span className="text-arc-muted break-words">{data?.license ?? "—"}</span>
      </div>
    </Frame>
  );
}

// ---------- halo-weather ----------
type HaloData = {
  location?: { name?: string };
  current?: { condition?: string; temperature_c?: number; feels_like_c?: number };
  forecast?: Array<{
    date?: string;
    condition?: string;
    high_c?: number;
    low_c?: number;
  }>;
};

function dayAbbrev(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function HaloWeatherView({ data }: { data: HaloData }) {
  const cur = data?.current;
  const temp = typeof cur?.temperature_c === "number" ? Math.round(cur.temperature_c) : "—";
  const feels =
    typeof cur?.feels_like_c === "number" ? Math.round(cur.feels_like_c) : null;
  const forecast = data?.forecast ?? [];
  return (
    <Frame>
      <SectionLabel>Halo Weather · forecast</SectionLabel>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-light leading-none">{temp}</span>
            <span className="text-lg text-arc-muted">°C</span>
          </div>
          <div className="mt-1 text-sm text-arc-text break-words">
            {cur?.condition ?? "—"}
          </div>
          <div className="text-xs text-arc-muted break-words">
            {data?.location?.name ?? "—"}
          </div>
        </div>
        {feels !== null ? (
          <div className="text-right text-xs text-arc-muted">
            Feels {feels}°
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {forecast.slice(0, 7).map((d, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-md border border-arc-border bg-arc-surface/60 p-1.5 text-center"
          >
            <div className="text-[10px] uppercase tracking-wider text-arc-muted">
              {dayAbbrev(d?.date)}
            </div>
            <div className="text-[9px] leading-tight text-arc-text break-words">
              {(d?.condition ?? "").slice(0, 8)}
            </div>
            <div className="text-[10px] tabular-nums text-arc-text">
              {typeof d?.high_c === "number" ? Math.round(d.high_c) : "—"}°
            </div>
            <div className="text-[10px] tabular-nums text-arc-muted">
              {typeof d?.low_c === "number" ? Math.round(d.low_c) : "—"}°
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ---------- tide-sentiment ----------
type TideData = {
  text?: string;
  overall?: { polarity?: number; label?: string; confidence?: number };
  aspects?: Array<{ aspect?: string; polarity?: number; label?: string }>;
};

function polarityColor(p: number): string {
  if (p > 0.15) return "text-arc-accent";
  if (p < -0.15) return "text-rose-400";
  return "text-arc-muted";
}

function TideSentimentView({ data }: { data: TideData }) {
  const polarity = typeof data?.overall?.polarity === "number" ? data.overall.polarity : 0;
  const label = data?.overall?.label ?? "neutral";
  const confidence = typeof data?.overall?.confidence === "number" ? data.overall.confidence : 0;
  const confPct = Math.round(confidence * 100);
  // Map polarity from [-1, 1] to [0, 100]
  const markerPct = Math.max(0, Math.min(100, ((polarity + 1) / 2) * 100));
  const labelClass =
    label === "positive"
      ? "text-arc-accent"
      : label === "negative"
      ? "text-rose-400"
      : "text-arc-muted";

  return (
    <Frame>
      <SectionLabel>Tide Sentiment · analysis</SectionLabel>
      <p className="break-words text-sm italic text-arc-text">
        &ldquo;{data?.text ?? "—"}&rdquo;
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className={`text-xl font-semibold capitalize ${labelClass}`}>{label}</div>
        <div className="font-mono text-xs text-arc-muted">
          polarity {polarity >= 0 ? "+" : ""}
          {polarity.toFixed(2)}
        </div>
      </div>
      <div className="relative">
        <div
          className="h-2 w-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #f43f5e 0%, #8b90a0 50%, #00E0B0 100%)",
          }}
        />
        <div
          className="absolute -top-0.5 h-3 w-1 -translate-x-1/2 rounded-sm bg-white shadow"
          style={{ left: `${markerPct}%` }}
          aria-hidden
        />
        <div className="mt-1 flex justify-between text-[10px] text-arc-muted">
          <span>−1</span>
          <span>0</span>
          <span>+1</span>
        </div>
      </div>

      {(data?.aspects?.length ?? 0) > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {data?.aspects?.map((a, i) => {
            const ap = typeof a?.polarity === "number" ? a.polarity : 0;
            const cls = polarityColor(ap);
            const border =
              ap > 0.15
                ? "border-arc-accent/40 bg-arc-accent/10"
                : ap < -0.15
                ? "border-rose-400/40 bg-rose-400/10"
                : "border-arc-border bg-arc-surface";
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${border}`}
              >
                <span className="text-arc-text break-words">{a?.aspect ?? "—"}</span>
                <span className={`font-mono ${cls}`}>
                  {ap >= 0 ? "+" : ""}
                  {ap.toFixed(2)}
                </span>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="text-xs text-arc-muted">Confidence {confPct}%</div>
    </Frame>
  );
}

// ---------- sentinel-moderation ----------
type SentinelData = {
  flagged?: boolean;
  decision?: string;
  model?: string;
  latency_ms?: number;
  categories?: Record<string, number>;
  input_type?: string;
};

function categoryColor(score: number): string {
  if (score < 0.2) return "bg-arc-accent";
  if (score < 0.5) return "bg-amber-400";
  return "bg-rose-500";
}

function SentinelModerationView({ data }: { data: SentinelData }) {
  const flagged = Boolean(data?.flagged);
  const verdict = flagged ? "BLOCKED" : "ALLOWED";
  const verdictClass = flagged ? "text-rose-400" : "text-arc-accent";
  const cats = data?.categories ?? {};
  const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const sampleInput = "Hey, how do I integrate the Arc payments SDK?";
  return (
    <Frame>
      <SectionLabel>Sentinel Moderation · verdict</SectionLabel>
      <div className="flex items-center justify-between gap-3">
        <div className={`text-2xl font-bold tracking-wide ${verdictClass}`}>
          {verdict}
        </div>
        <div className="text-xs uppercase tracking-wider text-arc-muted">
          {data?.input_type ?? "text"}
        </div>
      </div>
      <blockquote className="break-words border-l-2 border-arc-border pl-3 text-xs italic text-arc-muted">
        {sampleInput}
      </blockquote>
      <div className="flex flex-col gap-1.5">
        {entries.map(([cat, score]) => {
          const pct = Math.max(2, Math.min(100, score * 100));
          return (
            <div key={cat} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 truncate text-arc-muted capitalize">
                {cat.replace(/_/g, " ")}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-arc-surface">
                <div
                  className={`h-full rounded-full ${categoryColor(score)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono tabular-nums text-arc-muted">
                {score.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-arc-muted">
        <span className="font-mono break-words">{data?.model ?? "sentinel"}</span>
        <span className="uppercase">
          decision: {data?.decision ?? (flagged ? "block" : "allow")}
        </span>
        <span>{data?.latency_ms ?? "—"}ms</span>
      </div>
    </Frame>
  );
}

// ---------- fallback ----------
function FallbackView({ data }: { data: unknown }) {
  return (
    <Frame>
      <SectionLabel>Sandbox response</SectionLabel>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-arc-border bg-arc-surface/60 p-3 font-mono text-xs text-arc-text">
        {JSON.stringify(data, null, 2)}
      </pre>
    </Frame>
  );
}

// ---------- main switch ----------
export function SandboxResponseView({ response }: Props) {
  const { providerId, data } = response;
  const safe = (data ?? {}) as Record<string, unknown>;

  let body: React.ReactNode;
  switch (providerId) {
    case "pulse-llm":
      body = <PulseLlmView data={safe as PulseData} />;
      break;
    case "lumen-geocode":
      body = <LumenGeocodeView data={safe as LumenData} />;
      break;
    case "verit-ocr":
      body = <VeritOcrView data={safe as VeritData} />;
      break;
    case "mirage-image":
      body = <MirageImageView data={safe as MirageData} />;
      break;
    case "halo-weather":
      body = <HaloWeatherView data={safe as HaloData} />;
      break;
    case "tide-sentiment":
      body = <TideSentimentView data={safe as TideData} />;
      break;
    case "sentinel-moderation":
      body = <SentinelModerationView data={safe as SentinelData} />;
      break;
    default:
      body = <FallbackView data={data} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-[28rem] overflow-y-auto overflow-x-hidden">
        {body}
      </div>
      <details className="group rounded-md border border-arc-border bg-arc-surface/30 px-3 py-2 text-xs">
        <summary className="cursor-pointer select-none text-arc-muted hover:text-arc-text">
          Show raw response
        </summary>
        <pre className="mt-2 max-h-72 overflow-x-auto overflow-y-auto whitespace-pre rounded bg-arc-bg/60 p-2 text-[11px] leading-relaxed text-arc-text">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default SandboxResponseView;
