export type ConceptCluster={id:string;label:string;titleKo:string;description:string;conceptIds:string[]};

export const conceptClusters:ConceptCluster[]=[
  {id:"foundations",label:"FOUNDATIONS",titleKo:"기초 표현",description:"텍스트가 토큰과 벡터가 되고 모델 입력으로 구성되는 출발점",conceptIds:["tokenization","embedding","positional-encoding","context-window","prompt-design"]},
  {id:"architecture",label:"ARCHITECTURE",titleKo:"모델 구조",description:"Attention, Transformer, 희소 구조와 모델 크기를 결정하는 내부 구성",conceptIds:["attention","positional-encoding","transformer","mixture-of-experts","dense-vs-sparse","small-language-models"]},
  {id:"training",label:"TRAINING",titleKo:"사전학습과 적응",description:"데이터·연산·학습 목표에서 미세조정과 증류까지 이어지는 과정",conceptIds:["pretraining","scaling-laws","compute-optimal-training","data-quality","fine-tuning","instruction-tuning","synthetic-data","distillation","lora"]},
  {id:"post-training",label:"POST-TRAINING",titleKo:"정렬과 추론",description:"선호 최적화, 피드백 학습, 안전 원칙과 추론 능력의 형성",conceptIds:["rlhf","rlaif","constitutional-ai","dpo","reasoning"]},
  {id:"inference",label:"INFERENCE",titleKo:"추론과 서빙",description:"학습된 모델을 실제 요청에 빠르고 효율적으로 제공하는 기술",conceptIds:["quantization","kv-cache","inference-serving","speculative-decoding","long-context"]},
  {id:"retrieval-agents",label:"RETRIEVAL & AGENTS",titleKo:"검색과 에이전트",description:"외부 지식, 구조화된 도구, 반복 실행과 상태를 결합하는 시스템",conceptIds:["semantic-search","retrieval-augmented-generation","grounding","function-calling","structured-output","agents","agent-memory"]},
  {id:"multimodal",label:"MULTIMODAL",titleKo:"멀티모달",description:"텍스트와 이미지·음성 등 서로 다른 표현을 연결하는 모델",conceptIds:["multimodality","vision-language-models"]},
  {id:"evaluation-safety",label:"EVALUATION & SAFETY",titleKo:"평가와 안전",description:"능력과 실패를 측정하고 모델 행동을 의도에 맞추는 문제",conceptIds:["evaluation","hallucination","alignment"]},
];

const assigned=new Set(conceptClusters.flatMap(cluster=>cluster.conceptIds));
export const unclusteredConceptIds=(conceptIds:string[])=>conceptIds.filter(id=>!assigned.has(id));
