export type IssuePosition={title:string;argument:string;evidence:string};
export type IssueBrief={question:string;consensus:string[];positions:IssuePosition[];evaluation:string[];limitations:string[];currentState:string;openQuestions:string[]};

export const issueBriefs:Record<string,IssueBrief>={
  reasoning:{
    question:"추론 토큰과 강화학습으로 높아진 문제 해결 성능을 일반적이고 신뢰할 수 있는 추론 능력으로 볼 수 있는가?",
    consensus:["추론 시간의 연산을 늘리면 일부 수학·코딩·검증 가능한 과제의 정답률이 개선될 수 있다.","효과는 과제, sampling, budget과 verifier 품질에 따라 달라지며 더 긴 출력 자체가 정확성을 보장하지 않는다."],
    positions:[
      {title:"능력의 실질적 확장",argument:"학습 후에도 compute budget을 조절해 더 어려운 문제를 풀 수 있으므로 기존 next-token model의 사용 방식보다 중요한 확장이다.",evidence:"공식 모델 보고서와 공개 reasoning model 연구는 수학·코드처럼 자동 검증 가능한 평가에서 추가 compute에 따른 개선을 보고한다."},
      {title:"평가와 표현의 취약성",argument:"보이는 chain-of-thought가 실제 내부 인과 과정과 같지 않을 수 있고 benchmark 형식에 특화된 전략일 수 있다.",evidence:"정답과 설명의 faithfulness는 별도 측정이 필요하며, 같은 모델도 prompt·sampling·budget에서 큰 분산을 보인다."}
    ],
    evaluation:["정답률과 pass@k를 token budget별 곡선으로 측정한다.","정답을 모르는 상태의 calibration과 abstention을 측정한다.","중간 설명을 교란·편집했을 때 결과가 어떻게 바뀌는지 faithfulness를 평가한다.","훈련 분포와 다른 문제 변형·새 데이터로 일반화를 검사한다."],
    limitations:["closed model의 post-training 데이터와 reward는 대개 충분히 공개되지 않는다.","benchmark 오염과 채점 모델 편향을 완전히 배제하기 어렵다."],
    currentState:"2026년 현재 reasoning effort와 test-time compute는 주요 제품 축이지만, 비용 증가와 신뢰성 개선의 관계는 과제별로 측정해야 한다.",
    openQuestions:["verifiable reward 밖의 개방형 과제에도 같은 개선이 일반화되는가?","짧고 정확한 내부 계산과 길고 설득적인 설명을 어떻게 구분할 것인가?"]
  },
  "open-weights":{
    question:"가중치를 내려받을 수 있는 모델을 어느 범위까지 ‘오픈’이라고 부를 수 있는가?",
    consensus:["weights 공개, source code 공개, training data 공개, 재현 가능한 recipe와 자유로운 license는 서로 다른 조건이다.","모델 카드나 repository의 ‘open’ 표기만으로 재배포·상업 이용·파생 모델 배포 권리를 판단할 수 없다."],
    positions:[
      {title:"접근성과 분산 혁신",argument:"weights 접근은 독립 연구, on-device 배포, fine-tuning과 감사 가능성을 넓힌다.",evidence:"공개 weight 생태계에서는 다양한 quantization·serving·domain adaptation이 빠르게 개발된다."},
      {title:"불완전한 투명성과 위험 이전",argument:"데이터와 training code가 비공개면 결과를 완전히 재현하거나 provenance를 감사하기 어렵고, 배포 위험이 downstream 사용자에게 넘어간다.",evidence:"여러 license가 사용 규모·분야·재배포에 서로 다른 제약을 두며 model artifact만으로 학습 과정을 복원할 수 없다."}
    ],
    evaluation:["weights·code·data·recipe·evaluation·license를 별도 열로 표시한다.","license 원문과 model card revision을 보관한다.","재현은 exact reproduction과 결과 수준의 reproducibility를 구분한다."],
    limitations:["법적 해석은 관할과 사용 방식에 따라 달라 전문 자문이 필요하다.","공개 데이터 목록이 실제 전체 training mixture를 증명하지 않을 수 있다."],
    currentState:"오픈 웨이트는 유용한 기술 범주지만 오픈소스의 모든 권리와 재현성을 자동 포함하지 않는다는 구분이 점점 중요해졌다.",
    openQuestions:["안전 평가와 데이터 provenance를 어느 수준까지 표준 공개할 것인가?","제한적 license 모델을 비교 표에서 어떤 명칭으로 일관되게 표시할 것인가?"]
  },
  hallucination:{
    question:"유창하지만 근거 없는 생성을 어떻게 정의·측정하고 실제 위험을 줄일 것인가?",
    consensus:["언어 모델의 likelihood 목적은 세계의 사실성을 직접 보장하지 않는다.","검색 근거, 도구와 검증기는 오류를 줄일 수 있지만 검색 실패·근거 오독·잘못된 인용이라는 새 실패도 만든다."],
    positions:[
      {title:"시스템 설계로 관리 가능",argument:"grounding, retrieval, constrained output, human review와 abstention을 결합하면 특정 업무의 위험을 실용 수준으로 낮출 수 있다.",evidence:"도메인이 제한되고 정답 근거와 검증 절차가 있는 workflow는 일반 대화보다 오류를 포착하기 쉽다."},
      {title:"생성 모델의 구조적 불확실성",argument:"개방형 생성에서 가능한 모든 사실을 확인하기 어렵고 모델 confidence가 실제 correctness와 잘 맞지 않을 수 있다.",evidence:"TruthfulQA 같은 평가는 모방 학습이 널리 퍼진 오개념을 재생할 수 있음을 보여 주지만 모든 도메인을 대표하지는 않는다."}
    ],
    evaluation:["atomic claim 단위로 source entailment를 판정한다.","answer correctness와 citation correctness를 분리한다.","시간 민감·고위험·긴 꼬리 질의를 포함한다.","모를 때 보류하는 selective accuracy와 calibration을 측정한다."],
    limitations:["hallucination의 taxonomy와 annotation 기준이 연구마다 다르다.","LLM judge를 쓰면 판정 모델의 오류와 편향이 결과에 들어간다."],
    currentState:"단일 환각 점수보다 업무별 허용 위험, 근거 추적과 human escalation을 설계하는 방향이 현실적이다.",
    openQuestions:["모델이 자신의 지식 경계를 안정적으로 인식하게 할 수 있는가?","긴 답변의 모든 claim을 비용 효율적으로 검증할 수 있는가?"]
  },
  "benchmark-saturation":{
    question:"높은 정적 benchmark 점수가 실제 환경의 새로운 문제 해결 능력을 얼마나 대표하는가?",
    consensus:["점수는 prompt, few-shot 예시, sampling, tool 사용과 채점 방식에 민감하다.","공개 문제가 training 데이터에 포함되거나 파생 문제가 유통되면 오염을 배제하기 어렵다."],
    positions:[
      {title:"표준화된 비교의 가치",argument:"동일 문제와 metric은 모델 세대 간 진전을 빠르게 추적하는 공통 언어를 제공한다.",evidence:"MMLU 같은 suite는 여러 분야를 같은 절차로 반복 평가할 수 있게 했다."},
      {title:"포화와 Goodhart의 법칙",argument:"업계가 leaderboard를 최적화하면 점수가 실제 목표보다 benchmark 특화와 오염을 반영할 수 있다.",evidence:"상위 모델의 점수 차가 작아질수록 문항 오류·채점 variance·prompt choice가 순위를 바꿀 수 있다."}
    ],
    evaluation:["비공개 holdout과 시간 순 forward evaluation을 사용한다.","점 추정치와 confidence interval, 여러 prompt의 variance를 보고한다.","capability와 reliability, latency·cost를 함께 제시한다.","실제 사용자 task의 end-to-end 성공률을 별도 측정한다."],
    limitations:["완전한 비오염을 증명하려면 training corpus 접근이 필요할 수 있다.","새 benchmark도 공개되는 순간 최적화 대상이 된다."],
    currentState:"2026년 모델 비교는 단일 평균점보다 contamination-resistant evaluation, agent task와 비용·지연을 함께 보는 방향이 필요하다.",
    openQuestions:["동적으로 새 문제를 생성하면서도 난이도와 채점 신뢰성을 보장할 수 있는가?","사람의 실제 가치와 benchmark를 어떻게 장기적으로 정렬할 것인가?"]
  },
  "training-data":{
    question:"대규모 학습 데이터의 수집·이용·보상·삭제 요구를 어떤 원칙과 법적 근거로 다룰 것인가?",
    consensus:["모델마다 corpus, filtering, license와 공개 수준이 다르다.","저작권, 개인정보, 계약과 데이터베이스 권리는 관할과 구체적 사용에 따라 달라진다."],
    positions:[
      {title:"변형적 학습과 공익",argument:"학습은 원문을 그대로 배포하는 것과 다르고 광범위한 데이터 접근이 연구와 표현 도구의 발전에 기여할 수 있다.",evidence:"모델은 통계적 parameter를 학습하며 많은 사용에서 원문 대신 새로운 출력을 만든다."},
      {title:"동의·보상·시장 대체",argument:"권리자 동의 없이 상업 모델에 작품을 사용하고 유사 출력을 만들면 통제와 보상 구조를 훼손할 수 있다.",evidence:"memorization과 스타일·내용 모방, 데이터 provenance 부재가 여러 소송과 정책 논쟁의 중심이다."}
    ],
    evaluation:["dataset provenance와 license category를 추적한다.","PII·민감 정보와 near-duplicate를 검사한다.","canary와 extraction attack으로 memorization을 측정한다.","opt-out·삭제 요청이 training snapshot과 downstream model에 어떻게 반영되는지 기록한다."],
    limitations:["법과 판례는 빠르게 변하므로 이 페이지는 법률 자문이 될 수 없다.","대규모 web corpus의 완전한 출처 목록을 사후 복원하기 어렵다."],
    currentState:"기술적 filtering만으로 끝나는 문제가 아니며 provenance, 계약, 투명성 보고와 관할별 검토가 함께 필요하다.",
    openQuestions:["학습 데이터 사용에 대한 실행 가능한 보상·라이선스 시장은 어떤 형태인가?","이미 학습된 모델에서 특정 데이터 영향을 제거했음을 어떻게 검증할 것인가?"]
  },
  "energy-and-compute":{
    question:"성능 확장을 위해 쓰는 학습·추론 자원의 비용과 환경 영향을 어떻게 비교하고 줄일 것인가?",
    consensus:["parameter count만으로 에너지나 배출을 계산할 수 없다.","hardware, utilization, precision, 데이터센터 전력원, 학습 token과 서비스 traffic이 모두 영향을 준다."],
    positions:[
      {title:"효율 향상이 수요를 상쇄",argument:"better hardware·algorithm·quantization·MoE와 serving으로 task당 에너지를 계속 낮출 수 있다.",evidence:"같은 품질에서 작은 모델과 낮은 precision, batching은 계산과 메모리를 줄일 수 있다."},
      {title:"반등 효과와 총수요",argument:"단위 비용이 내려가면 더 많은 요청과 더 큰 모델이 생겨 전체 자원 소비가 늘 수 있다.",evidence:"학습보다 장기간의 대규모 inference traffic이 총비용의 큰 부분이 될 수 있어 lifecycle 관점이 필요하다."}
    ],
    evaluation:["model training과 inference를 분리해 kWh와 hardware-hour를 보고한다.","지역·시간별 carbon intensity와 PUE 가정을 명시한다.","task quality당 energy/cost를 비교한다.","water와 embodied hardware impact 등 포함 범위를 밝힌다."],
    limitations:["기업별 측정 경계와 공개 지표가 일관되지 않다.","API 사용자는 실제 hardware와 utilization을 알기 어렵다."],
    currentState:"효율 benchmark는 raw FLOPs뿐 아니라 실제 workload의 품질·latency·throughput과 함께 공개돼야 비교 가능하다.",
    openQuestions:["표준화된 lifecycle disclosure를 어떻게 만들 것인가?","더 긴 reasoning compute의 사회적 편익과 추가 비용을 어떻게 평가할 것인가?"]
  },
  "safety-red-teaming":{
    question:"배포 전 평가와 공격적 테스트가 알려지지 않은 위험을 얼마나 발견하고 완화할 수 있는가?",
    consensus:["red teaming은 취약점을 발견하는 표본 조사이지 위험 부재의 증명이 아니다.","모델뿐 아니라 system prompt, tools, retrieval, permissions와 user interface를 함께 평가해야 한다."],
    positions:[
      {title:"구조화된 사전 완화",argument:"위협 모델과 전문 red team은 출시 전 심각한 실패를 찾아 policy·training·product safeguard에 반영할 수 있다.",evidence:"system card는 발견된 risk, evaluation과 mitigation을 문서화하는 통로를 제공한다."},
      {title:"범위와 재현성의 한계",argument:"비공개 절차와 선택된 결과만 공개되면 독립 검증이 어렵고 새로운 jailbreak·도구 조합을 모두 포착할 수 없다.",evidence:"adaptive attacker와 배포 후 distribution shift는 고정 evaluation을 빠르게 우회할 수 있다."}
    ],
    evaluation:["명시적 threat model과 severity rubric을 둔다.","독립 evaluator와 재현 가능한 prompt/환경을 확보한다.","adaptive multi-turn·tool abuse·권한 상승을 시험한다.","출시 후 incident와 near miss를 평가셋에 환류한다."],
    limitations:["공개 prompt가 방어를 우회하는 매뉴얼이 될 수 있어 투명성과 보안의 긴장이 있다.","희귀하지만 큰 피해 사건의 확률을 작은 sample로 추정하기 어렵다."],
    currentState:"red teaming은 release gate 하나가 아니라 배포 전후의 지속적 risk management 과정으로 보는 편이 타당하다.",
    openQuestions:["위험을 공개하면서 악용 가능성을 최소화할 표준은 무엇인가?","model capability가 빨리 변할 때 evaluator의 독립성과 역량을 어떻게 유지할 것인가?"]
  },
  "agents-reliability":{
    question:"LLM agent가 장기 작업에서 오류를 감지·복구하며 어느 정도 자율적으로 행동할 수 있는가?",
    consensus:["도구는 모델의 관찰과 행동 범위를 넓히지만 잘못된 호출의 실제 피해도 키운다.","step success가 높아도 긴 horizon에서는 작은 오류가 누적된다."],
    positions:[
      {title:"workflow 자동화의 실용성",argument:"범위가 좁고 도구 결과가 검증 가능하며 checkpoint와 human approval가 있으면 유용한 장기 작업을 자동화할 수 있다.",evidence:"코드·검색·데이터 처리처럼 결과를 실행·test할 수 있는 환경은 feedback loop를 제공한다."},
      {title:"자율성의 취약한 기반",argument:"planning, memory, prompt injection, 권한과 환경 오류가 결합되면 독립 실행의 신뢰성이 급격히 떨어진다.",evidence:"한 단계 성공률 p인 독립 단계 n개의 완전 성공 확률은 단순화하면 p^n으로 감소한다."}
    ],
    evaluation:["end-to-end task completion과 비용·시간을 측정한다.","도구 오류·악성 문서·권한 거부를 주입한다.","recovery, rollback과 human escalation 비율을 기록한다.","model과 scaffold contribution을 분리하는 ablation을 한다."],
    limitations:["agent benchmark의 sandbox가 실제 업무 권한·데이터·UI를 충분히 재현하지 못한다.","성공 여부를 자동 채점하기 어려운 open-ended task가 많다."],
    currentState:"완전 자율성보다 권한을 좁히고 관측·승인·복구를 설계한 bounded agent가 실제 배포의 핵심이다.",
    openQuestions:["장기 state가 오염됐음을 agent가 스스로 발견할 수 있는가?","서로 다른 도구와 조직 환경에 일반화되는 reliability metric은 무엇인가?"]
  },
  "long-context-vs-rag":{
    question:"많은 원문을 prompt에 직접 넣는 것과 필요한 근거를 검색해 넣는 것 중 언제 무엇이 유리한가?",
    consensus:["긴 context는 retrieval pipeline을 단순화할 수 있지만 입력 token 비용과 attention/cache 부담이 커진다.","RAG는 최신성·권한·인용에 유리할 수 있지만 retrieval miss와 chunking 오류를 만든다."],
    positions:[
      {title:"긴 context 우선",argument:"corpus가 작고 전체 구조·전역 비교가 중요하면 모델이 원문 전체를 직접 볼 수 있는 편이 낫다.",evidence:"검색 top-k가 버릴 수 있는 주변 문맥과 여러 문서 간 관계를 한 prompt에서 유지할 수 있다."},
      {title:"retrieval 우선",argument:"corpus가 크고 자주 바뀌며 근거 추적과 ACL이 중요하면 후보를 좁혀 주는 RAG가 효율적이다.",evidence:"질의별 관련 문서만 넣어 token 비용을 줄이고 index metadata로 version과 권한을 관리할 수 있다."}
    ],
    evaluation:["answer quality와 citation correctness를 동일 corpus에서 비교한다.","retrieval recall과 generation error를 분리한다.","input token cost, TTFT, cache hit와 update latency를 측정한다.","질의 유형별 routing 또는 hybrid 전략을 평가한다."],
    limitations:["명목 context 길이와 실제 장거리 정보 이용 능력은 다르다.","RAG 결과는 embedding·index·reranker와 corpus 품질에 강하게 의존한다."],
    currentState:"둘은 대체재라기보다 workload에 따라 결합하는 선택지다. 작은 핵심 문서는 long context, 큰 동적 corpus는 retrieval을 쓰는 hybrid가 흔한 설계다.",
    openQuestions:["질의마다 full-context와 retrieval을 자동 선택하는 신뢰할 수 있는 router는 가능한가?","긴 context에서 근거 위치 편향을 어떻게 줄일 것인가?"]
  },
  "multimodal-safety":{
    question:"이미지·음성·영상이 추가될 때 안전성과 신뢰성 평가는 어떻게 달라져야 하는가?",
    consensus:["텍스트 policy만으로 visual prompt injection, OCR 오류, spatial misunderstanding과 음성 사칭을 충분히 다룰 수 없다.","modality별 encoder와 cross-modal fusion에서 서로 다른 실패가 생긴다."],
    positions:[
      {title:"공통 정책의 확장",argument:"통합 multimodal model과 공통 safety training으로 여러 형식의 정책을 일관되게 적용할 수 있다.",evidence:"native multimodal system은 이미지·음성 맥락을 함께 보고 응답을 조절할 수 있다."},
      {title:"형식별 위협의 독립성",argument:"한 modality에서 안전한 개념이 다른 표현으로 우회되거나 perception 오류로 잘못 분류될 수 있다.",evidence:"텍스트로 보이지 않는 작은 visual instruction, audio perturbation과 metadata가 별도 attack surface를 만든다."}
    ],
    evaluation:["동일 의미를 text/image/audio로 변환한 cross-modal consistency를 본다.","OCR·spatial relation·speaker identity의 perception error를 분리한다.","합성 media provenance와 개인정보 누출을 시험한다.","modality 조합과 adversarial transformation을 포함한다."],
    limitations:["실제 세계의 이미지·음성 분포와 문화적 맥락을 평가셋이 모두 포함하기 어렵다.","생성 media detector는 새 모델과 후처리에 일반화되지 않을 수 있다."],
    currentState:"multimodal safety는 language policy를 복사하는 문제가 아니라 perception, fusion, generation과 provenance 전 단계의 assurance 문제다.",
    openQuestions:["서로 충돌하는 modality 지시에서 우선순위를 어떻게 검증할 것인가?","실시간 audio/video agent의 행동 위험을 어떤 단위로 평가할 것인가?"]
  },
  "open-evaluation":{
    question:"빠르게 바뀌는 모델의 성능 주장을 독립적으로 재현하고 장기 비교하려면 무엇을 공개해야 하는가?",
    consensus:["model version, date, prompt, sampling, tools와 scorer가 없으면 점수를 직접 비교하기 어렵다.","API alias가 바뀌면 같은 이름으로도 결과를 재현하지 못할 수 있다."],
    positions:[
      {title:"공개 benchmark와 community audit",argument:"문제·harness·raw output을 공개하면 오류를 발견하고 다양한 기관이 결과를 반복할 수 있다.",evidence:"open evaluation framework는 prompt와 scoring 차이를 코드 수준에서 비교하게 한다."},
      {title:"오염 방지를 위한 비공개 평가",argument:"모든 문제를 공개하면 training과 최적화 대상이 되어 미래 모델의 독립성을 잃는다.",evidence:"private holdout과 rotating task는 직접 암기 가능성을 줄일 수 있다."}
    ],
    evaluation:["immutable model snapshot과 exact API version을 기록한다.","raw response·error·refusal과 scorer rationale를 보존한다.","public set과 private rotating set을 함께 사용한다.","confidence interval과 여러 seed/prompt variance를 공개한다."],
    limitations:["closed API는 weight와 serving stack 변화까지 고정하기 어렵다.","private evaluation은 evaluator 자체를 외부에서 감사하기 어렵다."],
    currentState:"재현성과 contamination resistance의 긴장을 인정하고 evaluation card와 raw artifact를 최대한 남기는 방식이 필요하다.",
    openQuestions:["API 모델의 과거 snapshot 보존을 누가 책임질 것인가?","평가 문제를 숨기면서 공정한 외부 감사를 가능하게 할 수 있는가?"]
  },
  "agi-definitions":{
    question:"AGI라는 말을 어떤 능력 범위·성능 수준·자율성 조건으로 조작적으로 정의할 것인가?",
    consensus:["하나의 보편적 학술 정의나 단일 통과 시험은 없다.","능력의 breadth, 인간 대비 performance, 학습·적응, autonomy와 deployment risk는 서로 다른 축이다."],
    positions:[
      {title:"측정 가능한 capability level",argument:"업무 범위와 사람 기준 성능을 단계로 정의하면 모호한 명칭보다 진전을 비교하기 쉽다.",evidence:"Levels of AGI framework는 generality와 performance의 depth를 나누고 autonomy를 deployment 속성으로 논의한다."},
      {title:"사회기술적 개념",argument:"경제적 대체, embodied experience, 목표 형성과 사회 제도까지 포함하면 benchmark capability만으로 AGI를 규정할 수 없다.",evidence:"같은 모델도 도구·scaffold·접근 권한과 human organization에 따라 실제 영향이 크게 달라진다."}
    ],
    evaluation:["capability domain의 범위와 제외 항목을 먼저 선언한다.","인간 baseline의 집단·훈련·시간·도구 조건을 맞춘다.","novel task adaptation과 reliability를 평균 점수와 분리한다.","autonomy·resource·risk를 capability label과 별도 표시한다."],
    limitations:["정의는 기술적 측정뿐 아니라 가치 판단과 정책 목적을 포함한다.","benchmark의 높은 성능이 consciousness나 인간과 동일한 이해를 증명하지 않는다."],
    currentState:"AGI 선언 여부보다 어떤 축에서 어떤 조건으로 사람 수준을 넘었고 어디에서 실패하는지 구체적으로 쓰는 편이 정보량이 높다.",
    openQuestions:["일반성의 domain set을 누가 정하고 언제 갱신할 것인가?","경제적 영향과 cognitive capability를 하나의 용어 안에서 분리할 수 있는가?"]
  }
};

export const getIssueBrief=(slug:string)=>issueBriefs[slug];
