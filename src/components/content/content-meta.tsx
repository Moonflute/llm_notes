import { contentDepthLabels, contentStatusLabels, type ContentMetadata } from "@/lib/content-metadata";

export function ContentMeta({metadata}:{metadata:ContentMetadata}){
  return <p className="contentMeta">
    <span>상태: {contentStatusLabels[metadata.status]}</span>
    <span>깊이: {contentDepthLabels[metadata.contentDepth]}</span>
    <span>출처 문장 검증: {metadata.sourcesVerified?"완료":"미완료"}</span>
    <span>{metadata.lastReviewed?`최근 검토: ${metadata.lastReviewed}`:"최근 검토일 미기록"}</span>
  </p>;
}
