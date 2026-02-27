import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const CLAIMS_FILE = join(DATA_DIR, "claims.json");

function readClaims(): { claims: Record<string, unknown>[] } {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(CLAIMS_FILE)) return { claims: [] };
  return JSON.parse(readFileSync(CLAIMS_FILE, "utf-8"));
}

function writeClaims(data: { claims: Record<string, unknown>[] }) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CLAIMS_FILE, JSON.stringify(data, null, 2));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = readClaims();
  const claim = data.claims.find((c) => (c as { id: string }).id === id);
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  return NextResponse.json(claim);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body;

  if (!["approved", "denied", "under_review"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const data = readClaims();
  const idx = data.claims.findIndex((c) => (c as { id: string }).id === id);
  if (idx === -1) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  data.claims[idx] = { ...data.claims[idx], status };
  writeClaims(data);

  return NextResponse.json(data.claims[idx]);
}
