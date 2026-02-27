"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

type Evidence = { url: string; label: string; added_at: string };

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
  evidence?: Evidence[];
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  under_review: { bg: "#fef9c3", color: "#854d0e", label: "Under Review" },
  approved: { bg: "#f0fdf4", color: "#166534", label: "Approved" },
  denied: { bg: "#fef2f2", color: "#991b1b", label: "Denied" },
};

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadClaim = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/claims/${id}`);
      if (res.ok) {
        setClaim(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  // Poll every 5s while under_review to catch auto-approve
  useEffect(() => {
    if (!claim || claim.status !== "under_review") return;
    const interval = setInterval(loadClaim, 5000);
    return () => clearInterval(interval);
  }, [claim, loadClaim]);

  async function updateStatus(status: "approved" | "denied") {
    if (!id) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setClaim(await res.json());
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  if (!claim) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <p style={{ color: "#dc2626" }}>Claim not found.</p>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[claim.status] ?? STATUS_STYLES.under_review;
  const evidence = claim.evidence ?? [];

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            Claim Detail
          </p>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
            {claim.confirmation_number}
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
            {claim.policyholder_name} · {claim.vehicle_info}
          </p>
        </div>
        <span style={{
          padding: "4px 12px",
          borderRadius: "99px",
          fontSize: "12px",
          fontWeight: 600,
          background: statusStyle.bg,
          color: statusStyle.color,
        }}>
          {statusStyle.label}
        </span>
      </div>

      {/* Details */}
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1rem",
      }}>
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>Incident Details</h2>
        {[
          ["Incident Date", claim.incident_date],
          ["Incident Type", claim.incident_type.replace(/_/g, " ")],
          ["Submitted", new Date(claim.submitted_at).toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827", textTransform: "capitalize" }}>{value}</span>
          </div>
        ))}
        {claim.damage_description && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Damage Description</p>
            <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5 }}>{claim.damage_description}</p>
          </div>
        )}
      </div>

      {/* Evidence Clips */}
      {evidence.length > 0 && (
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1rem",
        }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
            Evidence Clips ({evidence.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {evidence.map((ev, i) => (
              <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                <video
                  src={ev.url}
                  controls
                  style={{ width: "100%", display: "block", background: "#f9fafb", maxHeight: "180px" }}
                  preload="metadata"
                />
                <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    padding: "2px 8px",
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}>
                    {ev.label}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {new Date(ev.added_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {claim.status === "under_review" && (
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}>
          <p style={{ fontSize: "13px", color: "#6b7280", flex: 1 }}>
            Auto-approves 30 seconds after submission, or use manual controls:
          </p>
          <button
            disabled={updating}
            onClick={() => updateStatus("approved")}
            style={{
              padding: "8px 16px",
              background: updating ? "#d1d5db" : "#f0fdf4",
              color: updating ? "#9ca3af" : "#166534",
              border: "1px solid",
              borderColor: updating ? "#d1d5db" : "#bbf7d0",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: updating ? "not-allowed" : "pointer",
            }}
          >
            Approve
          </button>
          <button
            disabled={updating}
            onClick={() => updateStatus("denied")}
            style={{
              padding: "8px 16px",
              background: updating ? "#d1d5db" : "#fef2f2",
              color: updating ? "#9ca3af" : "#991b1b",
              border: "1px solid",
              borderColor: updating ? "#d1d5db" : "#fecaca",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: updating ? "not-allowed" : "pointer",
            }}
          >
            Deny
          </button>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "12px" }}>
        <a href="/dashboard" style={{ fontSize: "13px", color: "#00b4d8", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
