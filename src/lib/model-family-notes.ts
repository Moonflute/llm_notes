export type FamilyNote={background:string;shifts:string[];architecture:string;discontinuity:string};

export const modelFamilyNotes:Record<string,FamilyNote>={
  gpt:{
    background:"GPT 계열은 autoregressive pretraining을 큰 규모로 확장하고, 문맥 내 학습·대화형 post-training·멀티모달·추론 시간 연산과 도구 사용을 차례로 제품화한 OpenAI의 중심 계열이다.",
    shifts:["GPT-3는 별도 fine-tuning 없이 prompt의 예시로 과제를 바꾸는 few-shot 능력을 전면에 내세웠다.","GPT-4 세대는 이미지 입력과 전문 시험 평가를 통해 범용성과 멀티모달 방향을 강화했다.","o-series와 이후 통합 세대는 답을 즉시 생성하는 방식에서 reasoning effort와 도구 실행을 조절하는 시스템으로 무게중심을 옮겼다."],
    architecture:"GPT-3는 파라미터 규모와 학습 설정 일부가 논문에 공개됐지만 GPT-4 이후 핵심 architecture·parameter·training data 세부는 제한적으로만 공개됐다. 공개되지 않은 계보 연결은 추정하지 않는다.",
    discontinuity:"중요한 단절은 단순한 세대 번호 상승보다 chat post-training, native multimodality, test-time reasoning, agentic tool use가 각각 product behavior를 바꾼 지점에 있다."
  },
  gemini:{
    background:"Gemini는 Google DeepMind가 text·image·audio 등 여러 modality와 긴 context, product/API 통합을 하나의 family 아래 전개한 계열이다.",
    shifts:["초기 Gemini는 Ultra·Pro·Nano처럼 배포 규모를 나누고 multimodal 평가를 핵심 메시지로 삼았다.","1.5 세대 이후 긴 context가 연구 demo를 넘어 API 제품의 중요한 differentiator가 됐다.","2.x 세대에서는 reasoning, tool use와 실시간 multimodal interaction이 같은 제품 계열 안에서 결합됐다."],
    architecture:"세대별 기술 보고서가 mixture-of-experts 여부나 training·evaluation 일부를 설명하지만 전체 parameter와 dataset mixture가 항상 공개되는 것은 아니다. API context 한도와 research evaluation 조건을 구분한다.",
    discontinuity:"Gemini의 계보는 model checkpoint뿐 아니라 Google AI Studio·Vertex AI·consumer assistant에서 어떤 capability가 언제 제공됐는지 함께 봐야 한다."
  },
  claude:{
    background:"Claude는 Anthropic이 Constitutional AI, 긴 문맥, 문서 작업과 안전성 평가를 제품 정체성과 함께 발전시킨 closed-weight 모델 계열이다.",
    shifts:["Claude 3는 Haiku·Sonnet·Opus의 tier 구조와 vision input을 본격화했다.","Claude 4 세대는 coding과 agentic task, extended thinking 및 system card의 위험 평가가 계보 해석의 큰 축이 됐다.","후속 Sonnet 세대는 동일 family name 안에서도 coding·computer use·context와 product availability가 빠르게 갱신된다."],
    architecture:"Anthropic은 system card와 safety research를 비교적 상세히 공개하지만 model parameter, full training mixture와 core architecture의 많은 부분은 비공개다.",
    discontinuity:"모델 능력 발표와 별개로 controlled safety stress test 결과가 널리 논쟁된 점이 이 계열의 중요한 사건이다. 실제 배포 행동과 유도된 평가 상황을 반드시 구분한다."
  },
  llama:{
    background:"Llama는 Meta가 연구용 공개 weight에서 광범위한 개발·배포 생태계의 기반 모델로 확장한 계열이다.",
    shifts:["LLaMA 1은 비교적 작은 parameter budget과 많은 training token의 효율을 강조한 연구 release였다.","Llama 2는 상업 사용 조건을 포함한 공개와 chat model을 통해 ecosystem을 크게 넓혔다.","Llama 3/3.1은 더 큰 training mixture, multilingual·long-context·tool-oriented usage를 확장했고 Llama 4는 MoE와 multimodality를 계열 전면에 배치했다."],
    architecture:"weight를 받을 수 있어도 training data 전체와 pipeline이 모두 공개된 것은 아니다. 각 release license의 사용 제한과 acceptable-use 조건을 version별로 확인한다.",
    discontinuity:"dense decoder 공개 모델에서 multimodal sparse MoE family로 이동한 지점은 단순 parameter 증가보다 큰 architecture 변화다."
  },
  deepseek:{
    background:"DeepSeek 계열은 공개 기술 보고서와 weights를 통해 efficient MoE, MLA, cost-conscious training과 reasoning RL을 빠르게 확산시킨 중국계 모델 family다.",
    shifts:["DeepSeek-V2는 fine-grained expert routing과 MLA를 통해 parameter capacity와 KV cache 효율을 함께 다뤘다.","V3는 대규모 MoE training engineering과 공개된 비용·안정화 기법으로 주목받았다.","R1은 base architecture 계보 위에 verifiable task 중심 reinforcement learning과 공개 reasoning model을 결합했다."],
    architecture:"기술 보고서가 architecture와 training recipe를 비교적 많이 공개하지만 모든 data provenance와 실제 infrastructure cost의 회계 범위가 공개되는 것은 아니다.",
    discontinuity:"V3와 R1은 base model architecture의 진전과 post-training reasoning recipe의 진전을 분리해서 봐야 한다. R1의 의미를 새 Transformer architecture 하나로 설명하면 부정확하다."
  },
  mistral:{
    background:"Mistral 계열은 작은 dense model과 sparse MoE를 공개하며 효율적인 공개 weight 모델과 상업 API를 함께 전개했다.",
    shifts:["Mistral 7B는 grouped-query와 sliding-window attention을 사용한 작은 공개 모델의 효율을 강조했다.","Mixtral은 sparse MoE를 공개 weight 생태계에 널리 알렸다.","후속 계열은 multilingual, coding, multimodal과 enterprise deployment로 범위를 넓혔다."],
    architecture:"공개 weight release와 API-only release의 정보 수준이 다르므로 같은 회사 모델이라도 architecture·license·availability를 개별 확인해야 한다.",
    discontinuity:"dense 7B와 sparse Mixtral은 단순 크기 순서가 아니라 서로 다른 serving·memory trade-off를 가진 architecture 갈래다."
  },
  qwen:{
    background:"Qwen은 Alibaba Cloud가 multilingual language model에서 code, vision/audio와 다양한 parameter 규모의 공개 weight family로 확장한 계열이다.",
    shifts:["Qwen2는 multilingual·coding과 여러 크기의 공개 배포를 확장했다.","Qwen2.5 계열은 일반·code·math 및 multimodal 전문 variant를 넓혀 하나의 단일 checkpoint보다 family ecosystem 성격이 강해졌다.","후속 세대의 capability는 base/instruct, dense/MoE, modality와 license를 분리해 비교해야 한다."],
    architecture:"동일 Qwen 세대 안에서도 architecture와 context, license가 variant별로 다를 수 있다. 가장 큰 모델의 spec을 전체 family에 복사하지 않는다.",
    discontinuity:"세대 간 변화뿐 아니라 동일 시점에 병렬로 나오는 domain·modality 특화 branch가 계보의 핵심이다."
  },
  gemma:{
    background:"Gemma는 Google이 Gemini 연구·인프라의 일부 기술을 바탕으로 배포 가능한 open-weight model을 제공하는 별도 계열이다.",
    shifts:["초기 Gemma는 비교적 작은 규모와 local deployment를 중심으로 공개됐다.","후속 세대는 context, multilingual, vision과 parameter 선택 폭을 넓혔다.","Gemini와 이름·조직적 배경을 공유해도 동일 architecture나 capability라고 가정할 수 없다."],
    architecture:"model card와 technical report에 공개된 범위 안에서 parameter·training·safety evaluation을 기록하고 Gemini의 비공개 spec을 역으로 추정하지 않는다.",
    discontinuity:"Gemini는 closed product/API family, Gemma는 downloadable weight family라는 access와 ecosystem의 차이가 가장 큰 구분이다."
  }
};

export const getModelFamilyNote=(slug:string)=>modelFamilyNotes[slug];
