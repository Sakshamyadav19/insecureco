"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Claim = {
  id: string;
  confirmation_number: string;
  status: "under_review" | "approved" | "denied";
  submitted_at: string;
  policyholder_name: string;
  incident_date: string;
  vehicle_info: string;
  incident_type: string;
  damage_description: string;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  under_review: { bg: "#fef9c3", color: "#854d0e", label: "Under Review" },
  approved: { bg: "#f0fdf4", color: "#166534", label: "Approved" },
  denied: { bg: "#fef2f2", color: "#991b1b", label: "Denied" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) router.push("/login");
        else loadClaims();
      })
      .catch(() => router.push("/login"));
  }, [router]);

  function loadClaims() {
    fetch("/api/claims")
      .then((r) => r.json())
      .then((data) => {
        setClaims(data.claims ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function updateStatus(id: string, status: "approved" | "denied") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <p style={{ color: "#6b7280" }}>Loading claims...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Claims Dashboard</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            {claims.length} claim{claims.length !== 1 ? "s" : ""} on file
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <a
            href="/claims/new"
            style={{
              padding: "8px 16px",
              background: "#00b4d8",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + New Claim
          </a>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {claims.length === 0 ? (
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
        }}>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>No claims submitted yet.</p>
          <a
            href="/claims/new"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "8px 20px",
              background: "#00b4d8",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Submit a Claim
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {claims.map((claim) => {
            const style = STATUS_STYLES[claim.status] ?? STATUS_STYLES.under_review;
            const isUpdating = updating === claim.id;
            return (
              <div
                key={claim.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <a
                      href={`/claims/${claim.id}`}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111827",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {claim.confirmation_number}
                    </a>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "99px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: style.bg,
                      color: style.color,
                    }}>
                      {style.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#374151", marginBottom: "2px" }}>
                    {claim.policyholder_name} — {claim.vehicle_info}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {claim.incident_type.replace(/_/g, " ")} · {claim.incident_date} · Filed {new Date(claim.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                {claim.status === "under_review" && (
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(claim.id, "approved")}
                      style={{
                        padding: "7px 14px",
                        background: isUpdating ? "#d1d5db" : "#f0fdf4",
                        color: isUpdating ? "#9ca3af" : "#166534",
                        border: "1px solid",
                        borderColor: isUpdating ? "#d1d5db" : "#bbf7d0",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: isUpdating ? "not-allowed" : "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(claim.id, "denied")}
                      style={{
                        padding: "7px 14px",
                        background: isUpdating ? "#d1d5db" : "#fef2f2",
                        color: isUpdating ? "#9ca3af" : "#991b1b",
                        border: "1px solid",
                        borderColor: isUpdating ? "#d1d5db" : "#fecaca",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: isUpdating ? "not-allowed" : "pointer",
                      }}
                    >
                      Deny
                    </button>
                  </div>
                )}

                {claim.status !== "under_review" && (
                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      fontSize: "13px",
                      color: style.color,
                      fontWeight: 600,
                    }}>
                      {style.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
