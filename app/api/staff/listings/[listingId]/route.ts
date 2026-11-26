import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/authorize";
const schema=z.object({status:z.enum(["ACTIVE","REJECTED","ARCHIVED"])});
export async function PATCH(request:NextRequest,context:{params:Promise<{listingId:string}>}){const access=await requirePermission("listings.review");if(!access.ok)return NextResponse.json({error:"Forbidden"},{status:access.status});const {listingId}=await context.params;const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid status."},{status:400});try{const listing=await db.listing.update({where:{id:listingId},data:{status:parsed.data.status}});const staff=await db.staffMember.findUnique({where:{userId:access.user.id}});if(staff)await db.staffActivityLog.create({data:{staffId:staff.id,action:"listing.moderated",targetType:"listing",targetId:listingId,reason:parsed.data.status}});return NextResponse.json({listing:{id:listing.id,status:listing.status}});}catch{return NextResponse.json({error:"Listing not found."},{status:404});}}
