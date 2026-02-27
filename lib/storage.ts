/**
 * Storage abstraction: Vercel KV in production, local filesystem in dev.
 * Falls back to FS when KV_REST_API_URL is not set.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = process.env.VERCEL
  ? "/tmp/insurance-portal-data"
  : join(process.cwd(), "data");
const CLAIMS_FILE = join(DATA_DIR, "claims.json");

export type Claim = {
  id: string;
  confirmation_number: string;
  status: "under_review" | "approved" | "denied";
  submitted_at: string;
  policyholder_name: string;
  policyholder_email: string;
  policyholder_phone: string;
  incident_date: string;
  vehicle_info: string;
  incident_type: string;
  damage_description: string;
  vin_visible: boolean;
  plate_visible: boolean;
  airbag_deployed: boolean;
  warning_lights: boolean;
  drivability: string;
  evidence: Array<{ url: string; label: string; added_at: string }>;
};

type ClaimsStore = { claims: Claim[] };

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ---- Filesystem helpers (local dev) ----

function fsRead(): ClaimsStore {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(CLAIMS_FILE)) {
      const init: ClaimsStore = { claims: [] };
      writeFileSync(CLAIMS_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(readFileSync(CLAIMS_FILE, "utf-8"));
  } catch {
    return { claims: [] };
  }
}

function fsWrite(data: ClaimsStore): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CLAIMS_FILE, JSON.stringify(data, null, 2));
}

// ---- KV helpers (Upstash REST API — no npm package needed) ----

async function kvRead(): Promise<ClaimsStore> {
  const url = process.env.KV_REST_API_URL!;
  const token = process.env.KV_REST_API_TOKEN!;
  try {
    const resp = await fetch(`${url}/get/claims`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!resp.ok) return { claims: [] };
    const json = await resp.json();
    if (!json.result) return { claims: [] };
    return JSON.parse(json.result) as ClaimsStore;
  } catch {
    return { claims: [] };
  }
}

async function kvWrite(data: ClaimsStore): Promise<void> {
  const url = process.env.KV_REST_API_URL!;
  const token = process.env.KV_REST_API_TOKEN!;
  await fetch(`${url}/set/claims`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  });
}

// ---- Public API ----

export async function readClaims(): Promise<ClaimsStore> {
  if (useKV()) return kvRead();
  return fsRead();
}

export async function writeClaims(data: ClaimsStore): Promise<void> {
  if (useKV()) return kvWrite(data);
  fsWrite(data);
}
