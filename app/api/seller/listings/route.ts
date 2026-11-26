import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getCurrentUser} from "@/lib/auth/session";
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});try{const listings=await db.listing.findMany({where:{sellerId:user.id},include:{game:true,category:true},orderBy:{createdAt:"desc"},take:100});return NextResponse.json({listings:listings.map(x=>({...x,priceMinor:x.priceMinor.toString()}))});}catch{return NextResponse.json({listings:[],configured:false});}}
