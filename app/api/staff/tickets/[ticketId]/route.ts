import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/authorize";
const schema = z.object({ status: z.enum(["OPEN","ASSIGNED","IN_PROGRESS","WAITING","RESOLVED","CLOSED"]).optional(), assignedTo: z.string().nullable().optional(), note: z.string().trim().min(1).max(2000).optional() });
export async function PATCH(request: NextRequest, context: {params:Promise<{ticketId:string}>}) {
 const user=await getCurrentUser();if(!user||user.isBanned)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {ticketId}=await context.params;const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid update."},{status:400});
 const canRead=await hasPermission("tickets.read");if(!canRead)return NextResponse.json({error:"Forbidden"},{status:403});
 const canAssign=await hasPermission("tickets.assign");const canClose=await hasPermission("tickets.close");
 if(parsed.data.assignedTo!==undefined&&!canAssign)return NextResponse.json({error:"Assignment permission required."},{status:403});
 if(parsed.data.status&&["RESOLVED","CLOSED"].includes(parsed.data.status)&&!canClose)return NextResponse.json({error:"Close permission required."},{status:403});
 if(parsed.data.status&&["OPEN","ASSIGNED"].includes(parsed.data.status)&&!canAssign)return NextResponse.json({error:"Status permission required."},{status:403});
 try {
  const ticket=await db.supportTicket.findUnique({where:{id:ticketId}});if(!ticket)return NextResponse.json({error:"Not found."},{status:404});
  if(parsed.data.assignedTo&&!await db.staffMember.findFirst({where:{id:parsed.data.assignedTo,isActive:true}}))return NextResponse.json({error:"Staff member not found."},{status:404});
  const staff=await db.staffMember.findUnique({where:{userId:user.id}});
  const updated=await db.supportTicket.update({where:{id:ticketId},data:{...(parsed.data.status?{status:parsed.data.status}:{}),...(parsed.data.assignedTo!==undefined?{assignedTo:parsed.data.assignedTo}:{}),...(parsed.data.assignedTo&&!parsed.data.status?{status:"ASSIGNED"}:{})}});
  if(parsed.data.note&&staff)await db.ticketNote.create({data:{ticketId,staffId:staff.id,body:parsed.data.note}});
  if(staff)await db.staffActivityLog.create({data:{staffId:staff.id,action:"ticket.updated",targetType:"support_ticket",targetId:ticketId}});
  return NextResponse.json({ticket:updated});
 } catch{return NextResponse.json({error:"Could not update ticket."},{status:503});}
}
