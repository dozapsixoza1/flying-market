import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/lib/db";
import {getCurrentUser} from "@/lib/auth/session";
const schema=z.object({orderId:z.string().min(1)});
export async function POST(request:NextRequest){const user=await getCurrentUser();if(!user||user.isBanned)return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid order."},{status:400});try{const order=await db.order.findUnique({where:{id:parsed.data.orderId}});if(!order||order.buyerId!==user.id)return NextResponse.json({error:"Order not found."},{status:404});if(order.status!=="PENDING")return NextResponse.json({error:"Order is not payable."},{status:409});return NextResponse.json({error:"Payment provider is not configured. No payment has been taken.",providerConfigured:false},{status:503});}catch{return NextResponse.json({error:"Payment service is not configured."},{status:503});}}
