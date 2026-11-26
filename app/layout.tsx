import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "FLYING MARKET — Gaming marketplace", description: "Discover game items, digital goods and trusted sellers." };
export const viewport: Viewport = { themeColor: "#09090d", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }
