# Payment Center

## Current rollout

Payment execution is intentionally disabled. The application may store payment metadata, but it must not create invoices, accept funds, credit balances, release seller funds, or mark orders paid until a legally responsible adult operator has completed provider onboarding and compliance review.

## Provider roadmap

- Telegram Stars: first provider candidate for eligible digital goods and services. Use Telegram Bot API invoices in XTR only after the operator account, bot ownership, product eligibility, refund handling, and terms have been reviewed.
- TON / Wallet: future independent provider adapter. Wallet connectivity is not a Stars withdrawal route and must not be represented as one.
- Other providers: future adapters behind the same internal payment interface.

## Data model

PaymentTransaction stores provider, status, amount in minor units, currency, an idempotency key, and provider reference. Provider callbacks must be authenticated, idempotent, and reconciled against the original order amount and currency. Never trust client-supplied payment success.

## Required before activation

1. Adult-operated merchant/provider accounts and ownership verification.
2. Provider terms, regional availability, taxes, refunds, and consumer-protection review.
3. Server-side invoice creation and signed/authenticated provider callback verification.
4. Atomic payment/order state transitions with idempotency and audit logs.
5. Separate seller payout process through an authorized provider; no internal stored-value wallet or Stars-to-crypto conversion.
6. Test-mode verification before any production switch.

No secrets belong in source control or chat. Configure credentials only in the deployment provider's encrypted environment-variable settings.
