import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { generateSandboxResponse } from "@/lib/sandbox-responses";
import type { SandboxResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SandboxRequestBody = {
  accessToken?: unknown;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await context.params;
  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }

  let body: SandboxRequestBody;
  try {
    body = (await req.json()) as SandboxRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const accessToken =
    typeof body.accessToken === "string" ? body.accessToken.trim() : "";
  if (!accessToken) {
    return NextResponse.json(
      { error: "accessToken is required" },
      { status: 401 },
    );
  }

  const start = Date.now();

  let supabase;
  try {
    supabase = getServerSupabase();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[sandbox] supabase unavailable:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Look up the token. RLS on access_tokens has a public-read policy,
  // and we're using the service-role key here anyway.
  const { data: tokenRow, error: lookupErr } = await supabase
    .from("access_tokens")
    .select("token, provider_id, calls_remaining")
    .eq("token", accessToken)
    .maybeSingle();

  if (lookupErr) {
    // eslint-disable-next-line no-console
    console.error("[sandbox] token lookup failed:", lookupErr);
    return NextResponse.json(
      { error: "Failed to verify access token" },
      { status: 500 },
    );
  }

  if (!tokenRow) {
    return NextResponse.json(
      { error: "Invalid access token" },
      { status: 401 },
    );
  }
  if (tokenRow.provider_id !== providerId) {
    return NextResponse.json(
      { error: "Access token is not valid for this provider" },
      { status: 403 },
    );
  }
  if (typeof tokenRow.calls_remaining !== "number" || tokenRow.calls_remaining <= 0) {
    return NextResponse.json(
      { error: "No calls remaining on this access token" },
      { status: 402 },
    );
  }

  // Atomically decrement: only succeeds if calls_remaining is still > 0
  // and matches what we just read (best-effort optimistic lock).
  const newRemaining = tokenRow.calls_remaining - 1;
  const { data: updated, error: updateErr } = await supabase
    .from("access_tokens")
    .update({ calls_remaining: newRemaining })
    .eq("token", accessToken)
    .eq("calls_remaining", tokenRow.calls_remaining)
    .gt("calls_remaining", 0)
    .select("calls_remaining")
    .maybeSingle();

  if (updateErr || !updated) {
    // eslint-disable-next-line no-console
    console.error("[sandbox] decrement failed:", updateErr);
    return NextResponse.json(
      { error: "Failed to consume access token call" },
      { status: 409 },
    );
  }

  // Add a small artificial latency so the call feels real.
  await new Promise((r) => setTimeout(r, 80 + Math.random() * 220));

  const data = generateSandboxResponse(providerId);
  const latencyMs = Date.now() - start;

  const payload: SandboxResponse = {
    providerId,
    status: 200,
    latencyMs,
    data,
    callsRemaining: updated.calls_remaining,
  };
  return NextResponse.json(payload);
}
