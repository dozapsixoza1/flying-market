import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/authorize";
export async function GET(){const access=await requirePermission("listings.review");if(!access.ok)return NextResponse.json({error:"Forbidden"},{status:access.status});try{const listings=await db.listing.findMany({where:{status:"PENDING"},include:{game:true,seller:{select:{displayName:true,username:true}}},orderBy:{createdAt:"asc"},take:100});return NextResponse.json({listings:listings.map(x=>({...x,priceMinor:x.priceMinor.toString()}))});}catch{return NextResponse.json({listings:[],configured:false});}}
