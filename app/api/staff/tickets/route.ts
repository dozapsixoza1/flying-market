import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/authorize";
export async function GET() {
  const access = await requirePermission("tickets.read");
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });
  try {
    const tickets = await db.supportTicket.findMany({ include: { author: { select: { id: true, displayName: true, username: true } }, category: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100 });
    return NextResponse.json({ tickets });
  } catch { return NextResponse.json({ tickets: [], configured: false }); }
}
