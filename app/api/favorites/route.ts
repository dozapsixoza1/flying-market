import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
const schema=z.object({listingId:z.string().min(1)});
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});try{const rows=await db.favorite.findMany({where:{userId:user.id},include:{listing:{include:{game:true,seller:{select:{displayName:true}}}}},orderBy:{createdAt:"desc"}});return NextResponse.json({favorites:rows});}catch{return NextResponse.json({favorites:[],configured:false});}}
export async function POST(request:NextRequest){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid listing."},{status:400});try{const key={userId_listingId:{userId:user.id,listingId:parsed.data.listingId}};const existing=await db.favorite.findUnique({where:key});if(existing){await db.favorite.delete({where:key});return NextResponse.json({saved:false});}await db.favorite.create({data:{userId:user.id,listingId:parsed.data.listingId}});return NextResponse.json({saved:true});}catch{return NextResponse.json({error:"Could not update favorites."},{status:503});}}
