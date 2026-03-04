import { useEffect, useMemo, useState } from "react";
import type { TenantSummary, TrainingSessionSummary, BookingSummary } from "./api";
import { getTrainingSessions, getBookings } from "./api";
import TenantMembers from "./TenantMembers";

const COLORS = {
  bg: "#0A0E1A",
  surface: "#111827",
  surfaceHover: "#1a2235",
  border: "#1e2d45",
  accent: "#00C2FF",
  accentSoft: "rgba(0,194,255,0.12)",
  accentGlow: "rgba(0,194,255,0.25)",
  success: "#00E5A0",
  warning: "#FFB547",
  danger: "#FF4D6A",
  text: "#E8EDF5",
  textMuted: "#6B7FA3",
  textDim: "#3D5070",
};

const style = {
  app: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row" as const,
  },
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: COLORS.surface,
    borderRight: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column" as const,
    padding: "0",
    flexShrink: 0,
  },
  logo: {
    padding: "28px 24px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${COLORS.accent}, #0077FF)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: -1,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.text,
    letterSpacing: "-0.3px",
  },
  logoSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  navSection: {
    padding: "16px 12px 8px",
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: COLORS.textDim,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    padding: "8px 12px 6px",
  },
  navItem: (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 2,
    background: active ? COLORS.accentSoft : "transparent",
    border: active ? `1px solid ${COLORS.accentGlow}` : "1px solid transparent",
    color: active ? COLORS.accent : COLORS.textMuted,
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
  }),
  tenantPill: {
    margin: "12px 16px",
    background: COLORS.accentSoft,
    border: `1px solid ${COLORS.accentGlow}`,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    color: COLORS.accent,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "auto",
  },
  topbar: {
    height: 64,
    background: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  badge: (color?: string) => ({
    background: color ? `${color}22` : COLORS.accentSoft,
    color: color || COLORS.accent,
    border: `1px solid ${color ? color + "44" : COLORS.accentGlow}`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11.5,
    fontWeight: 600,
  }),
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: `linear-gradient(135deg, #0077FF, ${COLORS.accent})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
  },
  content: {
    padding: "28px 32px",
    flex: 1,
  },
  grid: (cols: number) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 16,
    marginBottom: 24,
  }),
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "20px 22px",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  section: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "16px 22px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "-0.2px",
  },
  btn: (variant?: "primary" | "outline" | "ghost" | "sm") => ({
    padding: variant === "sm" ? "5px 14px" : "9px 20px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: variant === "sm" ? 12 : 13,
    fontWeight: 600,
    background:
      variant === "ghost"
        ? "transparent"
        : variant === "outline"
          ? "transparent"
          : `linear-gradient(135deg, ${COLORS.accent}, #0077FF)`,
    color: variant === "ghost" ? COLORS.textMuted : variant === "outline" ? COLORS.accent : "#fff",
    border: variant === "outline" ? `1px solid ${COLORS.accentGlow}` : "none",
    transition: "opacity 0.15s",
  }),
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    padding: "10px 22px",
    textAlign: "left" as const,
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: `1px solid ${COLORS.border}`,
    background: "#0d1526",
  },
  td: {
    padding: "12px 22px",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text,
  },
  statusBadge: (status: string) => {
    const map: Record<string, [string, string]> = {
      active: [COLORS.success, "#00e5a022"],
      warning: [COLORS.warning, "#ffb54722"],
      danger: [COLORS.danger, "#ff4d6a22"],
      closed: [COLORS.textMuted, "#6b7fa322"],
      open: [COLORS.accent, COLORS.accentSoft],
      pending: [COLORS.warning, "#ffb54722"],
      met: [COLORS.success, "#00e5a022"],
      breached: [COLORS.danger, "#ff4d6a22"],
      complete: [COLORS.success, "#00e5a022"],
      upcoming: [COLORS.warning, "#ffb54722"],
      connected: [COLORS.success, "#00e5a022"],
    };
    const [color, bg] = map[status] || [COLORS.textMuted, "#6b7fa322"];
    return {
      display: "inline-block",
      background: bg,
      color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 600,
      textTransform: "capitalize" as const,
    };
  },
  uptimeDot: (up: boolean) => ({
    display: "inline-block",
    width: 10,
    height: 28,
    borderRadius: 3,
    background: up ? COLORS.success : COLORS.danger,
    marginRight: 2,
    verticalAlign: "middle" as const,
  }),
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "training", label: "Training & Certs", icon: "🎓" },
  { id: "bookings", label: "Training Bookings", icon: "📅" },
  { id: "support", label: "Support Tickets", icon: "🎫" },
  { id: "sla", label: "SLA Dashboard", icon: "📊" },
  { id: "documents", label: "Documents", icon: "📁" },
  { id: "uptime", label: "Platform Uptime", icon: "🟢" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const TICKETS = [
  { id: "TKT-001", subject: "Login issue after SSO update", client: "Acme Corp", type: "Access", priority: "High", status: "open", opened: "2h 14m ago", sla: "4h", timeLeft: "1h 46m", slaMet: true },
  { id: "TKT-002", subject: "Report export not generating PDF", client: "BlueSky Ltd", type: "Bug", priority: "Medium", status: "open", opened: "5h 02m ago", sla: "8h", timeLeft: "2h 58m", slaMet: true },
  { id: "TKT-003", subject: "New user onboarding request", client: "Nexus Systems", type: "Request", priority: "Low", status: "pending", opened: "1d 3h ago", sla: "24h", timeLeft: "Breached", slaMet: false },
  { id: "TKT-004", subject: "Dashboard data mismatch", client: "Acme Corp", type: "Bug", priority: "High", status: "closed", opened: "3d ago", sla: "4h", timeLeft: "—", slaMet: true },
];

const DOCS = [
  { name: "Master Service Agreement.pdf", client: "Acme Corp", size: "2.4 MB", uploaded: "Jan 2026", type: "Contract" },
  { name: "Data Processing Agreement.pdf", client: "Acme Corp", size: "1.1 MB", uploaded: "Jan 2026", type: "Legal" },
  { name: "SLA Schedule v2.docx", client: "BlueSky Ltd", size: "340 KB", uploaded: "Feb 2026", type: "SLA" },
  { name: "Onboarding Checklist.xlsx", client: "Nexus Systems", size: "88 KB", uploaded: "Mar 2026", type: "Internal" },
];

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ ...style.card, borderTop: `3px solid ${accent || COLORS.accent}` }}>
      <div style={style.cardTitle}>{label}</div>
      <div style={{ ...style.cardValue, color: accent || COLORS.text }}>{value}</div>
      {sub && <div style={style.cardSub}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 6, background: COLORS.border, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.3s" }} />
    </div>
  );
}

