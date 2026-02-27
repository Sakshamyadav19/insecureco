import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsureCo Claims Portal",
  description: "InsureCo — Your trusted insurance partner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 2rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px",
              height: "28px",
              background: "#00b4d8",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4V8C14 11.5 11.5 14.5 8 15C4.5 14.5 2 11.5 2 8V4L8 1Z" fill="white" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#111827", letterSpacing: "-0.02em" }}>
              InsureCo
            </span>
            <span style={{ fontSize: "13px", color: "#6b7280", marginLeft: "4px" }}>Claims Portal</span>
          </div>
          <nav style={{ display: "flex", gap: "1.5rem" }}>
            <a href="/dashboard" style={{ fontSize: "14px", color: "#374151", textDecoration: "none" }}>Dashboard</a>
            <a href="/claims/new" style={{ fontSize: "14px", color: "#374151", textDecoration: "none" }}>New Claim</a>
          </nav>
        </header>
        <main style={{ minHeight: "calc(100vh - 56px)", background: "#f9fafb" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
