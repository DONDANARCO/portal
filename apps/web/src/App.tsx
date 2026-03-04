import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Portal from "./Portal";
import { getMe, login, logout, setActiveTenant, type MeResponse } from "./api";
import OnboardTenant from "./OnboardTenant";

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated" | "error">("loading");

  async function refresh() {
    try {
      setStatus("loading");
      const data = await getMe();
      setMe(data);
      setStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "unauthenticated") {
        setMe(null);
        setStatus("unauthenticated");
      } else {
        setStatus("error");
      }
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const initials = useMemo(() => {
    if (!me?.user) return "U";
    const name = me.user.name ?? me.user.email;
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
    return letters.toUpperCase().slice(0, 2);
  }, [me]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#E8EDF5", background: "#0A0E1A" }}>
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>Loading…</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#E8EDF5", background: "#0A0E1A" }}>
        <div style={{ width: 420, padding: 24, borderRadius: 12, border: "1px solid #1e2d45", background: "#111827", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>ClientPortal</div>
          <div style={{ color: "#6B7FA3", fontSize: 13, marginBottom: 18 }}>Sign in securely with OAuth (OpenID Connect).</div>
          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #00C2FF, #0077FF)",
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (status === "error" || !me) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#E8EDF5", background: "#0A0E1A" }}>
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
          Something went wrong.
          <div>
            <button onClick={() => void refresh()} style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #1e2d45", background: "#111827", color: "#E8EDF5", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (me.tenants.length === 0 && me.isInternalAdmin) {
    return <OnboardTenant onDone={() => void refresh()} />;
  }

  return (
    <Portal
      userInitials={initials}
      tenantId={me.activeTenantId}
      tenantName={me.activeTenant?.name ?? "—"}
      tenants={me.tenants}
      onTenantChange={(tenantId) => {
        void (async () => {
          await setActiveTenant(tenantId);
          await refresh();
        })();
      }}
      onLogout={() => {
        void (async () => {
          await logout();
          await refresh();
        })();
      }}
    />
  );
}