function Dashboard({ tenantName }: { tenantName: string }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Good morning</div>
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>
          Here's what's happening for <strong style={{ color: COLORS.accent }}>{tenantName}</strong> today.
        </div>
      </div>
      <div style={style.grid(4)}>
        <StatCard label="Open Tickets" value="3" sub="2 within SLA" accent={COLORS.accent} />
        <StatCard label="SLA Compliance" value="87%" sub="Last 30 days" accent={COLORS.success} />
        <StatCard label="Certs Issued" value="19" sub="This quarter" accent={COLORS.warning} />
        <StatCard label="Uptime (30d)" value="99.4%" sub="All systems" accent={COLORS.success} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={style.section}>
          <div style={style.sectionHeader}>
            <span style={style.sectionTitle}>Recent Tickets</span>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>Live timers active</span>
          </div>
          {TICKETS.filter((t) => t.status !== "closed")
            .slice(0, 3)
            .map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "14px 22px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.subject}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                    {t.id} · {t.type} · opened {t.opened}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={style.statusBadge(t.slaMet ? "met" : "breached")}>{t.slaMet ? `⏱ ${t.timeLeft}` : "⚠ Breached"}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Dashboard right column currently uses sample bookings; Phase 2 wiring is on the Bookings page below. */}
      </div>
    </div>
  );
}

