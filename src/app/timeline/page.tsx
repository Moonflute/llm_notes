import type { Metadata } from "next";
import { TimelinePageShell } from "@/components/timeline/timeline-page-shell";
export const metadata: Metadata = { title: "타임라인", description: "생성형 AI의 모델·연구·제품 변화를 가로형 계보 지도로 탐색합니다.", alternates: { canonical: "/timeline/" } };
export default function Timeline() { return <main id="main-content" className="directory timelineDirectory"><p className="sectionLabel">TIMELINE</p><h1>AI 역사 계보 지도</h1><p className="intro">시간의 흐름 속에서 연구·모델·제품이 어떻게 이어지고 갈라졌는지 탐색하세요. 노드를 선택하면 연결과 출처를 먼저 확인할 수 있습니다.</p><TimelinePageShell /></main> }