import { NextResponse } from "next/server";
import { PROVIDERS_SEED } from "@/lib/providers-seed";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ providers: PROVIDERS_SEED });
}
