import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
const schema=z.object({targetType:z.enum(["LISTING","USER","ORDER"]),targetId:z.string().min(1),reason:z.string().trim().min(4).max(120),details:z.string().trim().max(2000).optional()});
export async function POST(request:NextRequest){const user=await getCurrentUser();if(!user||user.isBanned)return NextResponse.json({error:"Sign in first."},{status:401});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid report."},{status:400});try{const report=await db.report.create({data:{reporterId:user.id,...parsed.data}});return NextResponse.json({reportId:report.id,status:report.status},{status:201});}catch{return NextResponse.json({error:"Could not submit report."},{status:503});}}
