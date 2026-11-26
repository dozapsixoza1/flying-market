import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 60 * 60
): TelegramWebAppUser | null {
  if (!initData || !botToken) return null;

  try {
    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");
    const authDate = Number(params.get("auth_date"));
    if (!receivedHash || !Number.isFinite(authDate)) return null;

    const now = Math.floor(Date.now() / 1000);
    if (authDate > now + 30 || now - authDate > maxAgeSeconds) return null;

    params.delete("hash");
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest();

    const providedHash = Buffer.from(receivedHash, "hex");
    if (providedHash.length !== calculatedHash.length) return null;
    if (!timingSafeEqual(providedHash, calculatedHash)) return null;

    const rawUser = params.get("user");
    if (!rawUser) return null;
    const user = JSON.parse(rawUser) as TelegramWebAppUser;
    if (!Number.isSafeInteger(user.id) || user.id <= 0 || !user.first_name) return null;

    return user;
  } catch {
    return null;
  }
}
