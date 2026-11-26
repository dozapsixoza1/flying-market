"use client";
import { useEffect } from "react";

declare global {
  interface Window { Telegram?: { WebApp?: { initData?: string; ready?: () => void; expand?: () => void } } }
}
export function TelegramSession() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.initData) return;
    webApp.ready?.();
    webApp.expand?.();
    void fetch("/api/auth/telegram", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: webApp.initData }) });
  }, []);
  return null;
}
