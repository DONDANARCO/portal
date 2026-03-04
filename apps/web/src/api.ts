export type TenantSummary = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export type TenantMember = {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export type MeResponse = {
  user: { id: string; email: string; name: string | null };
  isInternalAdmin: boolean;
  activeTenantId: string | null;
  activeTenant: { id: string; name: string; status: string } | null;
  tenants: TenantSummary[];
};

export async function getMe(): Promise<MeResponse> {
  const res = await fetch("/api/me", { credentials: "include" });
  if (res.status === 401) throw new Error("unauthenticated");
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export async function setActiveTenant(tenantId: string): Promise<void> {
  const res = await fetch("/api/tenants/active", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tenantId }),
  });
  if (!res.ok) throw new Error("failed");
}

export async function logout(): Promise<void> {
  const res = await fetch("/auth/logout", { method: "POST", credentials: "include" });
  if (!res.ok && res.status !== 204) throw new Error("failed");
}

export function login(): void {
  window.location.assign("/auth/login");
}

export async function onboardTenant(input: { name: string; entraTenantId?: string; domains: string[] }): Promise<void> {
  const res = await fetch("/api/admin/tenants", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("failed");
}

export async function listTenantMembers(): Promise<{ tenantId: string; members: TenantMember[]; canManage: boolean }> {
  const res = await fetch("/api/tenant/members", { credentials: "include" });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export async function setTenantMemberRole(input: { email: string; role: "client_admin" | "client_user" }): Promise<void> {
  const res = await fetch("/api/tenant/members/role", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("failed");
}

