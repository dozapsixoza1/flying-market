# FLYING MARKET

Global gaming marketplace designed for a web app and Telegram Mini App.

## Stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth and Storage
- Prisma ORM
- Telegram Mini Apps SDK
- Vercel

## Product modules
Marketplace catalog, game/category management, listings, seller shops, profiles, orders, reviews, favorites, support tickets, staff portal, moderation, disputes and audit logs.

## Staff roles
- OWNER — protected project ownership and full control
- ADMIN — platform administration through explicit permissions
- MODERATOR — listing and report moderation
- HELPER — support ticket responses

Authorization must be enforced server-side. Staff access to private buyer/seller conversations is restricted to justified support or dispute cases and must be audited.

## Trust and compliance
Payments and payouts must use eligible payment providers. The platform must not hold customer funds or represent internal points as cash without the required legal basis. Prohibited listings include stolen credentials, malware, cheats and other unlawful goods. Account-related listings require review against the relevant platform terms.

## Local development
1. Copy `.env.example` to `.env.local`.
2. Add your own Supabase and Telegram configuration.
3. Run `npm install`.
4. Run `npm run dev`.

Never commit secrets. Database schema is an initial foundation and must be reviewed before production.
