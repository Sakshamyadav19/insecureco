"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Claim = {
  id: string;
  confirmation_number: string;
  status: string;
  submitted_at: string;
  policyholder_name: string;
  incident_date: string;
  vehicle_info: string;
  incident_type: string;
};

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/claims/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setClaim(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
      {/* Success icon */}
      <div style={{
        width: "64px",
        height: "64px",
        background: "#f0fdf4",
        border: "2px solid #bbf7d0",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.5rem",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
        Claim Submitted Successfully
      </h1>
      <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "2rem" }}>
        Your claim has been received and is now under review.
      </p>

      {/* Confirmation number — prominently displayed for Yutori to read */}
      <div style={{
        background: "#fff",
        border: "2px solid #00b4d8",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Confirmation Number
        </p>
        <p id="confirmation-number" style={{
          fontSize: "28px",
          fontWeight: 800,
          fontFamily: "monospace",
          color: "#111827",
          letterSpacing: "0.05em",
        }}>
          {claim.confirmation_number}
        </p>
      </div>

      {/* Claim details */}
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        textAlign: "left",
        marginBottom: "2rem",
      }}>
        {[
          ["Policyholder", claim.policyholder_name],
          ["Vehicle", claim.vehicle_info],
          ["Incident Date", claim.incident_date],
          ["Incident Type", claim.incident_type.replace(/_/g, " ")],
          ["Submitted", new Date(claim.submitted_at).toLocaleString()],
          ["Status", "Under Review"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827", textTransform: "capitalize" }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <a
          href="/dashboard"
          style={{
            padding: "10px 20px",
            background: "#00b4d8",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View Dashboard
        </a>
        <a
          href="/claims/new"
          style={{
            padding: "10px 20px",
            background: "#fff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          File Another Claim
        </a>
      </div>
    </div>
  );
}
