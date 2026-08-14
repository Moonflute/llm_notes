import { contentMetadataSchema } from "@/lib/schemas/content";
import { sources } from "@/lib/content";

export type ContentStatus = "verified" | "study-guide" | "draft" | "index" | "needs-review";
export type ContentDepth = "full" | "partial" | "stub";
export type ContentMetadata = {
  status: ContentStatus;
  lastReviewed?: string;
  contentDepth: ContentDepth;
  sourcesVerified: boolean;
};

export function buildContentMetadata({
  status,
  contentDepth,
  sourceIds,
  lastReviewed,
}: {
  status: ContentStatus;
  contentDepth: ContentDepth;
  sourceIds: string[];
  lastReviewed?: string;
}): ContentMetadata {
  const linked = sourceIds.map(id => sources.find(source => source.id === id)).filter(Boolean);
  const sourcesVerified = linked.length === sourceIds.length && linked.length > 0 && linked.every(source => source?.validationStatus === "claim-verified");
  const latestSourceReview = linked.map(source => source?.verificationDate).filter((date): date is string => Boolean(date)).sort().at(-1);
  return contentMetadataSchema.parse({ status, contentDepth, sourcesVerified, lastReviewed: lastReviewed ?? latestSourceReview });
}

export const contentStatusLabels: Record<ContentStatus, string> = {
  verified: "검증 완료",
  "study-guide": "학습 가이드",
  draft: "편집·검증 중",
  index: "개념 색인",
  "needs-review": "출처 재검토 필요",
};

export const contentDepthLabels: Record<ContentDepth, string> = {
  full: "전체 학습 문서",
  partial: "부분 문서",
  stub: "색인 수준",
};
