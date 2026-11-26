import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";

const bodySchema = z.object({ initData: z.string().min(1).max(10000) });
export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Telegram authentication is not configured yet." }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const telegramUser = validateTelegramInitData(parsed.data.initData, token);
  if (!telegramUser) return NextResponse.json({ error: "Invalid or expired Telegram session." }, { status: 401 });
  try {
    const user = await db.user.upsert({
      where: { telegramId: BigInt(telegramUser.id) },
      create: { telegramId: BigInt(telegramUser.id), username: telegramUser.username?.toLowerCase() ?? null, displayName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" "), avatarUrl: telegramUser.photo_url ?? null, locale: telegramUser.language_code ?? "ru" },
      update: { username: telegramUser.username?.toLowerCase() ?? null, displayName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" "), avatarUrl: telegramUser.photo_url ?? null, locale: telegramUser.language_code ?? "ru" }
    });
    if (user.isBanned) return NextResponse.json({ error: "Account is restricted." }, { status: 403 });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, displayName: user.displayName, username: user.username, avatarUrl: user.avatarUrl } });
  } catch {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}
