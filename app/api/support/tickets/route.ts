import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
const categories = [{slug:"purchase",title:"Проблема с покупкой"},{slug:"sale",title:"Проблема с продажей"},{slug:"payments",title:"Платежи и возвраты"},{slug:"report",title:"Жалоба на пользователя"},{slug:"account",title:"Аккаунт и профиль"},{slug:"game-items",title:"Игровые товары"},{slug:"other",title:"Другой вопрос"}];
const schema = z.object({ category: z.enum(["purchase","sale","payments","report","account","game-items","other"]), subject: z.string().trim().min(4).max(120), message: z.string().trim().min(10).max(4000), orderRef: z.string().trim().max(80).optional() });
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const tickets = await db.supportTicket.findMany({ where: { authorId: user.id }, include: { category: true, messages: { orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" }, take: 50 });
    return NextResponse.json({ tickets });
  } catch { return NextResponse.json({ tickets: [], configured: false }); }
}
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.isBanned) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the subject and message." }, { status: 400 });
  try {
    const cat = categories.find(x => x.slug === parsed.data.category)!;
    const category = await db.supportCategory.upsert({ where: { slug: cat.slug }, create: cat, update: { title: cat.title, isActive: true } });
    const ticket = await db.supportTicket.create({ data: { publicId: "FM-" + randomBytes(4).toString("hex").toUpperCase(), authorId: user.id, categoryId: category.id, subject: parsed.data.subject, orderRef: parsed.data.orderRef || null, messages: { create: { senderId: user.id, body: parsed.data.message, isStaff: false } } }, include: { category: true, messages: true } });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch { return NextResponse.json({ error: "Support storage is not configured yet." }, { status: 503 }); }
}
