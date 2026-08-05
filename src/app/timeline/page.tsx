import type {Metadata} from "next";
import {TimelineExplorer} from "@/components/timeline/timeline-explorer";
export const metadata:Metadata={title:"타임라인",description:"2017년 Transformer부터 생성형 AI의 주요 사건을 조직·연도·종류별로 탐색합니다.",alternates:{canonical:"/timeline/"}};
export default function Timeline(){return <main id="main-content" className="directory"><p className="sectionLabel">TIMELINE</p><h1>타임라인</h1><p className="intro">연구·모델·제품의 주요 전환점을 필터로 좁히고, 관련 개념과 원자료로 이어집니다.</p><TimelineExplorer/></main>}