"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#111827",
  background: "#fff",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500 as const,
  color: "#374151",
  marginBottom: "6px",
};

export default function NewClaimPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    policyholder_name: "",
    policyholder_email: "",
    policyholder_phone: "",
    incident_date: "",
    vehicle_info: "",
    incident_type: "rear_end",
    damage_description: "",
    vin_visible: false,
    plate_visible: false,
    airbag_deployed: false,
    warning_lights: false,
    drivability: "yes",
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => { if (!data.authenticated) router.push("/login"); })
      .catch(() => router.push("/login"));
  }, [router]);

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/claims/${data.id}/confirmation`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit claim");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>File a New Claim</h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
          Provide the details of your vehicle incident to begin the claims process.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Policyholder Info */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1rem",
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
            Policyholder Information
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="policyholder-name" style={labelStyle}>Full Name</label>
              <input
                id="policyholder-name"
                type="text"
                value={form.policyholder_name}
                onChange={(e) => set("policyholder_name", e.target.value)}
                required
                placeholder="Demo User"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="policyholder-email" style={labelStyle}>Email</label>
              <input
                id="policyholder-email"
                type="email"
                value={form.policyholder_email}
                onChange={(e) => set("policyholder_email", e.target.value)}
                required
                placeholder="claims@swiftsettle.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="policyholder-phone" style={labelStyle}>Phone</label>
              <input
                id="policyholder-phone"
                type="tel"
                value={form.policyholder_phone}
                onChange={(e) => set("policyholder_phone", e.target.value)}
                placeholder="555-0100"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1rem",
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
            Incident Details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label htmlFor="incident-date" style={labelStyle}>Incident Date</label>
              <input
                id="incident-date"
                type="date"
                value={form.incident_date}
                onChange={(e) => set("incident_date", e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="vehicle-info" style={labelStyle}>Vehicle (Year/Make/Model)</label>
              <input
                id="vehicle-info"
                type="text"
                value={form.vehicle_info}
                onChange={(e) => set("vehicle_info", e.target.value)}
                required
                placeholder="Toyota Camry 2019"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="incident-type" style={labelStyle}>Incident Type</label>
              <select
                id="incident-type"
                value={form.incident_type}
                onChange={(e) => set("incident_type", e.target.value)}
                style={inputStyle}
              >
                <option value="rear_end">Rear-End Collision</option>
                <option value="front_impact">Front Impact</option>
                <option value="side_impact">Side Impact</option>
                <option value="rollover">Rollover</option>
                <option value="hit_and_run">Hit and Run</option>
                <option value="parking_lot">Parking Lot Damage</option>
                <option value="weather">Weather / Natural Cause</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="damage-description" style={labelStyle}>Damage Description</label>
              <textarea
                id="damage-description"
                value={form.damage_description}
                onChange={(e) => set("damage_description", e.target.value)}
                required
                rows={4}
                placeholder="Describe the damage in detail..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Condition */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1rem",
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
            Vehicle Condition
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            {([
              ["vin-visible", "vin_visible", "VIN Visible in footage"],
              ["plate-visible", "plate_visible", "License Plate Visible"],
              ["airbag-deployed", "airbag_deployed", "Airbag Deployed"],
              ["warning-lights", "warning_lights", "Warning Lights On"],
            ] as [string, keyof typeof form, string][]).map(([id, field, label]) => (
              <label
                key={id}
                htmlFor={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#374151",
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: form[field] ? "#f0f9ff" : "#fafafa",
                }}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={form[field] as boolean}
                  onChange={(e) => set(field, e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#00b4d8" }}
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label htmlFor="drivability" style={labelStyle}>Is the vehicle drivable?</label>
            <select
              id="drivability"
              value={form.drivability}
              onChange={(e) => set("drivability", e.target.value)}
              style={inputStyle}
            >
              <option value="yes">Yes — drivable</option>
              <option value="no">No — not drivable</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "13px",
            color: "#dc2626",
            marginBottom: "1rem",
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px",
            background: submitting ? "#9ca3af" : "#00b4d8",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Submitting Claim..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
}
