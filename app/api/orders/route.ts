import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
const schema=z.object({listingId:z.string().min(1)});
export async function GET(){
 const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const orders=await db.order.findMany({where:{OR:[{buyerId:user.id},{sellerId:user.id}]},include:{listing:true,buyer:{select:{id:true,displayName:true}},seller:{select:{id:true,displayName:true}}},orderBy:{createdAt:"desc"},take:50});return NextResponse.json({orders:orders.map(o=>({...o,amountMinor:o.amountMinor.toString(),listing:{...o.listing,priceMinor:o.listing.priceMinor.toString()}}))});}
 catch{return NextResponse.json({orders:[],configured:false});}
}
export async function POST(request:NextRequest){
 const user=await getCurrentUser();if(!user||user.isBanned)return NextResponse.json({error:"Unauthorized"},{status:401});
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid listing."},{status:400});
 try{
  const listing=await db.listing.findUnique({where:{id:parsed.data.listingId}});
  if(!listing||listing.status!=="ACTIVE")return NextResponse.json({error:"Listing is unavailable."},{status:404});
  if(listing.sellerId===user.id)return NextResponse.json({error:"You cannot buy your own listing."},{status:400});
  const order=await db.$transaction(async tx=>{
   const locked=await tx.listing.updateMany({where:{id:listing.id,status:"ACTIVE"},data:{status:"RESERVED"}});
   if(locked.count!==1)return null;
   return tx.order.create({data:{publicId:"ORD-"+randomBytes(4).toString("hex").toUpperCase(),buyerId:user.id,sellerId:listing.sellerId,listingId:listing.id,amountMinor:listing.priceMinor,currency:listing.currency,events:{create:{actorId:user.id,event:"order.created"}}}});
  });
  if(!order)return NextResponse.json({error:"This listing has just been reserved by another buyer."},{status:409});
  return NextResponse.json({order:{id:order.id,publicId:order.publicId,status:order.status},paymentRequired:true,providerConfigured:false},{status:201});
 }catch{return NextResponse.json({error:"Order service is not configured yet."},{status:503});}
}
