import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { canvas: "#09090d", panel: "#111118", violet: "#8b5cf6", mint: "#65e6bd" }, boxShadow: { glow: "0 0 48px rgba(139,92,246,.18)" } } }, plugins: [] };
export default config;
