import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readClaims, writeClaims, type Claim } from "@/lib/storage";

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "CLM-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function GET() {
  const data = await readClaims();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    policyholder_name,
    policyholder_email,
    policyholder_phone,
    incident_date,
    vehicle_info,
    incident_type,
    damage_description,
    vin_visible,
    plate_visible,
    airbag_deployed,
    warning_lights,
    drivability,
  } = body;

  if (!policyholder_name || !policyholder_email || !incident_date || !vehicle_info || !damage_description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newClaim: Claim = {
    id: randomUUID(),
    confirmation_number: generateConfirmationNumber(),
    status: "under_review",
    submitted_at: new Date().toISOString(),
    policyholder_name: policyholder_name ?? "",
    policyholder_email: policyholder_email ?? "",
    policyholder_phone: policyholder_phone ?? "",
    incident_date: incident_date ?? "",
    vehicle_info: vehicle_info ?? "",
    incident_type: incident_type ?? "other",
    damage_description: damage_description ?? "",
    vin_visible: !!vin_visible,
    plate_visible: !!plate_visible,
    airbag_deployed: !!airbag_deployed,
    warning_lights: !!warning_lights,
    drivability: drivability ?? "unknown",
    evidence: [],
  };

  const data = await readClaims();
  data.claims.push(newClaim);
  await writeClaims(data);

  return NextResponse.json(
    { id: newClaim.id, confirmation_number: newClaim.confirmation_number },
    { status: 201 }
  );
}
