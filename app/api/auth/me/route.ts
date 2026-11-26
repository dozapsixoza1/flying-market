import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { id: user.id, displayName: user.displayName, username: user.username, avatarUrl: user.avatarUrl, staffRole: user.staff?.isActive ? user.staff.role : null } });
}
