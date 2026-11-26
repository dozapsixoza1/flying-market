import { StaffRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

export type StaffPermission = "staff.read" | "staff.manage" | "roles.assign" | "tickets.read" | "tickets.reply" | "tickets.assign" | "tickets.close" | "listings.review" | "reports.handle" | "orders.read" | "disputes.handle" | "payments.read" | "payments.manage" | "settings.manage" | "audit.read" | "private_chat.access";
const defaults: Record<StaffRole, StaffPermission[]> = {
  OWNER: ["staff.read","staff.manage","roles.assign","tickets.read","tickets.reply","tickets.assign","tickets.close","listings.review","reports.handle","orders.read","disputes.handle","payments.read","payments.manage","settings.manage","audit.read","private_chat.access"],
  ADMIN: ["staff.read","tickets.read","tickets.reply","tickets.assign","tickets.close","listings.review","reports.handle","orders.read","disputes.handle","payments.read","audit.read"],
  MODERATOR: ["tickets.read","tickets.reply","listings.review","reports.handle","orders.read","disputes.handle"],
  HELPER: ["tickets.read","tickets.reply"]
};
export async function hasPermission(permission: StaffPermission) {
  const user = await getCurrentUser();
  if (!user || user.isBanned || !user.staff?.isActive) return false;
  if (user.staff.role === "OWNER") return true;
  const row = await (await import("@/lib/db")).db.rolePermission.findFirst({
    where: { role: user.staff.role, permission: { key: permission } }
  }).catch(() => null);
  if (row) return true;
  return defaults[user.staff.role].includes(permission);
}
export async function requirePermission(permission: StaffPermission) {
  const user = await getCurrentUser();
  if (!user || user.isBanned) return { ok: false as const, status: 401, user: null };
  if (!user.staff?.isActive || !await hasPermission(permission)) return { ok: false as const, status: 403, user: null };
  return { ok: true as const, user };
}
