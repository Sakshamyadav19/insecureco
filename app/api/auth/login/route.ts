import { NextRequest, NextResponse } from "next/server";

const DEMO_EMAIL = "demo@insureco.com";
const DEMO_PASSWORD = "Demo1234!";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("insureco_session", "authenticated", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}
