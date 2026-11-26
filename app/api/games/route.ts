import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try { const games = await db.game.findMany({ where: { isActive: true }, orderBy: [{sortOrder:"asc"},{name:"asc"}], include: { categories: { where: {isActive:true}, orderBy:{name:"asc"} } } }); return NextResponse.json({games}); }
  catch { return NextResponse.json({games:[],configured:false}); }
}
