import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TelegramSession } from "@/components/telegram-session";
export const metadata: Metadata = { title: "FLYING MARKET — Gaming marketplace", description: "Discover game items, digital goods and trusted sellers." };
export const viewport: Viewport = { themeColor: "#09090d", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="ru"><body><Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive"/><TelegramSession/>{children}</body></html>;
}
