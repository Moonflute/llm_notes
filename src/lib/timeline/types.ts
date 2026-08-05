export type TimelineEntityType = "model_release" | "research" | "method" | "product" | "organization_event" | "policy" | "industry" | "benchmark";
export type DatePrecision = "year" | "month" | "day";
export type HistoricalDateKind = "paper_published" | "announced" | "preview_started" | "api_released" | "product_released" | "weights_released" | "general_availability";
export type ReleaseMode = "paper" | "api" | "weights" | "product";
export type TimelineRelationType = "next_release" | "predecessor" | "influenced_by" | "implements" | "used_by_product" | "organization_transition" | "branch" | "merge";
export type RelationEvidence = "direct" | "documented" | "editorial";

export interface HistoricalDate { value: string; precision: DatePrecision; kind: HistoricalDateKind; sourceIds: string[]; noteKo?: string }
export interface TimelineNode { id: string; slug: string; entityType: TimelineEntityType; titleKo: string; titleEn?: string; summaryKo: string; primaryDate: HistoricalDate; additionalDates: HistoricalDate[]; importance: 1 | 2 | 3; laneId: string; subLaneId?: string; organizationIds: string[]; modelFamilyId?: string; conceptIds: string[]; fieldIds: string[]; releaseMode?: ReleaseMode; sourceIds: string[]; status: "published" }
export interface TimelineLane { id: string; type: "organization" | "research" | "product" | "policy"; titleKo: string; titleEn?: string; order: number; colorToken: string; activeFrom?: string; activeTo?: string; organizationId?: string; collapsible: boolean }
export interface TimelineSubLane { id: string; laneId: string; titleKo: string; order: number; modelFamilyIds?: string[]; trackId?: string }
export interface TimelineRelation { id: string; fromId: string; toId: string; type: TimelineRelationType; evidence: RelationEvidence; sourceIds: string[]; noteKo?: string; visibleFromZoom: 1 | 2 | 3 }
export interface TimelineEra { id: string; titleKo: string; start: string; end: string; summaryKo: string; order: number; sourceIds: string[]; editorial: true }
export interface LayoutNode extends TimelineNode { x: number; y: number; labelBand: 0 | 1 | 2; labelVisible: boolean }
export type TimelineZoom = "overview" | "era" | "detail";
export interface TimelineFilters { org: string[]; track: TimelineEntityType[]; importance: 1 | 2 | 3; from?: string; to?: string; field: string[] }
export interface TimelineUrlState { view: "lineage" | "list"; zoom: TimelineZoom; selected?: string; era?: string; filters: TimelineFilters }