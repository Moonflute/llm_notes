import type {SemanticForm} from "@/components/home/knowledge-city-types";

export type SemanticDefinition={form:SemanticForm;meaning:string;spatialReason:string};

export const semanticDefinitions:Record<string,SemanticDefinition>={
  concepts:{form:"campus",meaning:"개념을 학습하고 연구하는 지식 체계",spatialReason:"중정과 여러 연구 wing이 하나의 학술 단지를 이룬다."},
  foundations:{form:"library",meaning:"다른 개념이 의존하는 기초 표현",spatialReason:"낮고 넓은 foundational library가 지식의 기반을 나타낸다."},
  architecture:{form:"institute",meaning:"모델 내부 구성 요소의 결합",spatialReason:"중앙 연구소와 연결 wing이 구성 요소의 결합을 나타낸다."},
  training:{form:"workshop",meaning:"데이터와 연산으로 모델을 생산하는 과정",spatialReason:"반복 작업 bay가 있는 workshop complex로 생산 과정을 표현한다."},
  "post-training":{form:"refinery",meaning:"기본 모델의 행동을 정렬하고 정제",spatialReason:"본체와 refinement annex를 잇는 구조로 후처리 단계를 표현한다."},
  inference:{form:"operations",meaning:"학습된 모델을 실제 요청에 제공",spatialReason:"terminal과 control room이 서빙·운영의 성격을 표현한다."},
  "retrieval-agents":{form:"archive-bridge",meaning:"외부 지식과 도구를 모델에 연결",spatialReason:"archive와 control hub를 잇는 bridge가 retrieval 흐름을 표현한다."},
  multimodal:{form:"multiwing",meaning:"서로 다른 modality를 하나의 모델에서 결합",spatialReason:"서로 다른 wing이 중앙 core에 연결된다."},
  "evaluation-safety":{form:"checkpoint",meaning:"능력과 위험을 측정하고 통제",spatialReason:"통과 지점과 검사 gate로 평가·안전을 표현한다."},
  transformer:{form:"modular-stack",meaning:"동일 block의 반복 적층",spatialReason:"같은 모듈이 간격을 두고 직렬로 쌓인다."},
  attention:{form:"attention-hub",meaning:"여러 token 관계를 선택적으로 결합",spatialReason:"중앙 hall과 여러 방향 wing의 연결로 관계 집계를 표현한다."},
  "mixture-of-experts":{form:"router-wings",meaning:"router가 일부 expert를 선택",spatialReason:"중앙 routing hub와 분리된 expert wing으로 선택 구조를 표현한다."},
  "retrieval-augmented-generation":{form:"archive-bridge",meaning:"외부 저장소에서 검색한 정보를 생성 모델에 전달",spatialReason:"archive와 model block 사이의 물리적 bridge가 retrieval 경로를 드러낸다."},
  "kv-cache":{form:"memory-warehouse",meaning:"이전 attention key/value를 저장해 재사용",spatialReason:"반복 선반형 annex가 누적 메모리를 표현한다."},
  "inference-serving":{form:"operations",meaning:"요청 batching·memory·throughput을 운영",spatialReason:"여러 platform이 연결된 serving terminal로 표현한다."},
  quantization:{form:"compression-steps",meaning:"수치 표현을 더 적은 bit로 압축",spatialReason:"같은 덩어리가 단계적으로 작아지는 형태가 압축을 표현한다."},
  models:{form:"lineage",meaning:"모델 family와 세대 계보",spatialReason:"공유 podium에서 서로 다른 세대 구조가 증축된다."},
  history:{form:"rail-axis",meaning:"시간에 따른 연속과 분기",spatialReason:"도시를 가로지르는 rail/boulevard가 시간의 선형성을 표현한다."},
  organizations:{form:"headquarters",meaning:"연구와 제품을 만든 기관",spatialReason:"서로 다른 기관 archetype의 campus와 headquarters로 표현한다."},
  issues:{form:"forum",meaning:"합의되지 않은 주장과 trade-off",spatialReason:"열린 civic forum이 논쟁과 비교를 위한 공간을 만든다."},
  "open-weights":{form:"open-structure",meaning:"공개 범위가 서로 다른 개방성",spatialReason:"외피가 열린 구조와 닫힌 archive를 나란히 둔다."},
  "long-context-vs-rag":{form:"dual-system",meaning:"긴 입력과 외부 검색이라는 두 접근",spatialReason:"긴 선형 구조와 연결형 archive를 병치한다."},
  "training-data":{form:"library",meaning:"학습 자료의 수집·보관·권리",spatialReason:"출처를 보관하는 archive/library로 표현한다."},
  "agents-reliability":{form:"branch-control",meaning:"분기하는 agent 행동과 checkpoint",spatialReason:"branch path와 control gate가 자율성과 통제를 함께 보여준다."},
  frontiers:{form:"observatory",meaning:"아직 확정되지 않은 연구 최전선",spatialReason:"도시 가장자리의 관측·실험 단지가 미지의 방향을 바라본다."},
};

export function semanticFormFor(id:string,fallback:SemanticForm):SemanticForm{return semanticDefinitions[id]?.form??fallback}
