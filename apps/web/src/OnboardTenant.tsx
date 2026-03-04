import { useMemo, useState } from "react";
import { onboardTenant } from "./api";

export default function OnboardTenant({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [entraTenantId, setEntraTenantId] = useState("");
  const [domains, setDomains] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const domainList = useMemo(
    () =>
      domains
        .split(/[,\s]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    [domains],
  );

  async function submit() {
    setStatus("saving");
    try {
      await onboardTenant({
        name: name.trim(),
        entraTenantId: entraTenantId.trim() || undefined,
        domains: domainList,
      });
      setStatus("idle");
      onDone();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#E8EDF5", background: "#0A0E1A" }}>
      <div style={{ width: 520, padding: 24, borderRadius: 12, border: "1px solid #1e2d45", background: "#111827", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Onboard a tenant</div>
        <div style={{ color: "#6B7FA3", fontSize: 13, marginBottom: 18 }}>
          Create a tenant explicitly and map users via Entra tenant ID and/or allowed email domains.
        </div>

        <label style={{ display: "block", fontSize: 12, color: "#6B7FA3", marginBottom: 6 }}>Tenant name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Corp"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e2d45", background: "#0d1526", color: "#E8EDF5", marginBottom: 14 }}
        />

        <label style={{ display: "block", fontSize: 12, color: "#6B7FA3", marginBottom: 6 }}>Entra tenant ID (Directory ID)</label>
        <input
          value={entraTenantId}
          onChange={(e) => setEntraTenantId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e2d45", background: "#0d1526", color: "#E8EDF5", marginBottom: 14 }}
        />

        <label style={{ display: "block", fontSize: 12, color: "#6B7FA3", marginBottom: 6 }}>Allowed email domains (comma or space separated)</label>
        <input
          value={domains}
          onChange={(e) => setDomains(e.target.value)}
          placeholder="acme.com, acme.co.uk"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e2d45", background: "#0d1526", color: "#E8EDF5", marginBottom: 18 }}
        />

        <button
          onClick={() => void submit()}
          disabled={status === "saving" || name.trim().length < 2}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: status === "saving" || name.trim().length < 2 ? "not-allowed" : "pointer",
            fontWeight: 700,
            color: "#fff",
            opacity: status === "saving" || name.trim().length < 2 ? 0.6 : 1,
            background: "linear-gradient(135deg, #00C2FF, #0077FF)",
          }}
        >
          {status === "saving" ? "Creating…" : "Create tenant"}
        </button>

        {status === "error" && <div style={{ marginTop: 12, fontSize: 12, color: "#FF4D6A" }}>Failed to create tenant (check your admin access and API logs).</div>}
      </div>
    </div>
  );
}