function Training() {
  const [tab, setTab] = useState<"sessions" | "register" | "certificates">("sessions");
  const [sessions, setSessions] = useState<TrainingSessionSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    void (async () => {
      try {
        setStatus("loading");
        const data = await getTrainingSessions();
        setSessions(data);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["sessions", "register", "certificates"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...style.btn(tab === t ? "primary" : "outline"),
              textTransform: "capitalize",
            }}
          >
            {t === "register" ? "Attendance Register" : t === "certificates" ? "Certificates" : "Sessions"}
          </button>
        ))}
      </div>

      {tab === "sessions" && (
        <div style={style.section}>
          <div style={style.sectionHeader}>
            <span style={style.sectionTitle}>Training Sessions</span>
            <button style={style.btn("primary")}>+ Schedule Session</button>
          </div>
          {status === "error" && (
            <div style={{ padding: "10px 22px", color: COLORS.danger, fontSize: 12 }}>Could not load sessions.</div>
          )}
          <table style={style.table}>
            <thead>
              <tr>{["ID", "Course", "Date", "Attendees", "Certs Issued", "Status"].map((h) => <th key={h} style={style.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => (
                <tr key={s.id} style={{ cursor: "pointer" }}>
                  <td style={{ ...style.td, color: COLORS.accent, fontWeight: 600 }}>TR-{String(idx + 1).padStart(2, "0")}</td>
                  <td style={style.td}>{s.courseName}</td>
                  <td style={style.td}>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={style.td}>{s.attendees}</td>
                  <td style={style.td}>{s.attended || "—"}</td>
                  <td style={style.td}>
                    <span style={style.statusBadge(s.attended === s.attendees && s.attendees > 0 ? "complete" : "upcoming")}>
                      {s.attended === s.attendees && s.attendees > 0 ? "complete" : "upcoming"}
                    </span>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && status === "ready" && (
                <tr>
                  <td colSpan={6} style={{ ...style.td, color: COLORS.textMuted, fontSize: 12 }}>No sessions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "register" && (
        <div style={style.section}>
          <div style={style.sectionHeader}>
            <span style={style.sectionTitle}>Attendance Register — ISO 27001 Awareness</span>
            <button style={style.btn("outline")}>⬇ Export PDF</button>
          </div>
          {["Alice Johnson", "Bob Kaplan", "Carol Smith", "David Wu", "Emily Torres"].map((name, i) => (
            <div
              key={name}
              style={{
                padding: "13px 22px",
                borderBottom: `1px solid ${COLORS.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...style.avatar, width: 30, height: 30, fontSize: 11 }}>{name[0]}</div>
                <span style={{ fontSize: 13 }}>{name}</span>
              </div>
              <span style={style.statusBadge(i < 4 ? "met" : "warning")}>{i < 4 ? "✓ Attended" : "⚠ Absent"}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "certificates" && (
        <div style={style.section}>
          <div style={style.sectionHeader}>
            <span style={style.sectionTitle}>Issued Certificates</span>
            <button style={style.btn("primary")}>+ Issue Cert</button>
          </div>
          {["Alice Johnson", "Bob Kaplan", "Carol Smith", "David Wu"].map((name) => (
            <div
              key={name}
              style={{
                padding: "13px 22px",
                borderBottom: `1px solid ${COLORS.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>ISO 27001 Awareness · Issued Jan 15, 2026 · Expires Jan 2027</div>
              </div>
              <button style={style.btn("outline")}>⬇ Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    void (async () => {
      try {
        setStatus("loading");
        const data = await getBookings();
        setBookings(data);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: COLORS.textMuted }}>Bookings sync with your Outlook calendar automatically.</div>
        <button style={style.btn("primary")}>+ New Booking</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <span style={style.badge(COLORS.success)}>📅 Connected: team@company.com</span>
        <span style={style.badge(COLORS.accent)}>+ Add Team Member Calendar</span>
      </div>

      <div style={style.section}>
        <div style={style.sectionHeader}>
          <span style={style.sectionTitle}>Scheduled Sessions</span>
        </div>
        {status === "error" && (
          <div style={{ padding: "10px 22px", color: COLORS.danger, fontSize: 12 }}>Could not load bookings.</div>
        )}
        <table style={style.table}>
          <thead>
            <tr>{["Booking", "Title", "Date", "Time", "Attendees", "Outlook Sync"].map((h) => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {bookings.map((b, idx) => {
              const start = new Date(b.startsAt);
              const date = start.toLocaleDateString();
              const time = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const synced = Boolean(b.outlookEventId);
              return (
              <tr key={b.id}>
                <td style={{ ...style.td, color: COLORS.accent, fontWeight: 600 }}>BK-{String(idx + 1).padStart(2, "0")}</td>
                <td style={style.td}>{b.title}</td>
                <td style={style.td}>{date}</td>
                <td style={style.td}>{time}</td>
                <td style={style.td}>{b.organizer ?? "—"}</td>
                <td style={style.td}>
                  <span style={style.statusBadge(synced ? "met" : "warning")}>{synced ? "✓ Synced" : "⚠ Pending Sync"}</span>
                </td>
              </tr>
            );})}
            {bookings.length === 0 && status === "ready" && (
              <tr>
                <td colSpan={6} style={{ ...style.td, color: COLORS.textMuted, fontSize: 12 }}>No bookings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Support() {
  const [selected, setSelected] = useState<(typeof TICKETS)[number] | null>(null);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Open", "Pending", "Closed"].map((f) => (
            <button key={f} style={style.btn("outline")}>{f}</button>
          ))}
        </div>
        <button style={style.btn("primary")}>+ New Ticket</button>
      </div>

      <div style={style.section}>
        <div style={style.sectionHeader}>
          <span style={style.sectionTitle}>Support Tickets</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>SLA timers start on email receipt · stop on close</span>
        </div>
        <table style={style.table}>
          <thead>
            <tr>{["ID", "Subject", "Type", "Priority", "Status", "SLA Window", "Time Remaining"].map((h) => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {TICKETS.map((t) => (
              <tr key={t.id} onClick={() => setSelected(t)} style={{ cursor: "pointer" }}>
                <td style={{ ...style.td, color: COLORS.accent, fontWeight: 600 }}>{t.id}</td>
                <td style={style.td}>{t.subject}</td>
                <td style={style.td}><span style={style.badge()}>{t.type}</span></td>
                <td style={style.td}>
                  <span style={style.statusBadge(t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "closed")}>{t.priority}</span>
                </td>
                <td style={style.td}><span style={style.statusBadge(t.status)}>{t.status}</span></td>
                <td style={style.td}>{t.sla}</td>
                <td style={style.td}>
                  <span style={style.statusBadge(t.slaMet ? "met" : "breached")}>{t.timeLeft}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ ...style.card, border: `1px solid ${COLORS.accentGlow}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selected.subject}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                {selected.id} · {selected.client} · Type: {selected.type}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={style.btn("ghost")}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button style={style.btn("primary")}>Close Ticket (stops timer)</button>
            <button style={style.btn("outline")}>Add Note</button>
            <button style={style.btn("ghost")}>Escalate</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SLADashboard() {
  const slaTypes = [
    { type: "Critical / Access", window: "4h", met: 92, total: 12 },
    { type: "Bug / Functional", window: "8h", met: 85, total: 20 },
    { type: "Service Request", window: "24h", met: 78, total: 9 },
    { type: "General Enquiry", window: "48h", met: 96, total: 25 },
  ];
  return (
    <div>
      <div style={{ ...style.card, marginBottom: 20, background: "#0d1526" }}>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>ℹ️ SLA policies are editable per client. Contact your admin to update thresholds.</div>
        <button style={style.btn("outline")}>Edit SLA Policy</button>
      </div>

      <div style={style.grid(4)}>
        <StatCard label="Overall Compliance" value="88%" sub="Last 30 days" accent={COLORS.success} />
        <StatCard label="Breached This Month" value="4" sub="Out of 66 tickets" accent={COLORS.danger} />
        <StatCard label="Avg Resolution" value="3h 42m" sub="All categories" accent={COLORS.accent} />
        <StatCard label="CSAT Score" value="4.6/5" sub="Based on 38 ratings" accent={COLORS.warning} />
      </div>

      <div style={style.section}>
        <div style={style.sectionHeader}>
          <span style={style.sectionTitle}>SLA Compliance by Category</span>
        </div>
        {slaTypes.map((s) => (
          <div key={s.type} style={{ padding: "16px 22px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.type}</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 10 }}>
                  SLA: {s.window} · {s.total} tickets
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: s.met >= 90 ? COLORS.success : s.met >= 80 ? COLORS.warning : COLORS.danger }}>{s.met}%</span>
            </div>
            <ProgressBar pct={s.met} color={s.met >= 90 ? COLORS.success : s.met >= 80 ? COLORS.warning : COLORS.danger} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Documents() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: COLORS.textMuted }}>Encrypted storage · access-controlled per client</div>
        <button style={style.btn("primary")}>⬆ Upload Document</button>
      </div>
      <div style={style.section}>
        <div style={style.sectionHeader}>
          <span style={style.sectionTitle}>Client Documents</span>
        </div>
        <table style={style.table}>
          <thead>
            <tr>{["Name", "Client", "Type", "Size", "Uploaded", "Actions"].map((h) => <th key={h} style={style.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {DOCS.map((d) => (
              <tr key={d.name}>
                <td style={{ ...style.td, fontWeight: 600 }}>📄 {d.name}</td>
                <td style={style.td}>{d.client}</td>
                <td style={style.td}><span style={style.badge()}>{d.type}</span></td>
                <td style={{ ...style.td, color: COLORS.textMuted }}>{d.size}</td>
                <td style={{ ...style.td, color: COLORS.textMuted }}>{d.uploaded}</td>
                <td style={style.td}><button style={style.btn("sm")}>⬇ Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Uptime() {
  const uptimeDays = useMemo(() => Array.from({ length: 60 }, () => Math.random() > 0.04), []);

  return (
    <div>
      <div style={style.grid(3)}>
        <StatCard label="30-Day Uptime" value="99.4%" sub="API + Portal" accent={COLORS.success} />
        <StatCard label="Last Incident" value="12d ago" sub="3m downtime" accent={COLORS.warning} />
        <StatCard label="Current Status" value="Operational" sub="All systems" accent={COLORS.success} />
      </div>

      <div style={style.section}>
        <div style={style.sectionHeader}>
          <span style={style.sectionTitle}>60-Day Uptime History</span>
          <span style={style.badge(COLORS.success)}>● All Systems Operational</span>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 12 }}>
            {uptimeDays.map((up, i) => (
              <div key={i} title={up ? `Day ${i + 1}: Online` : `Day ${i + 1}: Incident`} style={{ ...style.uptimeDot(up) }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", gap: 16 }}>
            <span>🟢 Operational</span>
            <span>🔴 Incident</span>
            <span>← 60 days ago · Today →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings({ tenants }: { tenants: TenantSummary[] }) {
  return (
    <div>
      <div style={style.grid(2)}>
        <div style={style.section}>
          <div style={style.sectionHeader}><span style={style.sectionTitle}>Tenant Management</span></div>
          {tenants.map((t) => (
            <div key={t.id} style={{ padding: "13px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13 }}>{t.name}</span>
              <button style={style.btn("sm")}>Manage</button>
            </div>
          ))}
          <div style={{ padding: 16 }}><button style={style.btn("primary")}>+ Onboard New Client</button></div>
        </div>
        <div style={style.section}>
          <div style={style.sectionHeader}><span style={style.sectionTitle}>Integrations</span></div>
          {[
            { name: "Microsoft Outlook / Calendar", status: "connected", desc: "Booking sync active" },
            { name: "Support Mailbox", status: "connected", desc: "support@company.com" },
            { name: "Document Storage", status: "connected", desc: "Encrypted at rest" },
            { name: "SAML / SSO", status: "pending", desc: "Not configured" },
          ].map((int) => (
            <div key={int.name} style={{ padding: "13px 22px", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{int.name}</span>
                <span style={style.statusBadge(int.status)}>{int.status}</span>
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{int.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={style.section}>
        <div style={style.sectionHeader}>
          <span style={style.sectionTitle}>Users & Roles</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Tenant admins can manage access</span>
        </div>
        <TenantMembers />
      </div>
    </div>
  );
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Overview",
  training: "Training & Certificates",
  bookings: "Training Bookings",
  support: "Support Tickets",
  sla: "SLA Dashboard",
  documents: "Documents & Contracts",
  uptime: "Platform Uptime",
  settings: "Settings & Integrations",
};

export default function Portal({
  userInitials,
  tenantId,
  tenants,
  tenantName,
  onTenantChange,
  onLogout,
}: {
  userInitials: string;
  tenantId: string | null;
  tenantName: string;
  tenants: TenantSummary[];
  onTenantChange: (tenantId: string) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState("dashboard");

  const PageComponent =
    page === "training"
      ? Training
      : page === "bookings"
        ? Bookings
        : page === "support"
          ? Support
          : page === "sla"
            ? SLADashboard
            : page === "documents"
              ? Documents
              : page === "uptime"
                ? Uptime
                : page === "settings"
                  ? () => <Settings tenants={tenants} />
                  : () => <Dashboard tenantName={tenantName} />;

  return (
    <div style={style.app}>
      <div style={style.sidebar}>
        <div style={style.logo}>
          <div style={style.logoIcon}>CP</div>
          <div>
            <div style={style.logoText}>ClientPortal</div>
            <div style={style.logoSub}>Admin Console</div>
          </div>
        </div>

        <div style={style.tenantPill}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>VIEWING AS TENANT</div>
          <select
            value={tenantId ?? ""}
            onChange={(e) => onTenantChange(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.accent,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              outline: "none",
            }}
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id} style={{ background: COLORS.surface }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={style.navSection}>
          <div style={style.navLabel}>Navigation</div>
          {NAV.map((n) => (
            <div key={n.id} style={style.navItem(page === n.id)} onClick={() => setPage(n.id)}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={style.main}>
        <div style={style.topbar}>
          <div style={style.pageTitle}>{PAGE_TITLES[page]}</div>
          <div style={style.topbarRight}>
            <span style={style.badge(COLORS.success)}>● All Systems Operational</span>
            <button onClick={onLogout} style={style.btn("outline")}>Logout</button>
            <div style={style.avatar} title="Signed in">
              {userInitials}
            </div>
          </div>
        </div>
        <div style={style.content}>
          <PageComponent />
        </div>
      </div>
    </div>
  );
}

