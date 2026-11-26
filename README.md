# FLYING MARKET

A global gaming marketplace foundation designed for a web app and Telegram Mini App.

## Stack
- Next.js 15 / React 19 / TypeScript
- Tailwind CSS
- PostgreSQL (Supabase-compatible) + Prisma
- Telegram Web App authentication with server-side initData validation
- Vercel-ready Next.js application

## Implemented modules
- Premium dark marketplace landing page and searchable catalog
- Games and category seed data
- Listing creation, details, seller shop profile and moderation queue
- User profiles, favorites and order history
- Atomic listing reservation when an order is created; pending orders can be cancelled to release a listing
- Buyer/seller order chat
- Support ticket creation, category routing, ticket replies, status changes and customer ratings
- Staff portal with OWNER, ADMIN, MODERATOR and HELPER roles
- Server-side RBAC permission checks and staff activity audit
- Reports, FAQ endpoint/page and support knowledge base foundation
- Telegram initData verification and signed HTTP-only session cookies
- CI workflow for Prisma validation, TypeScript checks and Next.js production build

## Local development
1. Copy `.env.example` to `.env.local`.
2. Configure PostgreSQL and Telegram environment variables.
3. Install dependencies: `npm install`.
4. Generate Prisma Client: `npm run db:generate`.
5. Apply the initial schema: `npm run db:push`.
6. Seed games, categories and role permissions: `npm run db:seed`.
7. Start development: `npm run dev`.

## Required environment variables
- `DATABASE_URL` — PostgreSQL pooled connection
- `DIRECT_URL` — direct PostgreSQL connection for Prisma schema operations
- `SESSION_SECRET` — random secret of at least 32 characters
- `TELEGRAM_BOT_TOKEN` — bot token used to validate Telegram initData
- `OWNER_TELEGRAM_ID` — numeric Telegram ID of the project owner
- `NEXT_PUBLIC_APP_URL` — deployed application URL

Supabase Storage keys can be added when listing images and support attachments are wired to object storage.

## Important production boundaries
- Do not deploy with placeholder secrets or expose service-role credentials in client code.
- The configured owner is bootstrapped only when their Telegram account signs in.
- Staff permissions are enforced server-side. The OWNER role cannot be assigned through the staff assignment endpoint.
- Staff access to a buyer/seller order conversation requires a dedicated permission, a specific reason and an audit record.
- Payment checkout intentionally returns an unconfigured response until a suitable provider, merchant account, compliance requirements and webhook verification are configured. No real payments or payouts are simulated.
- The application does not custody customer funds. Any future settlement flow must use eligible regulated payment providers.
- Prohibited goods include stolen credentials, malware, cheats and other unlawful items. Listings involving game accounts must be reviewed against the relevant platform terms.

## Current status
The code foundation and initial user-facing flows are committed. Supabase, Telegram bot settings, production secrets, file storage, payment-provider integration and a verified deployment are still configuration/deployment tasks; they are not claimed as completed.
