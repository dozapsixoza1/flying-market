import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getCurrentUser} from "@/lib/auth/session";

export async function GET(){
  const user=await getCurrentUser();
  if(!user||user.isBanned)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const payments=await db.paymentTransaction.findMany({
      where:{order:{OR:[{buyerId:user.id},{sellerId:user.id}]}},
      include:{order:{select:{publicId:true}}},
      orderBy:{createdAt:"desc"},
      take:100
    });
    return NextResponse.json({
      payments:payments.map(p=>({
        id:p.id,orderId:p.orderId,orderPublicId:p.order.publicId,
        provider:p.provider,status:p.status,amountMinor:p.amountMinor.toString(),
        currency:p.currency,createdAt:p.createdAt.toISOString()
      })),
      methods:{
        telegramStars:{enabled:false,label:"Telegram Stars",reason:"Подключение ожидает настройки платёжного оператора и проверки требований Telegram."},
        tonWallet:{enabled:false,label:"TON / Wallet",reason:"Будет подключено отдельным платёжным модулем позже."}
      }
    });
  }catch{
    return NextResponse.json({payments:[],configured:false,methods:{
      telegramStars:{enabled:false,label:"Telegram Stars"},
      tonWallet:{enabled:false,label:"TON / Wallet"}
    }});
  }
}
