import {NextResponse} from "next/server";
import {db} from "@/lib/db";
export async function GET(){try{const articles=await db.fAQArticle.findMany({where:{isPublished:true},orderBy:{updatedAt:"desc"},take:100});return NextResponse.json({articles});}catch{return NextResponse.json({articles:[],configured:false});}}
