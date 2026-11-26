import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/authorize";
const schema = z.object({ body: z.string().trim().min(1).max(4000) });
export async function POST(request: NextRequest, context: { params: Promise<{ticketId:string}> }) {
  const user = await getCurrentUser();
  if (!user || user.isBanned) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ticketId } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message is required." }, { status: 400 });
  try {
    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    const isStaff = await hasPermission("tickets.reply");
    if (ticket.authorId !== user.id && !isStaff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (ticket.status === "CLOSED") return NextResponse.json({ error: "This ticket is closed." }, { status: 409 });
    const message = await db.supportMessage.create({ data: { ticketId, senderId: user.id, body: parsed.data.body, isStaff } });
    await db.supportTicket.update({ where: { id: ticketId }, data: { status: isStaff ? "IN_PROGRESS" : "OPEN" } });
    return NextResponse.json({ message }, { status: 201 });
  } catch { return NextResponse.json({ error: "Support storage is not configured." }, { status: 503 }); }
}
