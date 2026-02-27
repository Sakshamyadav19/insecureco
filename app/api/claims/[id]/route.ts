import { NextRequest, NextResponse } from "next/server";
import { readClaims, writeClaims } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await readClaims();
  const idx = data.claims.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  const claim = { ...data.claims[idx] };

  // 30-second lazy auto-approve
  if (claim.status === "under_review") {
    const elapsed = Date.now() - new Date(claim.submitted_at).getTime();
    if (elapsed >= 30_000) {
      claim.status = "approved";
      data.claims[idx] = claim;
      await writeClaims(data);
    }
  }

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

  const data = await readClaims();
  const idx = data.claims.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  data.claims[idx] = { ...data.claims[idx], status };
  await writeClaims(data);

  return NextResponse.json(data.claims[idx]);
}
