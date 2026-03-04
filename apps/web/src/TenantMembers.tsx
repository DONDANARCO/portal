import { useEffect, useMemo, useState } from "react";
import { listTenantMembers, setTenantMemberRole, type TenantMember } from "./api";

export default function TenantMembers() {
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error">("loading");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"client_admin" | "client_user">("client_admin");

  async function refresh() {
    setStatus("loading");
    try {
      const data = await listTenantMembers();
      setMembers(data.members);
      setCanManage(data.canManage);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const sorted = useMemo(() => [...members].sort((a, b) => a.email.localeCompare(b.email)), [members]);

  async function submit() {
    setStatus("saving");
    try {
      await setTenantMemberRole({ email: email.trim().toLowerCase(), role });
      setEmail("");
      await refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ padding: "16px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Tenant users</div>
        <button
          onClick={() => void refresh()}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #1e2d45", background: "transparent", color: "#00C2FF", cursor: "pointer", fontWeight: 700 }}
        >
          Refresh
        </button>
      </div>

      {status === "loading" ? (
        <div style={{ color: "#6B7FA3", fontSize: 12 }}>Loading…</div>
      ) : status === "error" ? (
        <div style={{ color: "#FF4D6A", fontSize: 12 }}>Couldn’t load or update tenant users.</div>
      ) : null}

      <div style={{ border: "1px solid #1e2d45", borderRadius: 12, overflow: "hidden", marginTop: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: "#0d1526", color: "#6B7FA3", fontSize: 11, padding: "10px 12px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
          <div>User</div>
          <div>Role</div>
          <div>Joined</div>
        </div>
        {sorted.map((m) => (
          <div key={m.userId} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 12px", borderTop: "1px solid #1e2d45", fontSize: 13, color: "#E8EDF5" }}>
            <div style={{ fontWeight: 600 }}>{m.email}<div style={{ fontSize: 11, color: "#6B7FA3", fontWeight: 400 }}>{m.name ?? "—"}</div></div>
            <div style={{ color: m.role === "client_admin" ? "#00C2FF" : "#6B7FA3", fontWeight: 700 }}>{m.role}</div>
            <div style={{ color: "#6B7FA3" }}>{new Date(m.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ padding: 12, color: "#6B7FA3", fontSize: 12 }}>No users yet.</div>}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12, color: "#6B7FA3", marginBottom: 8 }}>
          {canManage ? "Promote/demote an existing user (must have signed in once)." : "Only tenant admins can manage roles."}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@customer.com"
            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #1e2d45", background: "#0d1526", color: "#E8EDF5" }}
            disabled={!canManage || status === "saving"}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "client_admin" | "client_user")}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #1e2d45", background: "#0d1526", color: "#E8EDF5" }}
            disabled={!canManage || status === "saving"}
          >
            <option value="client_admin">client_admin</option>
            <option value="client_user">client_user</option>
          </select>
          <button
            onClick={() => void submit()}
            disabled={!canManage || status === "saving" || email.trim().length < 5}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              cursor: !canManage || status === "saving" || email.trim().length < 5 ? "not-allowed" : "pointer",
              fontWeight: 800,
              color: "#fff",
              background: "linear-gradient(135deg, #00C2FF, #0077FF)",
              opacity: !canManage || status === "saving" || email.trim().length < 5 ? 0.6 : 1,
            }}
          >
            Set role
          </button>
        </div>
      </div>
    </div>
  );
}

