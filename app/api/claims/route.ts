import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const DATA_DIR = join(process.cwd(), "data");
const CLAIMS_FILE = join(DATA_DIR, "claims.json");

function readClaims(): { claims: Record<string, unknown>[] } {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(CLAIMS_FILE)) {
    const init = { claims: [] };
    writeFileSync(CLAIMS_FILE, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(readFileSync(CLAIMS_FILE, "utf-8"));
}

function writeClaims(data: { claims: Record<string, unknown>[] }) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CLAIMS_FILE, JSON.stringify(data, null, 2));
}

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "CLM-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function GET() {
  const data = readClaims();
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

  const newClaim = {
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
  };

  const data = readClaims();
  data.claims.push(newClaim);
  writeClaims(data);

  return NextResponse.json(
    { id: newClaim.id, confirmation_number: newClaim.confirmation_number },
    { status: 201 }
  );
}
