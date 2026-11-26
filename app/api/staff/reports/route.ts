import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {requirePermission} from "@/lib/rbac/authorize";
export async function GET(){const access=await requirePermission("reports.handle");if(!access.ok)return NextResponse.json({error:"Forbidden"},{status:access.status});try{const reports=await db.report.findMany({orderBy:{createdAt:"asc"},take:100});return NextResponse.json({reports});}catch{return NextResponse.json({reports:[],configured:false});}}
