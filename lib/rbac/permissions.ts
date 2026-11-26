export const PERMISSIONS = [
  "staff.read",
  "staff.manage",
  "roles.assign",
  "tickets.read",
  "tickets.reply",
  "tickets.assign",
  "tickets.close",
  "listings.review",
  "reports.handle",
  "orders.read",
  "disputes.handle",
  "payments.read",
  "payments.manage",
  "settings.manage",
  "audit.read",
  "private_chat.access"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Permission checks must be performed on the server using persisted role_permissions.
 * This helper only provides a type-safe permission vocabulary; it does not grant access.
 */
export function isKnownPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}
