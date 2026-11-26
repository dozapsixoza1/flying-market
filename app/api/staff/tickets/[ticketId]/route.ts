import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/authorize";
const schema = z.object({ status: z.enum(["OPEN","ASSIGNED","IN_PROGRESS","WAITING","RESOLVED","CLOSED"]).optional(), assignedTo: z.string().nullable().optional(), note: z.string().trim().min(1).max(2000).optional() });
export async function PATCH(request: NextRequest, context: {params:Promise<{ticketId:string}>}) {
  const access = await requirePermission("tickets.assign");
  if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: access.status });
  const {ticketId}=await context.params;
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Invalid update."},{status:400});
  try {
    const ticket=await db.supportTicket.findUnique({where:{id:ticketId}});
    if(!ticket) return NextResponse.json({error:"Not found."},{status:404});
    const staff=await db.staffMember.findUnique({where:{userId:access.user.id}});
    if(parsed.data.assignedTo && !await db.staffMember.findFirst({where:{id:parsed.data.assignedTo,isActive:true}})) return NextResponse.json({error:"Staff member not found."},{status:404});
    const updated=await db.supportTicket.update({where:{id:ticketId},data:{...(parsed.data.status?{status:parsed.data.status}:{}),...(parsed.data.assignedTo!==undefined?{assignedTo:parsed.data.assignedTo}:{}),...(parsed.data.assignedTo && !parsed.data.status?{status:"ASSIGNED"}:{})}});
    if(parsed.data.note && staff) await db.ticketNote.create({data:{ticketId,staffId:staff.id,body:parsed.data.note}});
    if(staff) await db.staffActivityLog.create({data:{staffId:staff.id,action:"ticket.updated",targetType:"support_ticket",targetId:ticketId}});
    return NextResponse.json({ticket:updated});
  } catch { return NextResponse.json({error:"Could not update ticket."},{status:503}); }
}
