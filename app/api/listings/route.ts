import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
const schema = z.object({ gameId: z.string().min(1), categoryId: z.string().optional(), title: z.string().trim().min(5).max(100), description: z.string().trim().min(20).max(5000), priceMinor: z.number().int().positive().max(100000000000), currency: z.string().regex(/^[A-Z]{3}$/).default("USD") });
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 80);
  const gameId = request.nextUrl.searchParams.get("gameId");
  try {
    const listings = await db.listing.findMany({ where: { status: "ACTIVE", ...(gameId ? { gameId } : {}), ...(q ? { title: { contains: q, mode: "insensitive" } } : {}) }, include: { game: true, category: true, seller: { select: { id: true, displayName: true, username: true } } }, orderBy: { createdAt: "desc" }, take: 60 });
    return NextResponse.json({ listings: listings.map(x => ({ ...x, priceMinor: x.priceMinor.toString() })) });
  } catch { return NextResponse.json({ listings: [], configured: false }); }
}
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.isBanned) return NextResponse.json({ error: "Sign in with Telegram first." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the listing details.", fields: parsed.error.flatten() }, { status: 400 });
  try {
    const game = await db.game.findFirst({ where: { id: parsed.data.gameId, isActive: true } });
    if (!game) return NextResponse.json({ error: "Game not found." }, { status: 404 });
    const listing = await db.listing.create({ data: { ...parsed.data, priceMinor: BigInt(parsed.data.priceMinor), sellerId: user.id, status: "PENDING" } });
    return NextResponse.json({ listing: { id: listing.id, status: listing.status } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not save listing. Database setup may be pending." }, { status: 503 }); }
}
