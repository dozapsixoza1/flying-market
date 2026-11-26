import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/lib/db";
import {requirePermission} from "@/lib/rbac/authorize";
const schema=z.object({status:z.enum(["REVIEWING","RESOLVED","DISMISSED"])});
export async function PATCH(request:NextRequest,context:{params:Promise<{reportId:string}>}){const access=await requirePermission("reports.handle");if(!access.ok)return NextResponse.json({error:"Forbidden"},{status:access.status});const {reportId}=await context.params;const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid report status."},{status:400});try{const report=await db.report.update({where:{id:reportId},data:{status:parsed.data.status,handledBy:access.user.id}});const staff=await db.staffMember.findUnique({where:{userId:access.user.id}});if(staff)await db.staffActivityLog.create({data:{staffId:staff.id,action:"report.handled",targetType:"report",targetId:reportId,reason:parsed.data.status}});return NextResponse.json({report});}catch{return NextResponse.json({error:"Report not found."},{status:404});}}
