import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const assetPath = process.env.GITHUB_ACTIONS ? "/llm_notes" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LLM Note",
    short_name: "LLM Note",
    description: "생성형 AI의 역사와 핵심 개념을 탐색하는 한국어 지식 앱.",
    start_url: `${assetPath}/`,
    scope: `${assetPath}/`,
    display: "standalone",
    background_color: "#f4f2ec",
    theme_color: "#f4f2ec",
    icons: [
      { src: `${assetPath}/icons/llm-note-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${assetPath}/icons/llm-note-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
