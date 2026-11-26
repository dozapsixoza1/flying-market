import { PrismaClient, StaffRole } from "@prisma/client";
const db = new PrismaClient();
const games = [
  ["cs2","Counter-Strike 2",["Skins","Cases","Services"]],
  ["roblox","Roblox",["Robux","Items","Services"]],
  ["minecraft","Minecraft",["Items","Servers","Services"]],
  ["fortnite","Fortnite",["V-Bucks","Cosmetics","Services"]],
  ["brawl-stars","Brawl Stars",["Gems","Accounts review required","Services"]],
  ["pubg-mobile","PUBG Mobile",["UC","Items","Services"]],
  ["genshin-impact","Genshin Impact",["In-game items","Services"]],
  ["valorant","VALORANT",["Points","Skins","Services"]],
  ["dota-2","Dota 2",["Items","Cosmetics","Services"]],
  ["steam","Steam",["Gift cards","Games","Digital goods"]],
  ["playstation","PlayStation",["Subscriptions","Gift cards","Games"]],
  ["xbox","Xbox",["Subscriptions","Gift cards","Games"]],
  ["standoff-2","Standoff 2",["Gold","Skins","Services"]],
  ["ea-sports-fc","EA SPORTS FC",["Points","Items","Services"]]
] as const;
const support = [["purchase","Проблема с покупкой"],["sale","Проблема с продажей"],["payments","Платежи и возвраты"],["report","Жалоба на пользователя"],["account","Аккаунт и профиль"],["game-items","Игровые товары"],["other","Другой вопрос"]] as const;
const permissions = [
 ["staff.read","View staff members"],["staff.manage","Manage staff members"],["roles.assign","Assign staff roles"],["tickets.read","View support tickets"],["tickets.reply","Reply to support tickets"],["tickets.assign","Assign tickets"],["tickets.close","Close tickets"],["listings.review","Moderate listings"],["reports.handle","Handle reports"],["orders.read","View orders"],["disputes.handle","Handle disputes"],["payments.read","View payment status"],["payments.manage","Manage provider payment settings"],["settings.manage","Manage platform settings"],["audit.read","View audit logs"],["private_chat.access","Access a specific order chat with a reason"]
] as const;
const grants: Record<StaffRole,string[]> = {
 OWNER: permissions.map(p=>p[0]),
 ADMIN: ["staff.read","tickets.read","tickets.reply","tickets.assign","tickets.close","listings.review","reports.handle","orders.read","disputes.handle","payments.read","audit.read"],
 MODERATOR: ["tickets.read","tickets.reply","listings.review","reports.handle","orders.read","disputes.handle"],
 HELPER: ["tickets.read","tickets.reply"]
};
async function main(){
 for(const [slug,name,cats] of games){
  const game=await db.game.upsert({where:{slug},create:{slug,name,sortOrder:games.findIndex(g=>g[0]===slug)},update:{name,isActive:true}});
  for(const label of cats){const catSlug=label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");await db.category.upsert({where:{gameId_slug:{gameId:game.id,slug:catSlug}},create:{gameId:game.id,name:label,slug:catSlug},update:{name:label,isActive:true}})}
 }
 for(const [slug,title] of support) await db.supportCategory.upsert({where:{slug},create:{slug,title},update:{title,isActive:true}});
 const faq = [
  ["safe-trading","Как проходит сделка?","Выберите активное объявление, создайте заказ и общайтесь с продавцом в чате заказа. Оплата станет доступна после подключения поддерживаемого платёжного провайдера. Не передавайте пароли и коды подтверждения.","orders"],
  ["listing-review","Почему объявление проходит модерацию?","Новые объявления проверяются перед публикацией. Это помогает исключить мошеннические, запрещённые и вводящие в заблуждение предложения.","listings"],
  ["contact-support","Как связаться с поддержкой?","Откройте Центр поддержки, выберите категорию, укажите тему и подробно опишите вопрос. Ответ сотрудника появится в переписке вашего тикета.","support"]
 ] as const;
 for(const [slug,title,body,category] of faq) await db.faqArticle.upsert({where:{slug},create:{slug,title,body,category,isPublished:true},update:{title,body,category,isPublished:true}});
 for(const [key,description] of permissions) await db.permission.upsert({where:{key},create:{key,description},update:{description}});
 for(const role of Object.keys(grants) as StaffRole[]){
  for(const key of grants[role]){
   const permission=await db.permission.findUniqueOrThrow({where:{key}});
   await db.rolePermission.upsert({where:{role_permissionId:{role,permissionId:permission.id}},create:{role,permissionId:permission.id},update:{}});
  }
 }
 console.log("Seeded games, categories, support categories and RBAC permissions.");
}
main().finally(()=>db.$disconnect());
