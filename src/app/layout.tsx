import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppVersion } from "@/components/app-version";
import { SiteHeader } from "@/components/site-header";
import { ReadingRail } from "@/components/reading-rail";
import "./globals.css";

const pretendard = localFont({ src: "./fonts/PretendardVariable.woff2", variable: "--font-pretendard", display: "swap", weight: "45 920" });

const assetPath = process.env.GITHUB_ACTIONS ? "/llm_notes" : "";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://moonflute.github.io/llm_notes"),
  applicationName: "LLM Note",
  title: { default: "LLM History | 생성형 AI의 흐름", template: "%s | LLM History" },
  description: "LLM과 생성형 AI의 역사·개념·논쟁을 원자료와 함께 탐색하는 한국어 지식 앱.",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: `${assetPath}/icons/llm-note-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${assetPath}/icons/llm-note-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${assetPath}/icons/llm-note-192.png`, sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "LLM Note", statusBarStyle: "default" },
  openGraph: { type: "website", locale: "ko_KR", title: "LLM History", description: "생성형 AI의 흐름을 원자료와 함께 탐색합니다." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko" className={pretendard.variable} suppressHydrationWarning><body><a className="skipLink" href="#main-content">본문으로 건너뛰기</a><SiteHeader />{children}<ReadingRail /><AppVersion /></body></html>;
}
