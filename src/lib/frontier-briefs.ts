export type FrontierBrief={definition:string;context:string[];mechanisms:string[];state:string;limits:string[];openQuestions:string[]};

export const frontierBriefs:Record<string,FrontierBrief>={
  multimodality:{
    definition:"텍스트, 이미지, 음성, 영상처럼 통계 구조가 다른 입력과 출력을 하나의 모델 또는 연결된 모델 시스템에서 함께 처리하는 연구 영역이다.",
    context:["초기 접근은 강한 vision encoder와 language model을 projector나 cross-attention으로 연결했다.","이후에는 여러 modality token을 같은 backbone에서 처리하거나 입력부터 출력을 함께 생성하는 native multimodal 설계가 확대됐다."],
    mechanisms:["modality별 tokenizer/encoder가 raw signal을 token 또는 latent로 바꾼다.","projector, cross-attention 또는 shared Transformer가 modality 사이 정보를 정렬한다.","generation head나 decoder가 text·pixel/latent·audio token을 modality별 방식으로 복원한다."],
    state:"2026년의 핵심은 modality 개수보다 perception 정확도, 시간·공간 grounding, 긴 video/audio 처리, 실시간 상호작용과 안전성이다.",
    limits:["language benchmark 성능이 visual counting·OCR·spatial relation의 정확성을 보장하지 않는다.","서로 다른 modality의 학습 데이터 규모와 품질이 불균형하며 evaluation도 text보다 덜 표준화돼 있다."],
    openQuestions:["공통 token space가 모든 modality에 가장 좋은가?","실시간 multimodal agent의 지연과 안전을 어떻게 동시에 보장할 것인가?"]
  },
  agents:{
    definition:"언어 모델이 목표를 해석하고 도구를 선택·호출하며 결과를 관찰해 다음 행동을 결정하는 반복 실행 시스템이다.",
    context:["ReAct는 reasoning trace와 action/observation을 번갈아 쓰는 패턴을 명확히 했다.","function calling과 structured output이 제품 API에 들어오며 도구 interface가 prompt convention에서 typed contract로 발전했다."],
    mechanisms:["planner 또는 model policy가 현재 state에서 action을 고른다.","runtime이 permission과 schema를 검증하고 실제 tool을 실행한다.","observation을 state에 넣고 종료 조건, retry, approval 또는 rollback을 판단한다."],
    state:"모델 단독의 자율성보다 sandbox, 최소 권한, tracing, checkpoint와 human approval를 갖춘 bounded workflow가 실용 중심이다.",
    limits:["긴 horizon에서 오류와 비용이 누적되고 외부 콘텐츠의 prompt injection이 action을 왜곡할 수 있다.","agent benchmark는 실제 조직의 권한·예외·legacy UI를 충분히 재현하지 못한다."],
    openQuestions:["장기 작업의 진행 상태를 어떤 representation으로 안전하게 저장할 것인가?","모델과 scaffold의 기여를 재현 가능하게 분리할 수 있는가?"]
  },
  "world-models":{
    definition:"관찰과 행동으로부터 환경의 잠재 상태와 시간에 따른 변화를 학습해 미래를 예측하거나 그 안에서 계획·policy 학습을 수행하는 모델이다.",
    context:["Ha와 Schmidhuber의 World Models는 visual observation을 압축하고 recurrent dynamics 안에서 policy를 훈련하는 구성을 제시했다.","후속 model-based RL은 uncertainty, stochastic latent dynamics와 imagined rollout의 품질을 개선했고 video generation과 embodied planning이 다시 영역을 연결했다."],
    mechanisms:["encoder가 고차원 관찰을 latent state로 압축한다.","dynamics model이 action을 조건으로 다음 latent 또는 그 분포를 예측한다.","decoder·reward model·policy가 reconstruction, planning 또는 imagined trajectory 학습에 사용된다."],
    state:"거대한 video model을 곧바로 세계를 이해하는 일반 world model로 부르기보다 action-conditioned prediction, controllability와 planning transfer를 검증해야 한다.",
    limits:["관찰을 그럴듯하게 생성하는 것과 물리적·인과적으로 정확한 dynamics를 학습하는 것은 다르다.","model error가 rollout 길이에 따라 누적돼 policy가 현실에 없는 허점을 이용할 수 있다."],
    openQuestions:["텍스트 지식과 물리적 interaction의 dynamics를 어떻게 결합할 것인가?","open-world에서 uncertainty를 calibration하고 잘못된 상상을 계획에서 배제할 수 있는가?"]
  },
  agi:{
    definition:"넓은 범위의 인지 과제를 학습·수행하는 시스템을 가리키는 논쟁적 용어이며, 성능·일반성·자율성·사회적 영향의 정의가 하나로 합의돼 있지 않다.",
    context:["Turing test부터 인간 수준 경제 업무, 학습 효율, 일반 problem solving까지 서로 다른 정의가 사용됐다.","Levels of AGI 같은 framework는 breadth와 depth를 단계화하고 autonomy를 별도 deployment 속성으로 다루려 한다."],
    mechanisms:["AGI는 단일 architecture mechanism이 아니라 capability를 분류하는 개념이다.","측정하려면 domain set, 인간 baseline, 도구·시간 조건과 novelty를 명시해야 한다.","deployment risk는 capability뿐 아니라 access, autonomy, replication과 사회 제도에 좌우된다."],
    state:"특정 회사의 선언보다 어떤 과제 범위에서 어떤 조건으로 사람 대비 어느 수준인지 쓰는 것이 더 검증 가능하다.",
    limits:["benchmark 통과가 consciousness, 의도 또는 인간과 같은 이해를 증명하지 않는다.","정의 선택에는 학술 목적뿐 아니라 경제·정책적 가치 판단이 들어간다."],
    openQuestions:["일반성을 평가할 domain과 인간 기준을 누가 갱신할 것인가?","빠른 capability 변화와 느린 사회 제도의 간극을 어떻게 관리할 것인가?"]
  },
  robotics:{
    definition:"perception, language instruction, planning과 motor action을 닫힌 feedback loop로 결합해 물리 환경에서 과업을 수행하는 embodied AI 영역이다.",
    context:["robot policy는 오랫동안 task별 imitation·reinforcement learning과 control stack으로 개발됐다.","vision-language pretraining을 robot trajectory와 결합한 VLA model은 web-scale semantic knowledge를 action에 전이하려는 흐름을 만들었다."],
    mechanisms:["camera·proprioception 등 observation을 encoder가 표현한다.","policy가 language goal과 state에서 discrete/continuous action을 예측한다.","controller와 safety layer가 action을 실제 actuator 명령으로 바꾸고 새 observation으로 loop를 닫는다."],
    state:"데모의 semantic flexibility와 실제 현장의 reliability, cycle time, recovery, hardware variation을 분리 평가하는 것이 핵심이다.",
    limits:["물리 행동은 실패 비용이 크고 데이터 수집이 비싸며 robot embodiment가 달라지면 policy transfer가 어렵다.","simulation success가 contact, latency와 sensor noise가 있는 현실로 그대로 전이되지 않는다."],
    openQuestions:["다양한 embodiment 사이에 재사용 가능한 action representation이 가능한가?","open-world에서 안전한 exploration과 실패 복구를 어떻게 학습할 것인가?"]
  },
  "scientific-discovery":{
    definition:"문헌 탐색, 가설·분자·실험 설계, 도구 제어와 결과 해석에 AI를 사용해 과학 workflow의 일부를 가속하거나 자동화하는 영역이다.",
    context:["AlphaFold 같은 domain model은 명확한 구조 예측 문제에서 큰 진전을 보였다.","Coscientist 같은 system은 LLM을 검색·코드·실험 장비와 연결해 화학 과제를 수행하는 agentic workflow를 탐색했다."],
    mechanisms:["domain data와 constraint로 후보 또는 예측을 만든다.","retrieval·simulation·formal tool 또는 laboratory가 후보를 검증한다.","active learning loop가 관측 결과로 다음 실험의 information gain을 높이려 한다."],
    state:"문장 형태의 그럴듯한 가설보다 실험적으로 검증되고 재현되는 결과, baseline 대비 시간·비용 절감이 핵심 지표다.",
    limits:["LLM이 존재하지 않는 논문·수치·mechanism을 만들어내면 연구 비용과 안전 위험이 커진다.","한 실험실의 자동화 성공이 새로운 과학적 발견의 일반 능력을 뜻하지 않는다."],
    openQuestions:["negative result와 tacit laboratory knowledge를 어떻게 데이터화할 것인가?","모델이 제안한 발견의 기여·책임·재현성을 어떻게 기록할 것인가?"]
  },
  "generative-media":{
    definition:"텍스트나 다른 조건에서 이미지·음성·음악·영상을 생성·편집·변환하는 모델과 제작 도구의 영역이다.",
    context:["GAN과 autoregressive model 이후 diffusion model이 고품질 image generation의 중심이 됐다.","latent diffusion과 multimodal conditioning, video diffusion/flow 계열이 해상도·길이·편집 가능성을 확장했다."],
    mechanisms:["condition encoder가 prompt·image·audio를 representation으로 바꾼다.","generator가 pixel, latent 또는 discrete token 분포를 반복적/자기회귀적으로 생성한다.","decoder와 post-processing이 media를 복원하고 watermark/provenance layer가 출처 정보를 붙일 수 있다."],
    state:"품질 경쟁과 함께 일관된 character/scene, 긴 video의 시간적 coherence, controllable editing, rights와 provenance가 주요 과제다.",
    limits:["미학적 선호 metric과 실제 사용자 평가가 잘 맞지 않을 수 있다.","watermark와 detector는 변환·재압축·새 generator에 취약할 수 있다."],
    openQuestions:["학습 데이터 권리와 창작자 보상을 어떤 기술·시장 구조로 연결할 것인가?","합성 media임을 표시하면서 privacy와 표현의 자유를 보존할 수 있는가?"]
  },
  interpretability:{
    definition:"모델의 activation, weight와 계산 경로를 분석해 특정 입력에서 왜 그런 출력이 나왔는지, 어떤 내부 feature와 circuit이 행동에 인과적으로 기여하는지 연구하는 영역이다.",
    context:["attention visualization과 probing은 상관관계를 보여 주지만 원인 설명에는 부족하다.","activation patching, causal intervention, circuit analysis와 sparse autoencoder가 더 세분화된 feature와 mechanism을 찾는 데 사용된다."],
    mechanisms:["probe와 attribution이 후보 component를 찾는다.","activation patching·ablation·steering이 후보의 인과적 영향을 시험한다.","sparse autoencoder는 activation을 더 많은 sparse feature의 조합으로 근사해 neuron보다 단일 의미에 가까운 분석 단위를 찾으려 한다."],
    state:"Claude 3 Sonnet 규모에서 SAE feature를 추출한 연구는 scaling 가능성을 보였지만 완전한 model 이해나 안전성 보장은 아니다.",
    limits:["feature label은 사람이 표본 activation을 보고 붙인 해석이며 모든 context에서 같은 의미인지 보장되지 않는다.","reconstruction loss와 sparsity 선택이 원 model 정보를 일부 잃고 발견되는 feature를 바꾼다."],
    openQuestions:["발견한 circuit이 distribution shift에서도 같은 인과 역할을 하는가?","부분적 해석을 실제 위험 탐지와 model control의 신뢰할 수 있는 보증으로 연결할 수 있는가?"]
  }
};

export const getFrontierBrief=(slug:string)=>frontierBriefs[slug];
