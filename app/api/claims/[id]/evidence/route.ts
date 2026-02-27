import { NextRequest, NextResponse } from "next/server";
import { readClaims, writeClaims } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await readClaims();
  const claim = data.claims.find((c) => c.id === id);
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  return NextResponse.json(claim.evidence ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const data = await readClaims();
  const idx = data.claims.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  const evidenceItem = {
    url: body.url as string,
    label: (body.label as string) ?? "EVIDENCE",
    added_at: new Date().toISOString(),
  };

  if (!data.claims[idx].evidence) {
    data.claims[idx].evidence = [];
  }
  data.claims[idx].evidence.push(evidenceItem);
  await writeClaims(data);

  return NextResponse.json(data.claims[idx], { status: 201 });
}
