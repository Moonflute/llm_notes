export type StudySection = {
  title: string;
  paragraphs: string[];
  formula?: { label: string; value: string; note: string };
  bullets?: string[];
  caution?: string;
};

export type StudyResource = {
  type: "원 논문" | "공식 구현" | "강의" | "추가 읽기";
  title: string;
  url: string;
  note: string;
};

export type ConceptStudyGuide = {
  estimatedMinutes: number;
  objectives: string[];
  sections: StudySection[];
  implementationChecklist: string[];
  misconceptions: { myth: string; correction: string }[];
  resources: StudyResource[];
};

export const conceptStudyGuides: Record<string, ConceptStudyGuide> = {
  tokenization: {
    estimatedMinutes: 14,
    objectives: [
      "문자열·단어·토큰을 구별하고 언어 모델이 확률을 계산하는 실제 단위를 설명한다.",
      "BPE와 unigram 언어 모델 토크나이저가 어휘를 만드는 방식을 비교한다.",
      "토큰화가 비용, 문맥 길이, 다국어 성능, 보안 문제에 미치는 영향을 점검한다."
    ],
    sections: [
      {
        title: "언어 모델이 읽는 것은 문장이 아니라 정수열이다",
        paragraphs: [
          "언어 모델은 유니코드 문자열을 그대로 처리하지 않는다. 먼저 텍스트 x를 유한한 어휘 V의 정수열 (t₁,…,tₙ)으로 바꾸고, 모델은 P(tᵢ | t₁,…,tᵢ₋₁)를 학습한다. 임베딩 행렬의 행, 출력 softmax의 클래스, API 사용량의 토큰 단위가 모두 이 어휘에 묶여 있다.",
          "따라서 토큰은 ‘단어’가 아니다. 영어의 흔한 단어 하나가 한 토큰일 수 있지만, 드문 단어·숫자·공백·문장부호·한글 음절열은 여러 조각이 될 수 있다. 같은 의미의 한국어와 영어 요청도 토큰 수가 달라 비용과 잘림 위험이 달라진다."
        ],
        formula: { label: "자기회귀 언어 모델의 목표", value: "max_θ Σᵢ log P_θ(tᵢ | t₍<i₎)", note: "토크나이저가 정한 분할이 학습·추론의 시퀀스 길이 n을 직접 바꾼다." }
      },
      {
        title: "BPE: 자주 함께 나오는 쌍을 반복해서 합친다",
        paragraphs: [
          "Byte Pair Encoding(BPE)은 아주 작은 기본 단위(바이트 또는 문자)에서 시작해, 학습 코퍼스에서 가장 자주 인접하는 쌍을 합치는 규칙을 반복 추가한다. 예컨대 ‘학’, ‘습’이 자주 연속되면 ‘학습’이라는 새 단위를 만들 수 있다. 희귀어는 이미 배운 작은 조각으로 되돌아가므로 고정된 단어 사전의 미등록어 문제를 완화한다.",
          "구현에서는 학습 코퍼스의 정규화 방식, pre-tokenization, 특수 토큰, 바이트 처리 규칙까지 포함해서 토크나이저다. 같은 BPE라는 이름만으로 호환성을 판단하면 안 된다. 모델 체크포인트의 tokenizer 파일과 chat template를 함께 고정해야 한다."
        ],
        bullets: ["어휘가 크면 평균 시퀀스는 짧아지지만 임베딩·출력 행렬과 softmax 비용이 커진다.", "어휘가 작으면 파라미터는 줄지만 시퀀스가 길어져 어텐션 비용이 커질 수 있다.", "바이트 기반 방식은 어떤 문자열도 표현할 수 있지만 사람이 읽는 단어 경계와 덜 일치할 수 있다."]
      },
      {
        title: "Unigram과 한국어·코드에서의 실무적 함의",
        paragraphs: [
          "SentencePiece의 unigram 방식은 후보 subword 집합을 두고, 문장을 만들 확률이 높은 분할을 선택한다. 학습 중 중요도가 낮은 조각을 제거하며 어휘를 다듬는다. 공백을 명시 기호로 다뤄 원문에서 직접 학습할 수 있는 점이 다국어 파이프라인에 유용하다.",
          "토큰 수는 단순한 청구 단위가 아니다. 긴 입력은 위치 인코딩 범위와 KV cache 메모리를 소모하고, self-attention의 계산량을 빠르게 키운다. 특히 JSON, 코드, URL, 난수 문자열은 자연어보다 더 잘게 쪼개질 수 있으므로 실제 제품에서는 대표 입력을 해당 모델의 토크나이저로 측정해야 한다."
        ],
        caution: "‘1토큰 ≈ 4글자’ 같은 경험칙을 한국어·코드·특수문자 입력의 예산 산정에 쓰면 안 된다. 해당 모델의 공식 토크나이저 결과만 신뢰한다."
      }
    ],
    implementationChecklist: ["모델과 동일한 tokenizer revision 및 special token 설정을 로드한다.", "학습·평가·서빙에서 chat template 적용 위치를 통일한다.", "길이 제한 전후의 토큰 수, 잘린 위치, decode 왕복 결과를 테스트한다.", "한국어·URL·코드·이모지·빈 문자열을 포함한 회귀 테스트를 둔다."],
    misconceptions: [
      { myth: "토큰은 단어 개수다.", correction: "토큰은 모델별 subword/byte 단위다. 단어 수와 일정 비율 관계가 아니다." },
      { myth: "토크나이저는 전처리라서 모델 성능과 무관하다.", correction: "어휘·분할은 시퀀스 길이, 표현 가능한 문자열, 학습 분포를 바꾸므로 모델 설계의 일부다." }
    ],
    resources: [
      { type: "원 논문", title: "SentencePiece: A simple and language independent subword tokenizer", url: "https://arxiv.org/abs/1808.06226", note: "원문에서 직접 학습하는 unigram/BPE 도구의 설계와 실험." },
      { type: "공식 구현", title: "Google SentencePiece", url: "https://github.com/google/sentencepiece", note: "학습·인코딩 명령과 모델 파일 형식을 확인한다." },
      { type: "추가 읽기", title: "Language Models are Unsupervised Multitask Learners", url: "https://openai.com/index/better-language-models/", note: "GPT-2의 byte-level BPE 선택을 원문 맥락에서 본다." }
    ]
  },
  attention: {
    estimatedMinutes: 18,
    objectives: ["query, key, value의 역할과 scaled dot-product attention을 유도한다.", "self-attention, cross-attention, causal mask를 구분한다.", "표현력과 O(n²) 비용 사이의 교환을 설명한다."],
    sections: [
      {
        title: "어텐션은 내용으로 주소를 찾는 가중 평균이다",
        paragraphs: [
          "각 위치의 표현에서 query(Q), key(K), value(V)를 선형 변환으로 만든다. 한 query는 모든 key와의 유사도를 계산하고 softmax로 정규화해 value들의 가중 평균을 얻는다. 즉 ‘무엇을 가져올지’는 Q·K가, ‘가져올 정보’는 V가 담당한다.",
          "self-attention에서는 Q, K, V가 같은 시퀀스에서 나온다. 번역의 encoder–decoder attention처럼 query와 key/value의 출처가 다르면 cross-attention이다. 이 구분은 언어 모델, RAG의 문서 융합, 멀티모달 모델을 읽을 때 기본 좌표가 된다."
        ],
        formula: { label: "scaled dot-product attention", value: "Attention(Q,K,V) = softmax(QKᵀ / √dₖ + M)V", note: "M은 보지 말아야 할 위치에 −∞를 더하는 mask다. √dₖ는 내적 규모가 커져 softmax가 과도하게 뾰족해지는 것을 완화한다." }
      },
      {
        title: "인과 마스크와 다음 토큰 예측",
        paragraphs: [
          "decoder-only LLM은 i번째 위치가 미래 토큰 j > i를 볼 수 없도록 상삼각 영역을 가린 causal mask를 쓴다. 훈련 때는 전체 정답 시퀀스를 병렬로 넣되, mask 덕분에 각 위치는 과거만 보고 다음 토큰을 예측한다. 추론은 아직 생성되지 않은 미래가 없으므로 한 토큰씩 이어진다.",
          "마스크는 단순한 구현 옵션이 아니다. bidirectional encoder는 양쪽 문맥을 볼 수 있어 분류·빈칸 채우기에 유리하고, causal decoder는 생성 확률분포를 자연스럽게 정의한다. 같은 ‘Transformer’라도 무엇을 가리느냐가 작업 성격을 바꾼다."
        ]
      },
      {
        title: "멀티헤드와 병목",
        paragraphs: [
          "멀티헤드 어텐션은 채널을 여러 작은 부분공간으로 나누고 각 head가 다른 투영을 학습하게 한다. 직관적으로는 한 head가 구문 관계, 다른 head가 위치나 지시어 관계를 포착할 여지를 준다. 다만 head 하나에 인간 언어학적 의미를 단정하는 해석은 위험하다.",
          "길이 n에서 attention score 행렬은 n×n이다. 학습 중 메모리와 계산량이 대략 n²에 비례하기 때문에 긴 문맥은 핵심 병목이다. FlashAttention은 결과를 근사하지 않으면서 I/O를 줄이는 구현 기법이고, sparse/linear attention은 연결 패턴이나 계산 자체를 바꾸는 구조적 선택이다."
        ],
        caution: "attention weight가 곧 설명(explanation)이라는 결론은 성립하지 않는다. 가중치만으로 특정 출력의 인과적 근거를 보려면 별도의 개입·ablation 검증이 필요하다."
      }
    ],
    implementationChecklist: ["텐서 shape를 (batch, heads, sequence, head_dim)으로 명시하고 transpose 위치를 테스트한다.", "padding mask와 causal mask의 의미·broadcast 방향을 분리해 검증한다.", "softmax 전 logits에 mask를 적용하고, mixed precision에서 수치 안정성을 확인한다.", "추론 시 이전 K/V를 cache해 과거 전체를 매번 다시 계산하지 않는다."],
    misconceptions: [{ myth: "어텐션은 모델이 중요한 단어를 ‘이해해서’ 보는 장치다.", correction: "학습된 벡터 유사도 기반의 미분 가능한 라우팅이며, 해석은 별도 문제다." }, { myth: "어텐션만 병렬이면 생성도 병렬이다.", correction: "훈련은 병렬화되지만 자기회귀 디코딩은 이전 토큰에 조건부이므로 시간축 순차성이 남는다." }],
    resources: [
      { type: "원 논문", title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", note: "scaled dot-product, multi-head, mask의 표준 출발점." },
      { type: "원 논문", title: "FlashAttention", url: "https://arxiv.org/abs/2205.14135", note: "긴 문맥에서 구현·메모리 관점을 보강한다." },
      { type: "강의", title: "Stanford CS224N — Transformers and Self-Attention", url: "https://www.youtube.com/watch?v=5vcj8kSwBCY", note: "수식과 행렬 연산을 강의 형식으로 복습한다." }
    ]
  },
  transformer: {
    estimatedMinutes: 22,
    objectives: ["decoder-only LLM 블록의 데이터 흐름을 설명한다.", "position, residual connection, normalization, MLP의 기능을 분리한다.", "훈련 병렬성·추론 순차성·문맥 길이 병목을 연결한다."],
    sections: [
      {
        title: "LLM의 기본 블록: 섞고, 각 위치에서 변환하고, 원본을 보존한다",
        paragraphs: [
          "현대 decoder-only Transformer는 대체로 토큰 임베딩과 위치 정보를 입력으로 받아, 여러 블록의 (정규화 → causal multi-head self-attention → residual)과 (정규화 → position-wise MLP → residual)을 반복한다. 마지막 hidden state를 어휘 크기의 logits로 투영하고 softmax로 다음 토큰 분포를 만든다.",
          "어텐션은 위치 사이의 정보를 섞는다. MLP는 각 위치별로 비선형 변환을 수행해 feature를 조합한다. residual connection은 이전 표현으로의 짧은 경로를 남겨 깊은 네트워크의 최적화를 돕고, normalization은 층별 활성값 규모를 안정화한다. 이 역할을 분리하면 논문 속 변형을 읽기 쉬워진다."
        ]
      },
      {
        title: "순서 정보는 구조 밖에서 넣어야 한다",
        paragraphs: [
          "self-attention은 입력 행의 순서를 바꿔도 같은 방식으로 동작하는 permutation-equivariant 연산이다. 따라서 ‘A가 B 앞에 있다’는 사실을 알기 위해 위치 정보를 별도로 주입한다. 원 논문의 sinusoidal positional encoding, 학습된 absolute embedding, RoPE 같은 relative position 계열은 서로 다른 외삽·구현 특성을 가진다.",
          "포지션 표현을 바꿨다고 문맥 창이 자동으로 늘거나, 길이가 긴 데이터를 잘 이해하게 되는 것은 아니다. 학습 길이 분포, attention 구현, KV cache 메모리, 장거리 회수 평가가 함께 맞아야 한다."
        ]
      },
      {
        title: "훈련과 생성의 비대칭",
        paragraphs: [
          "teacher forcing 훈련에서는 정답 토큰을 한 번에 입력하고 causal mask만 적용하므로 모든 위치의 forward pass를 병렬로 처리할 수 있다. loss는 각 위치의 다음 정답 토큰에 대한 cross-entropy의 합이다. 이 병렬성은 RNN 시대와 비교해 대규모 학습을 크게 단순화했다.",
          "반면 생성은 y₁을 뽑은 뒤 y₂의 조건으로 써야 한다. 이전 토큰의 K, V를 저장하는 KV cache는 반복 계산을 피하지만, 캐시는 레이어·길이·head 수에 비례해 GPU 메모리를 차지한다. 긴 컨텍스트 서빙에서 batch size와 동시성의 핵심 제약이 되는 이유다."
        ],
        formula: { label: "다음 토큰 cross-entropy", value: "L = −Σᵢ log softmax(zᵢ)[tᵢ₊₁]", note: "zᵢ는 i번째 위치의 어휘 logits이다. 훈련 시 입력과 레이블을 한 칸 shift한다." }
      }
    ],
    implementationChecklist: ["작은 모델에서 입력/레이블 shift와 causal mask를 단위 테스트한다.", "pre-norm/post-norm, activation(GELU/SwiGLU), positional encoding을 명시한다.", "파라미터 수뿐 아니라 training FLOPs, 활성값 메모리, KV cache를 함께 기록한다.", "생성 시 eval mode, cache 사용, EOS 처리와 sampling 설정을 분리한다."],
    misconceptions: [{ myth: "Transformer는 곧 LLM이다.", correction: "Transformer는 구조 계열이고, LLM은 데이터·목적함수·규모·정렬·서빙을 포함한 시스템이다." }, { myth: "파라미터가 많으면 항상 더 느리다.", correction: "지연 시간은 활성 파라미터, batch, 메모리 대역폭, KV cache, 하드웨어·커널에 함께 좌우된다." }],
    resources: [
      { type: "원 논문", title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", note: "encoder–decoder Transformer의 원 구조와 설계 근거." },
      { type: "공식 구현", title: "The Annotated Transformer", url: "https://nlp.seas.harvard.edu/annotated-transformer/", note: "원 논문 구조를 따라가는 교육용 구현·주석." },
      { type: "추가 읽기", title: "LLaMA: Open and Efficient Foundation Language Models", url: "https://arxiv.org/abs/2302.13971", note: "현대 decoder-only Transformer의 구체적 선택을 비교한다." }
    ]
  },
  pretraining: {
    estimatedMinutes: 17,
    objectives: ["자기지도 언어 모델링 목적함수와 데이터 파이프라인을 연결한다.", "causal LM·masked LM·sequence-to-sequence pretraining의 차이를 구분한다.", "데이터 품질·중복·오염·라이선스가 왜 모델 연구의 핵심인지 설명한다."],
    sections: [
      {
        title: "라벨 없이도 다음 조각을 맞히는 학습 신호",
        paragraphs: [
          "사전학습은 대규모 텍스트에서 일반적인 언어·지식·형식 패턴을 습득하는 단계다. causal LM은 앞 토큰으로 다음 토큰을 예측하고, masked LM은 가린 조각을 양방향 문맥에서 복원한다. 둘 다 사람이 과제별 정답을 붙이지 않아도 원문 자체에서 학습 신호를 얻는다.",
          "하지만 목적함수가 ‘다음 토큰 확률’을 낮추는 것이라는 사실은 중요하다. 이것만으로 사실성, 지시 이행, 안전, 인용 습관이 보장되는 것은 아니다. 그런 행동은 후속의 instruction tuning·선호 최적화·시스템 제약·도구 사용으로 별도 조정한다."
        ],
        formula: { label: "causal language modeling", value: "P(x₁:ₙ) = ∏ᵢ P(xᵢ | x₍<i₎)", note: "훈련은 이 분해의 negative log-likelihood를 최소화한다." }
      },
      {
        title: "데이터 엔지니어링은 모델의 일부다",
        paragraphs: [
          "웹 규모 코퍼스는 HTML 제거, 언어 식별, 품질 필터, 중복 제거, 유해성·개인정보 필터, 문서 혼합 비율, 토큰화라는 긴 파이프라인을 거친다. 데이터가 어떤 언어·장르·코드·교과서·대화를 얼마나 포함하는지에 따라 모델의 강점과 취약점이 달라진다.",
          "중복 제거는 단지 저장 공간 문제가 아니다. 중복 문서는 특정 양식의 비중을 과장하고, benchmark가 학습 데이터에 섞이는 오염을 감추며, 측정된 성능을 부풀릴 수 있다. 공개 모델을 평가할 때는 점수뿐 아니라 데이터 공개 수준과 contamination 통제를 함께 읽어야 한다."
        ]
      },
      {
        title: "스케일링을 읽는 방법",
        paragraphs: [
          "모델·데이터·연산량을 키우면 validation loss가 매끄러운 경향을 보인다는 scaling law 관찰은 연구 계획을 바꿨다. 그러나 ‘모델만 크게’ 만들면 고정된 연산 예산에서 학습 토큰이 부족해질 수 있다. Chinchilla 계열 결과는 모델 크기와 데이터 양을 함께 배분해야 함을 보여준다.",
          "학습 손실이 낮아졌다는 사실과 특정 벤치마크·제품 품질이 좋아졌다는 사실은 다른 주장이다. 데이터 분포 이동, 평가 오염, 추론 비용, 안전성은 별도 측정해야 한다."
        ],
        caution: "사전학습 데이터에 접근할 수 없거나 문서화가 빈약하면, 재현성과 저작권·개인정보·편향 리스크의 판단도 제한된다."
      }
    ],
    implementationChecklist: ["데이터 출처·라이선스·수집일·필터·중복 제거 기준을 버전으로 남긴다.", "train/validation과 benchmark 사이의 n-gram·문서 수준 중복을 검사한다.", "언어·도메인별 토큰 비중과 손실을 모니터링한다.", "학습 체크포인트와 tokenizer·데이터 manifest를 함께 보존한다."],
    misconceptions: [{ myth: "사전학습은 인터넷을 통째로 외우는 과정이다.", correction: "압축된 통계적 패턴을 학습하지만, 암기·일반화의 정도는 데이터·반복·모델·샘플에 따라 다르다." }, { myth: "학습 손실이 낮으면 신뢰할 수 있는 답을 한다.", correction: "다음 토큰 예측 품질과 사실성·근거 제시는 서로 다른 평가 대상이다." }],
    resources: [
      { type: "원 논문", title: "Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165", note: "대규모 autoregressive pretraining과 few-shot 평가의 대표 사례." },
      { type: "원 논문", title: "Training Compute-Optimal Large Language Models", url: "https://arxiv.org/abs/2203.15556", note: "모델 크기와 학습 토큰 배분의 실증적 근거." },
      { type: "추가 읽기", title: "OLMo: Accelerating the Science of Language Models", url: "https://arxiv.org/abs/2402.00838", note: "데이터·학습·코드 공개가 재현성에 주는 의미를 본다." }
    ]
  },
  rlhf: {
    estimatedMinutes: 20,
    objectives: ["SFT, reward model, RL 정책 최적화의 세 단계를 구분한다.", "선호 데이터가 무엇을 측정하고 무엇을 놓치는지 설명한다.", "KL 제약과 reward hacking이 필요한 이유를 이해한다."],
    sections: [
      {
        title: "‘좋은 답’은 다음 토큰 확률만으로 정의되지 않는다",
        paragraphs: [
          "사전학습 모델은 인터넷 텍스트의 다음 조각을 잘 이어 쓰도록 최적화된다. 사용자는 정확성뿐 아니라 요청 준수, 간결성, 안전성, 불확실성 표기를 기대한다. RLHF(reinforcement learning from human feedback)는 사람이 여러 응답 중 어느 쪽을 선호하는지 평가한 데이터를 이용해 이 행동 분포를 조정하는 계열의 절차다.",
          "InstructGPT의 대표 파이프라인은 (1) 사람이 작성한 시범 응답으로 supervised fine-tuning(SFT), (2) 같은 prompt의 응답 쌍을 비교한 순위 데이터로 reward model 학습, (3) reward를 높이는 방향으로 정책을 최적화하는 세 단계다. 실제 시스템은 데이터 수집·필터링·평가·안전 정책이 이 과정의 절반을 차지한다."
        ]
      },
      {
        title: "선호를 스칼라 보상으로 바꾸는 방법",
        paragraphs: [
          "reward model r_φ(x,y)는 prompt x와 응답 y를 받아 점수를 낸다. 선호 쌍 (y⁺, y⁻)에는 보통 Bradley–Terry 형태의 pairwise loss를 쓴다. y⁺의 점수가 y⁻보다 높을 확률을 크게 만들어, 사람의 비교 판단을 하나의 학습 가능한 함수로 근사한다.",
          "문제는 reward model도 제한된 라벨러·프롬프트·정책의 산물이라는 점이다. 정책이 reward의 허점을 찾아 점수만 높이는 reward hacking, 길거나 자신감 있는 문장을 과대보상하는 편향, 소수 가치관의 누락이 생길 수 있다. holdout 인간 평가와 adversarial prompt는 옵션이 아니라 안전장치다."
        ],
        formula: { label: "선호 쌍 reward loss", value: "L_RM = −log σ(r_φ(x,y⁺) − r_φ(x,y⁻))", note: "순위만 관측되므로 절대적 ‘좋음’ 점수가 아니라 상대 차이를 학습한다." }
      },
      {
        title: "왜 원래 모델에서 너무 멀어지지 않게 하는가",
        paragraphs: [
          "정책 최적화는 높은 reward를 주는 답을 강화하지만, reward model의 분포 밖으로 너무 멀리 가면 일반 언어 능력과 안정성이 무너질 수 있다. 그래서 보통 SFT 기준 정책 π_ref와의 KL divergence를 벌점으로 둔다. 이것은 ‘사람 선호’와 ‘사전학습된 언어 분포’ 사이의 제어 장치다.",
          "PPO는 이 최적화에 널리 쓰인 알고리즘 중 하나일 뿐 RLHF의 동의어가 아니다. 이후 DPO처럼 preference 데이터에서 직접 정책을 학습하는 방법, RLAIF처럼 AI 피드백을 보완 신호로 쓰는 방법도 등장했다."
        ],
        formula: { label: "개념적 RLHF 목적", value: "max_π E[r(x,y)] − β·KL(π(·|x) || π_ref(·|x))", note: "β가 크면 원래 정책에 더 가깝게, 작으면 reward에 더 공격적으로 맞춘다." }
      }
    ],
    implementationChecklist: ["선호 데이터의 라벨 지침·라벨러 합의도·제외 기준을 문서화한다.", "reward model과 정책 평가용 prompt를 분리해 leakage를 막는다.", "보상, KL, 길이, 거부율, 사실성 평가를 함께 추적한다.", "고위험 도메인은 자동 선호 점수 대신 전문가 검토와 정책 테스트를 둔다."],
    misconceptions: [{ myth: "RLHF를 하면 모델이 인간의 가치에 정렬된다.", correction: "제한된 데이터·측정·정책에 대한 선호 최적화일 뿐이며, 가치 정렬 전체를 해결하지 않는다." }, { myth: "reward model 점수가 높으면 품질이 높다.", correction: "최적화 대상 자체의 편향과 hacking 가능성이 있으므로 독립 인간 평가가 필요하다." }],
    resources: [
      { type: "원 논문", title: "Training language models to follow instructions with human feedback", url: "https://arxiv.org/abs/2203.02155", note: "SFT–RM–PPO 흐름, 데이터 수집, 인간 평가를 원문에서 확인한다." },
      { type: "원 논문", title: "Constitutional AI: Harmlessness from AI Feedback", url: "https://arxiv.org/abs/2212.08073", note: "규칙 기반 비평과 AI 피드백을 결합하는 대안 흐름." },
      { type: "추가 읽기", title: "Deep RLHF", url: "https://huggingface.co/docs/trl/main/en/rlhf_overview", note: "실무 파이프라인을 볼 때도 원 논문과의 차이를 확인하며 읽는다." }
    ]
  },
  dpo: {
    estimatedMinutes: 16,
    objectives: ["DPO가 RLHF의 어떤 부분을 없애고 어떤 가정을 유지하는지 설명한다.", "chosen/rejected 선호 쌍을 사용하는 손실의 직관을 얻는다.", "DPO가 reward model·RL을 ‘개념적으로 불필요하게’ 만든다는 뜻을 구분한다."],
    sections: [
      {
        title: "선호 쌍에서 정책을 바로 학습한다",
        paragraphs: [
          "DPO(Direct Preference Optimization)는 prompt마다 선택된 응답 y⁺와 거절된 응답 y⁻를 사용해 정책 πθ를 직접 미세조정한다. 별도의 reward model을 학습하고 PPO로 샘플링하며 최적화하는 전통적 RLHF 파이프라인을 피하므로 구현·안정성 측면에서 매력적이다.",
          "핵심 관찰은 KL-정규화된 reward maximization의 최적 정책을 쓰면, 암묵적 reward를 정책과 기준 정책 πref의 로그 확률비로 나타낼 수 있다는 것이다. 이를 Bradley–Terry 선호 모델에 대입하면 reward model을 명시적으로 맞추지 않는 이진 분류 형태의 손실이 나온다."
        ],
        formula: { label: "DPO loss", value: "L_DPO = −log σ(β[log πθ(y⁺|x)/πref(y⁺|x) − log πθ(y⁻|x)/πref(y⁻|x)])", note: "실제 구현은 수치 안정을 위해 로그 확률의 차로 계산한다. β는 기준 정책에서의 이탈 강도를 조절한다." }
      },
      {
        title: "학습이 실제로 강화하는 것",
        paragraphs: [
          "한 선호 쌍에서 DPO는 기준 모델 대비 chosen 응답의 로그 확률비를 키우고 rejected 응답의 비를 낮춘다. 단순히 chosen만 모방하는 SFT와 달리 같은 prompt의 나쁜 대안을 명시적으로 대비시킨다는 점이 핵심이다. 그러나 데이터가 무엇을 chosen으로 정했는지보다 더 현명해지지는 않는다.",
          "오프라인 선호 데이터만으로 학습하므로 RL 중 정책이 새로 만들어 낸 분포에서 reward를 탐색하는 과정은 없다. 이는 안정성을 주지만, 현재 정책의 약점을 겨냥해 새 데이터를 능동적으로 모으는 online preference optimization과는 다른 트레이드오프다."
        ]
      },
      {
        title: "데이터 품질과 β가 성패를 가른다",
        paragraphs: [
          "prompt·chosen·rejected가 서로 비교 가능한지, 거절된 답이 너무 명백하게 나쁘지 않은지, 길이·문체 같은 지름길을 라벨러가 선호하지 않았는지가 중요하다. 응답 길이 차이가 크면 모델이 실제 내용보다 장황함을 선호하게 학습할 수 있다.",
          "β와 학습률, epoch를 과하게 주면 기준 모델에서 멀어져 품질이 붕괴하거나 선호 데이터에 과적합할 수 있다. win-rate 하나 대신 길이, 거부율, 사실성, 안전성, 도메인별 인간 평가를 함께 본다."
        ],
        caution: "DPO는 reward model과 PPO를 생략하지만 ‘선호를 측정하는 어려움’을 제거하지 않는다. 라벨 지침·데이터 커버리지·독립 평가는 그대로 필요하다."
      }
    ],
    implementationChecklist: ["각 예시에 prompt, chosen, rejected와 동일한 chat template를 적용한다.", "policy와 reference의 tokenizer·특수 토큰·최대 길이를 일치시킨다.", "chosen/rejected의 평균 길이와 log-prob margin을 로그로 남긴다.", "훈련 데이터와 분리된 다회 평가·사람 평가로 reward hacking을 검사한다."],
    misconceptions: [{ myth: "DPO는 RLHF보다 항상 성능이 좋다.", correction: "데이터, 모델, 목표, online 여부에 따라 다르다. DPO는 단순한 기준선·도구이지 보편적 승자가 아니다." }, { myth: "DPO에는 reference model이 필요 없다.", correction: "표준 DPO 목적에는 기준 정책 로그 확률이 들어가며, 이를 어떻게 제공하는지가 구현 비용의 일부다." }],
    resources: [
      { type: "원 논문", title: "Direct Preference Optimization", url: "https://arxiv.org/abs/2305.18290", note: "유도·실험·한계를 원문에서 확인한다." },
      { type: "공식 구현", title: "Hugging Face TRL — DPO Trainer", url: "https://huggingface.co/docs/trl/dpo_trainer", note: "데이터 형식과 trainer 옵션을 실제 코드와 함께 본다." },
      { type: "추가 읽기", title: "Zephyr: Direct Distillation of LM Alignment", url: "https://arxiv.org/abs/2310.16944", note: "합성 선호 데이터와 DPO를 결합한 공개 사례." }
    ]
  },
  "retrieval-augmented-generation": {
    estimatedMinutes: 21,
    objectives: ["RAG를 검색기·문서 인덱스·생성기·평가로 분해한다.", "retrieval recall과 generation faithfulness가 서로 다른 문제임을 이해한다.", "프로덕션 RAG의 관측·보안·갱신 설계를 점검한다."],
    sections: [
      {
        title: "파라미터 안의 지식과 외부 코퍼스를 결합한다",
        paragraphs: [
          "RAG는 질문 x에 답하기 전에 외부 문서 집합에서 관련 근거 z를 찾고, 생성 모델이 x와 z에 조건부로 답을 만드는 패턴이다. 모델 파라미터의 암묵적 기억만 쓰는 방식과 달리, 지식을 갱신하고 출처를 보여 줄 통로를 제공한다. 그러나 검색 결과를 넣었다고 자동으로 근거 있는 답이 되는 것은 아니다.",
          "원 RAG 논문은 dense retriever가 Wikipedia 벡터 인덱스에서 문서를 찾고, seq2seq generator가 이를 조건으로 생성하는 구조를 제안했다. 현재 제품의 RAG는 보통 ingestion, chunking, embedding, hybrid retrieval, reranking, prompt construction, answer/citation, evaluation과 monitoring까지 포함하는 시스템을 뜻한다."
        ],
        formula: { label: "잠재 문서에 대한 RAG 분해", value: "P(y|x) = Σ_{z∈top-k} P_η(z|x) · P_θ(y|x,z)", note: "문서 z는 검색기가 고르고, 생성기는 해당 근거에 조건부로 답한다. 실제 서비스 구현은 이 식보다 다양한 조립 방식을 쓴다." }
      },
      {
        title: "검색 품질과 답변 품질은 따로 측정한다",
        paragraphs: [
          "검색 단계의 질문은 ‘정답 근거가 top-k에 들어왔는가’다. Recall@k, MRR, nDCG와 같은 지표 및 사람의 relevance 판정으로 본다. 생성 단계의 질문은 ‘답이 제공된 근거에 의해 지지되는가, 질문을 충분히 해결하는가’다. 이 둘을 섞으면 실패 원인을 고칠 수 없다.",
          "chunk를 너무 길게 자르면 관련 문장이 희석되고 문맥 비용이 증가한다. 너무 짧으면 문맥이 끊긴다. embedding 하나만 쓰면 어휘 일치가 중요한 ID·법조문·코드 검색을 놓칠 수 있어 BM25 같은 sparse 검색과 hybrid·rerank를 검토한다. 정답은 데이터와 질의 분포에서 실험해 정한다."
        ]
      },
      {
        title: "근거 제시는 제품 계약이다",
        paragraphs: [
          "인용 링크를 화면에 붙이는 것과 citation correctness는 다르다. 문서의 실제 구절이 답의 각 주장에 충분한지, 인용이 검색된 문서와 정확히 연결되는지, 근거가 없을 때 답변을 보류하는지를 평가해야 한다. 답변 생성 프롬프트에 ‘문서만 사용하라’고 쓰는 것은 도움이 될 수 있지만 보장은 아니다.",
          "외부 문서는 prompt injection을 포함할 수 있다. 검색된 텍스트는 신뢰할 수 없는 데이터로 취급하고, 시스템 지시와 도구 권한을 바꾸지 못하게 분리해야 한다. ACL·테넌트 필터는 검색 전에 적용하고, 인덱스와 원문 버전을 기록해 나중에 어떤 근거로 답했는지 재현 가능하게 만든다."
        ],
        caution: "RAG는 최신성·출처 문제를 완화할 수 있지만 환각을 제거하지 않는다. 검색 실패, 부적절한 chunk, 잘못된 인용, 생성기의 무시가 각각 독립적으로 일어난다."
      }
    ],
    implementationChecklist: ["원문 ID, 버전, ACL, chunk 위치와 해시를 인덱스 메타데이터에 보관한다.", "retrieval recall과 grounded-answer 평가를 별도 test set으로 운영한다.", "질문·검색 결과·rerank 점수·최종 인용을 tracing해 실패를 재현한다.", "권한 필터를 벡터 검색 이후가 아니라 후보 생성 이전에 강제한다."],
    misconceptions: [{ myth: "벡터 DB를 붙이면 RAG가 완성된다.", correction: "검색·문서 처리·프롬프트·인용·평가·권한·관측이 모두 설계돼야 한다." }, { myth: "검색 결과가 있으면 답은 사실이다.", correction: "생성기가 근거를 잘못 읽거나 과장할 수 있어 claim–citation 수준의 검증이 필요하다." }],
    resources: [
      { type: "원 논문", title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", note: "parametric/non-parametric memory 결합의 고전적 출발점." },
      { type: "원 논문", title: "Self-RAG", url: "https://arxiv.org/abs/2310.11511", note: "검색·생성·비평을 학습 신호로 결합하는 후속 흐름." },
      { type: "추가 읽기", title: "RAGAS documentation", url: "https://docs.ragas.io/", note: "RAG 평가 지표를 적용할 때는 데이터셋과 판정 모델의 한계도 함께 검토한다." }
    ]
  },
  embedding: {
    estimatedMinutes: 32,
    objectives: [
      "토큰 임베딩, 문맥 임베딩, 문장 임베딩을 서로 다른 목적의 표현으로 구분한다.",
      "lookup table의 tensor shape와 학습 과정, 출력층과의 weight tying을 설명한다.",
      "검색용 임베딩에서 거리 함수·대조 학습·index 품질이 왜 함께 중요한지 판단한다."
    ],
    sections: [
      {
        title: "이산적인 토큰 ID를 연속적인 계산 공간으로 옮긴다",
        paragraphs: [
          "토크나이저가 만든 정수 ID에는 그 자체로 의미적 거리가 없다. ID 101과 102가 101과 900보다 비슷하다는 뜻은 아니다. 임베딩 층은 어휘 크기 |V|와 hidden dimension d를 갖는 행렬 E∈R^{|V|×d}에서 각 ID에 대응하는 행을 꺼내 연속 벡터로 바꾼다. 길이 n인 한 문장은 이 과정을 거쳐 X∈R^{n×d}가 되고 Transformer block의 입력이 된다.",
          "초기 벡터는 보통 무작위에 가깝지만 다음 토큰 예측 손실의 역전파를 받으며 바뀐다. 비슷한 문맥에서 비슷한 예측에 기여하는 토큰은 계산에 유용한 방향을 공유하게 된다. 이것을 사람이 정의한 사전적 의미 좌표로 해석해서는 안 된다. 모델이 과제를 풀기 위해 만든 고차원 내부 표현이다."
        ],
        formula: {label:"토큰 lookup",value:"X[b, i, :] = E[token_id[b, i], :]   ·   E: |V|×d",note:"batch B, sequence n이면 출력 shape는 B×n×d다. gather 연산 뒤 위치 정보가 더해지거나 RoPE가 attention 내부에 적용된다."}
      },
      {
        title: "고정 단어 벡터에서 문맥에 따라 달라지는 표현으로",
        paragraphs: [
          "word2vec·GloVe 계열은 하나의 단어에 대체로 하나의 벡터를 부여했다. 그래서 bank가 은행인지 강둑인지 입력 문장에 따라 표현 자체를 바꾸기 어렵다. ELMo와 BERT 이후에는 주변 토큰을 처리한 hidden state가 문맥별 표현 역할을 하게 됐다. 같은 토큰 ID라도 layer와 위치, 앞뒤 문맥에 따라 최종 벡터가 달라진다.",
          "따라서 모델 입력의 token embedding과 검색 시스템의 sentence embedding을 같은 것으로 부르면 혼동이 생긴다. 전자는 Transformer가 처리할 초기 상태이고, 후자는 문장이나 문서를 하나의 고정 길이 벡터로 압축해 유사도 검색·분류에 쓰려는 출력이다. 후자는 pooling 방식과 대조 학습 목적이 품질을 크게 좌우한다."
        ]
      },
      {
        title: "출력 확률과 연결되는 weight tying",
        paragraphs: [
          "decoder-only LLM의 마지막 hidden state h∈R^d는 어휘별 logit z∈R^{|V|}로 투영된다. 입력 임베딩 행렬 E의 전치를 출력 투영에 재사용하면 z=Eh로 쓸 수 있다. 이를 weight tying이라 하며 입력과 출력에서 같은 어휘 공간을 공유하고 파라미터 수를 줄인다. 모든 모델이 반드시 같은 방식을 쓰는 것은 아니므로 공개 configuration을 확인해야 한다.",
          "학습 중에는 등장한 토큰 행만 읽었더라도 출력 softmax가 전체 어휘와 관계를 만든다. 추론에서는 임베딩 lookup 자체보다 뒤의 attention·FFN과 거대한 출력 projection이 더 큰 비용이 될 수 있다. 어휘가 커지면 표현 범위는 넓어지지만 embedding/output matrix의 메모리와 softmax 비용도 커진다."
        ]
      },
      {
        title: "검색 임베딩은 모델 하나가 아니라 평가 가능한 파이프라인이다",
        paragraphs: [
          "검색에서는 query encoder와 document encoder가 관련 쌍을 가깝게, 비관련 쌍을 멀게 배치하도록 대조 학습한다. cosine similarity는 벡터 방향을, dot product는 크기까지 반영한다. 어떤 metric으로 학습했는지와 vector database가 어떤 metric으로 검색하는지를 일치시켜야 한다. normalize 여부가 달라지면 순위가 달라질 수 있다.",
          "문서 chunking, 언어와 도메인, hard negative, 최신 문서 반영, approximate nearest-neighbor index의 recall이 모두 최종 성능에 관여한다. 임베딩 모델의 공개 benchmark 점수만으로 제품 검색 품질을 결론내리지 말고 실제 질의에서 Recall@k·nDCG와 후속 reranker, 답변 근거성을 분리 평가한다."
        ],
        caution: "벡터에서 가까운 것은 학습 목적과 데이터가 정의한 유사성이다. 사실이 같음, 인과적으로 관련됨, 사용자의 의도에 맞음이 자동으로 동일해지지는 않는다."
      }
    ],
    implementationChecklist: ["token ID 범위, padding ID, embedding matrix shape를 검증한다.", "입력·출력 weight tying 여부와 dtype을 checkpoint 설정에서 확인한다.", "검색 벡터의 pooling·normalize·distance metric을 인덱스 설정과 일치시킨다.", "자체 질의와 hard negative를 포함한 검색 평가셋으로 모델·chunk·index를 함께 평가한다."],
    misconceptions: [
      {myth:"임베딩의 각 차원은 사람이 읽을 수 있는 하나의 의미다.",correction:"의미는 여러 차원의 분산된 패턴과 이후 층의 계산에 걸쳐 표현된다."},
      {myth:"cosine similarity가 높으면 두 문장의 사실관계도 같다.",correction:"주제와 표현이 비슷해도 부정, 수치, 시간, 주체가 달라 사실은 반대일 수 있다."}
    ],
    resources: [
      {type:"원 논문",title:"Efficient Estimation of Word Representations in Vector Space",url:"https://arxiv.org/abs/1301.3781",note:"분포 기반 정적 단어 표현의 중요한 출발점을 본다."},
      {type:"원 논문",title:"Deep contextualized word representations",url:"https://arxiv.org/abs/1802.05365",note:"문맥에 따라 달라지는 표현으로의 전환을 확인한다."},
      {type:"원 논문",title:"Sentence-BERT",url:"https://arxiv.org/abs/1908.10084",note:"문장 단위 임베딩과 siamese 대조 구조의 목적을 본다."}
    ]
  },
  "positional-encoding": {
    estimatedMinutes: 36,
    objectives: ["self-attention에 별도 위치 정보가 필요한 이유를 설명한다.", "절대 위치 임베딩·상대 위치 bias·RoPE의 차이를 구분한다.", "RoPE의 2차원 회전과 query-key 내적이 상대 거리로 연결되는 과정을 이해한다."],
    sections: [
      {
        title:"Attention만으로는 순서를 알 수 없다",
        paragraphs:[
          "self-attention은 입력 행을 같은 방식으로 재배열하면 출력도 그 순서를 따라 재배열되는 성질이 있다. 토큰 집합만 주고 위치 신호를 주지 않으면 ‘개가 사람을 물었다’와 ‘사람이 개를 물었다’의 순서를 구조적으로 구별할 근거가 부족하다. causal mask는 미래를 가리지만 각 과거 토큰이 얼마나 멀리 있는지까지 표현하지는 않는다.",
          "원 Transformer는 차원마다 다른 주기의 sine과 cosine 값을 token embedding에 더했다. 학습 가능한 absolute embedding은 위치별 벡터를 직접 학습한다. 상대 위치 방식은 i와 j 자체보다 거리 i−j가 attention score에 영향을 주게 한다. 선택에 따라 외삽, 최대 길이, 구현 복잡도와 cache 동작이 달라진다."
        ],
        formula:{label:"sinusoidal absolute encoding",value:"PE(pos,2k)=sin(pos/10000^(2k/d)),  PE(pos,2k+1)=cos(pos/10000^(2k/d))",note:"여러 주기의 신호를 d차원에 배치한다. token embedding과 더하므로 hidden shape n×d는 유지된다."}
      },
      {
        title:"RoPE는 query와 key의 좌표계를 위치에 따라 회전한다",
        paragraphs:[
          "RoPE는 hidden dimension을 두 차원씩 묶고 위치 m에 비례하는 각도로 query와 key를 회전한다. 2차원 쌍 (x₁,x₂)에 회전 행렬 R(mθ)를 곱하므로 벡터 크기를 보존한다. value를 회전시키는 것이 핵심이 아니라 attention score를 만드는 query와 key에 위치별 회전을 적용하는 것이 핵심이다.",
          "회전된 q_m과 k_n의 내적은 qᵀR((n−m)θ)k 형태로 정리된다. 입력에는 절대 위치 m,n을 사용했지만 두 벡터의 관계에는 상대 차이 n−m이 나타난다. 이것이 RoPE가 absolute position을 회전으로 인코딩하면서 attention 계산에 explicit relative dependency를 넣는다는 뜻이다."
        ],
        formula:{label:"RoPE의 상대 위치 성질",value:"(R_m q)ᵀ(R_n k) = qᵀ R_(n−m) k",note:"R_mᵀR_n=R_(n−m)인 회전 행렬 성질을 쓴다. 실제 구현은 여러 주파수를 head dimension의 쌍마다 적용한다."}
      },
      {
        title:"긴 문맥은 위치 공식을 바꾸는 것만으로 해결되지 않는다",
        paragraphs:[
          "훈련 길이보다 훨씬 긴 위치에 원래 RoPE 주파수를 그대로 적용하면 모델이 보지 못한 위상 패턴에 노출된다. 실무에서는 position interpolation, 주파수 scaling, YaRN 계열 등 여러 확장법을 쓴다. 그러나 긴 길이에서 loss가 안정적이라는 사실과 멀리 떨어진 증거를 실제로 회수·조합한다는 능력은 다르다.",
          "context extension은 attention 계산량, KV cache 메모리, 데이터의 장거리 의존성, 평가 설계와 함께 본다. needle 테스트 하나만 통과해도 긴 문서 전체의 시간 순서·다중 근거·정확한 인용이 해결됐다고 볼 수 없다. 모델별 scaling 방식은 공개 설정이나 기술 보고서에서 확인해야 한다."
        ]
      },
      {
        title:"구현에서는 offset과 cache가 자주 틀린다",
        paragraphs:[
          "training에서는 보통 0…n−1 위치를 한 번에 만든다. autoregressive decoding에서는 이미 cache된 길이가 p라면 새 토큰은 position p부터 시작해야 한다. batch 안 요청마다 유효 길이가 다르거나 left padding을 쓰면 position IDs를 단순 arange로 공유할 수 없는 경우가 생긴다.",
          "RoPE tensor는 흔히 batch·head에 broadcast되는 [sequence, head_dim] 또는 cos/sin cache로 준비된다. interleaved pairing인지 half-rotation인지 checkpoint 구현과 일치해야 한다. 같은 이름의 RoPE라도 base frequency, scaling, position offset이 다르면 출력이 깨진다."
        ],
        caution:"RoPE는 토큰 순서를 모델에 제공하는 장치이지, 모델이 임의 길이를 정확히 이해하도록 보장하는 장치가 아니다."
      }
    ],
    implementationChecklist:["checkpoint의 RoPE base·scaling·pairing convention을 확인한다.","prefill과 decode에서 position offset이 cache 길이와 맞는지 검사한다.","padding과 packed sequence에서 요청별 position IDs를 검증한다.","훈련 길이 안팎을 나눠 perplexity와 장거리 과제를 평가한다."],
    misconceptions:[{myth:"causal mask가 있으니 위치 인코딩은 필요 없다.",correction:"mask는 볼 수 있는 범위를 제한하지만 과거 토큰 사이의 거리와 순서를 충분히 표현하지 않는다."},{myth:"RoPE scaling을 켜면 context window만큼의 정보가 모두 유지된다.",correction:"형식상 입력 가능 길이와 실제 장거리 검색·추론 품질은 별도 평가 대상이다."}],
    resources:[{type:"원 논문",title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",note:"sinusoidal positional encoding의 원 설계와 attention 구조를 함께 본다."},{type:"원 논문",title:"RoFormer: Enhanced Transformer with Rotary Position Embedding",url:"https://arxiv.org/abs/2104.09864",note:"회전 공식과 상대 위치 의존성의 유도를 확인한다."},{type:"추가 읽기",title:"YaRN: Efficient Context Window Extension of Large Language Models",url:"https://arxiv.org/abs/2309.00071",note:"RoPE 기반 문맥 확장의 후속 흐름과 평가를 본다."}]
  },
  "mixture-of-experts": {
    estimatedMinutes: 38,
    objectives:["dense FFN과 sparse MoE layer의 계산 경로를 비교한다.","router·top-k·capacity·load balancing이 왜 필요한지 설명한다.","총 파라미터, 활성 파라미터, 실제 latency를 구분해 모델 효율 주장을 읽는다."],
    sections:[
      {title:"모든 토큰에 모든 파라미터를 쓰지 않는 조건부 계산",paragraphs:[
        "일반 Transformer block의 FFN은 모든 토큰이 같은 두 선형층을 지난다. MoE layer는 이 FFN을 여러 expert로 복제하고 router가 토큰별로 일부 expert만 고른다. expert가 N개여도 top-k 중 k개만 활성화하면 모델 용량을 크게 늘리면서 토큰당 FFN 계산 증가는 제한할 수 있다. attention은 대개 공유되고 FFN 부분만 sparse하게 바뀐다.",
        "여기서 총 파라미터 수는 저장해야 하는 모든 expert를 포함하지만 활성 파라미터 수는 한 토큰이 실제로 거치는 expert만 포함한다. 그렇다고 배포가 같은 활성 크기의 dense 모델만큼 간단한 것은 아니다. 모든 expert weight를 장치에 올리고 토큰을 해당 장치로 보내며 결과를 다시 모아야 하기 때문이다."
      ],formula:{label:"top-k MoE layer",value:"y(x)=Σ_(i∈TopK(g(x))) p_i(x)·E_i(x)",note:"router g가 expert 점수와 가중치 p를 만들고 선택된 expert E_i만 계산한다. 실제 구현은 용량 제한과 dispatch/collective 통신을 추가한다."}},
      {title:"Router는 분류기가 아니라 자원 할당기이기도 하다",paragraphs:[
        "router는 각 token hidden state를 expert logits로 투영하고 softmax 또는 유사한 규칙으로 top-k를 고른다. top-1은 계산과 통신이 단순하지만 하나의 선택 실패에 민감하고, top-2 이상은 여러 expert 출력을 섞어 품질과 비용을 교환한다. router가 무엇을 전문화하는지는 데이터와 학습 동역학의 결과이지 사람이 미리 붙인 직업명이 아니다.",
        "일부 expert로 토큰이 몰리면 해당 장치의 capacity를 넘고 나머지 장치는 빈다. 그래서 load-balancing auxiliary loss, router z-loss, capacity factor, token dropping 또는 dropless routing을 사용한다. 균형 손실을 너무 강하게 주면 의미 있는 전문화를 방해할 수 있고 너무 약하면 병목과 학습 불안정이 생긴다."
      ]},
      {title:"학습의 핵심 병목은 all-to-all 통신",paragraphs:[
        "expert parallelism에서는 expert를 여러 GPU에 나눈 뒤 각 GPU의 토큰을 선택된 expert가 있는 장치로 all-to-all 전송한다. expert 계산 자체는 큰 matrix multiplication으로 효율적이어도 네트워크 대역폭, token 분포의 불균형, 작은 expert batch가 처리량을 제한할 수 있다. data·tensor·pipeline parallelism과 어떻게 조합하는지도 중요하다.",
        "혼합 정밀도에서 router logits가 불안정하거나 특정 expert만 계속 선택되면 expert collapse가 일어날 수 있다. routing 통계, expert별 token 수, dropped token, auxiliary loss와 통신 시간을 관측해야 한다. 품질 지표만 보면 시스템 병목을 놓친다."
      ]},
      {title:"추론 비용은 FLOPs만으로 결정되지 않는다",paragraphs:[
        "MoE는 활성 FLOPs 대비 큰 지식 용량을 제공할 수 있지만 메모리에서 expert weight를 읽는 비용과 분산 통신이 남는다. batch가 작고 latency가 중요한 온라인 서비스에서는 필요한 expert가 장치 곳곳에 흩어져 dense 모델보다 비효율적일 수 있다. 반대로 충분한 batch와 좋은 routing locality가 있으면 높은 처리량을 얻을 수 있다.",
        "모델 비교에서 ‘X billion parameters’가 총 파라미터인지 토큰당 활성 파라미터인지 확인한다. 공개되지 않은 expert 수·top-k·shared expert·routing 방식은 추정하지 않는다. 같은 활성 파라미터라도 attention 크기, KV cache, sequence length와 serving stack 때문에 실제 비용이 달라진다."
      ],caution:"MoE의 expert 이름을 관찰된 몇 개 token만으로 언어·분야 전문가라고 단정하지 않는다. routing은 층마다 다르고 해석 가능한 분업과 일치하지 않을 수 있다."},
      {title:"Switch에서 shared expert와 fine-grained routing까지",paragraphs:[
        "초기 sparse MoE 이후 Switch Transformer는 top-1 routing으로 구조를 단순화하고 대규모 학습의 안정성 문제를 다뤘다. 이후 모델들은 top-2, shared expert, 더 잘게 나눈 expert, 보조 손실을 줄이는 balancing 등 다양한 선택을 사용한다. 어느 방식이 항상 우수한 것이 아니라 하드웨어·batch·품질 목표의 결합이다.",
        "2026년의 MoE 논의를 읽을 때는 architecture 공개 범위를 먼저 본다. 파라미터 수 마케팅보다 expert 배치, 활성 수, routing granularity, training token, 추론 환경과 독립 평가를 함께 확인해야 계통 간 비교가 가능하다."
      ]}
    ],
    implementationChecklist:["총/활성 파라미터와 token당 선택 expert 수를 따로 기록한다.","expert별 token·capacity overflow·routing entropy를 계층별로 관측한다.","all-to-all 시간과 expert GEMM 시간을 분리 profile한다.","동일 latency·memory 조건에서 dense baseline과 품질 및 처리량을 비교한다."],
    misconceptions:[{myth:"활성 파라미터가 같으면 MoE와 dense 모델의 실행 비용도 같다.",correction:"weight memory, dispatch, 통신, load imbalance가 추가되므로 실제 latency와 throughput을 측정해야 한다."},{myth:"expert는 자동으로 사람이 이해할 수 있는 분야별 전문가가 된다.",correction:"router가 만든 분업은 분산되고 층마다 달라 명시적 직업 분류와 같지 않다."}],
    resources:[{type:"원 논문",title:"Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer",url:"https://arxiv.org/abs/1701.06538",note:"학습 가능한 sparse gate와 조건부 계산의 초기 대규모 구현을 본다."},{type:"원 논문",title:"Switch Transformers",url:"https://arxiv.org/abs/2101.03961",note:"top-1 routing, 균형, 대규모 학습의 안정성 문제를 본다."},{type:"추가 읽기",title:"Mixtral of Experts",url:"https://arxiv.org/abs/2401.04088",note:"공개 가중치 Transformer MoE의 구조와 평가 사례를 확인한다."}]
  },
  "kv-cache": {
    estimatedMinutes: 34,
    objectives:["prefill과 decode에서 KV cache가 제거하는 반복 계산을 설명한다.","layer·KV head·sequence·head dimension으로 cache 메모리를 계산한다.","MHA·MQA·GQA와 paging·prefix sharing이 serving에 미치는 영향을 구분한다."],
    sections:[
      {title:"이전 토큰의 key와 value를 다시 계산하지 않는다",paragraphs:[
        "autoregressive 생성에서 t번째 token은 앞선 1…t−1 token을 모두 참고한다. cache가 없다면 매 단계마다 전체 prefix를 Transformer에 다시 넣어 과거 token의 K와 V를 반복 계산한다. KV cache는 각 layer에서 이미 계산한 K,V를 저장하고 새 token의 K,V만 append한다. 새 query는 cache 전체와 attention을 계산한다.",
        "prompt 전체를 병렬 처리해 초기 cache를 만드는 단계를 prefill, 이후 한 token씩 생성하는 단계를 decode라 부른다. prefill은 큰 행렬 연산으로 compute-bound가 되기 쉽고 decode는 한 token이 거대한 weight와 cache를 읽어 memory-bandwidth-bound가 되기 쉽다. 이 구분이 batching과 latency 최적화의 출발점이다."
      ]},
      {title:"메모리 크기를 shape로 계산한다",paragraphs:[
        "한 요청의 cache는 대략 layers×2(K,V)×sequence×KV_heads×head_dim×bytes 형태다. batch가 늘면 요청별 유효 길이에 따라 합산된다. 예를 들어 32 layers, 8 KV heads, head_dim 128, FP16, 8k tokens라면 약 32×2×8192×8×128×2 bytes, 즉 약 1 GiB가 된다. model weight와 activation 외에 요청 하나가 차지하는 값이다.",
        "MHA는 query head마다 K,V head가 있다. MQA는 모든 query head가 하나의 K,V head를 공유해 cache를 크게 줄이지만 품질 저하 가능성이 있다. GQA는 여러 query head가 한 K,V head를 공유하는 group을 만들어 중간 지점을 택한다. GQA 논문은 MHA checkpoint를 적은 추가 compute로 uptrain하는 방법과 품질·속도 절충을 제시했다."
      ],formula:{label:"요청 하나의 근사 KV 메모리",value:"M_KV ≈ L × 2 × T × H_KV × D_head × bytes",note:"구현의 tensor padding, block 할당, quantization, beam/prefix sharing에 따라 실제 사용량은 달라진다."}},
      {title:"연속 메모리 예약이 fragmentation을 만든다",paragraphs:[
        "생성 길이는 요청마다 다르고 미리 정확히 알 수 없다. 최대 길이만큼 연속 공간을 예약하면 내부 낭비가 커지고, 요청이 끝났다 시작되며 빈 공간이 흩어진다. 결국 GPU에 여유 byte가 있어도 새 cache를 연속으로 배치하지 못하는 fragmentation이 생긴다.",
        "PagedAttention은 운영체제의 paging과 비슷하게 KV를 고정 크기 block으로 나누고 논리적 token 위치를 물리 block에 매핑한다. 필요한 만큼 block을 할당하고 비연속 공간을 사용할 수 있으며 prefix나 beam 간 block 공유도 가능하다. 논문 평가의 처리량 배수는 해당 hardware·workload의 결과이므로 모든 서비스의 보장 수치로 재사용하지 않는다."
      ]},
      {title:"cache 정책은 context 관리 정책이다",paragraphs:[
        "긴 대화에서 cache를 무한히 유지할 수는 없다. sliding window는 오래된 token을 버리고 최근 window만 남긴다. prefix caching은 동일한 system prompt나 문서 prefix의 block을 요청 간 재사용한다. cache quantization은 K,V 정밀도를 낮춰 capacity를 늘리지만 attention 품질과 dequantization 비용을 검증해야 한다.",
        "모델이 특정 sliding-window attention이나 recurrent state를 사용하면 layer마다 보존 범위가 다를 수 있다. tool call 뒤 prompt를 재구성하거나 chat template가 한 글자라도 바뀌면 prefix cache hit가 깨질 수 있다. cache key에는 model·token IDs·position scheme·adapter 등 출력을 바꾸는 요소가 포함돼야 한다."
      ],caution:"KV cache는 모델의 장기 기억이 아니다. 현재 forward pass의 과거 key/value tensor를 보존하는 계산 최적화이며 대화 밖의 지속 기억과는 별개다."}
    ],
    implementationChecklist:["모델 config로 layer·KV head·head dimension·dtype별 bytes/token을 계산한다.","prefill latency, time-to-first-token, inter-token latency를 나눠 측정한다.","요청 길이 분포에서 block waste와 eviction, prefix hit rate를 기록한다.","position IDs·adapter·model revision을 cache key에 반영한다."],
    misconceptions:[{myth:"KV cache를 쓰면 attention이 길이에 무관한 상수 시간이 된다.",correction:"과거 K,V 재계산은 줄지만 새 query가 읽는 cache와 attention 범위는 sequence length에 따라 커진다."},{myth:"큰 context window면 cache도 항상 충분하다.",correction:"모델의 허용 길이와 serving 시스템이 동시 요청에 할당 가능한 KV 메모리는 다른 제한이다."}],
    resources:[{type:"원 논문",title:"GQA: Training Generalized Multi-Query Transformer Models",url:"https://arxiv.org/abs/2305.13245",note:"KV head 공유가 품질과 추론 속도 사이를 어떻게 절충하는지 본다."},{type:"원 논문",title:"Efficient Memory Management for Large Language Model Serving with PagedAttention",url:"https://arxiv.org/abs/2309.06180",note:"KV block 관리, fragmentation과 sharing 설계를 본다."},{type:"공식 구현",title:"vLLM documentation",url:"https://docs.vllm.ai/",note:"실제 cache configuration과 serving 동작은 사용 버전 문서에서 확인한다."}]
  },
  "inference-serving": {
    estimatedMinutes: 42,
    objectives:["LLM serving을 scheduler·model executor·cache manager·API 계층으로 분해한다.","latency, throughput, goodput와 prefill/decode 병목을 구분한다.","continuous batching·paged KV·prefix caching·speculative decoding의 적용 조건을 판단한다."],
    sections:[
      {title:"모델 forward를 호출하는 것과 서비스를 운영하는 것은 다르다",paragraphs:[
        "추론 서빙은 요청을 받고 token화한 뒤 GPU에 배치하고, prefill과 반복 decode를 스케줄하며, KV cache와 sampling 상태를 관리하고, token을 streaming하고, 취소·timeout·오류를 처리하는 시스템이다. 같은 checkpoint라도 scheduler와 kernel, batch 정책에 따라 비용과 체감 속도가 크게 달라진다.",
        "온라인 chat은 첫 token이 빨리 보여야 하고 token 간 간격도 안정적이어야 한다. offline batch는 개별 지연보다 시간당 처리 token이 중요할 수 있다. 목표가 다르면 최적 batch와 queue 정책도 달라진다. 평균 latency 하나만 보고 두 workload를 비교하면 잘못된 결론을 낸다."
      ]},
      {title:"TTFT, TPOT, throughput, goodput을 따로 본다",paragraphs:[
        "time to first token(TTFT)은 queue와 tokenization, prompt prefill을 포함해 첫 출력까지 걸리는 시간이다. time per output token(TPOT) 또는 inter-token latency는 이후 decode 속도를 본다. end-to-end latency는 둘과 출력 길이를 합친 사용자 경험이다. throughput은 초당 요청이나 token 수지만 SLO를 넘긴 느린 응답까지 포함할 수 있다.",
        "goodput은 TTFT·TPOT 같은 품질 기준을 지키며 완료한 처리량을 강조한다. p50만 보면 긴 prompt나 burst 때의 p95/p99 악화를 숨긴다. prompt 길이, output 길이, 동시성, sampling, tool schema를 기록한 대표 workload로 측정하고 warm-up·cold start·cache hit를 분리한다."
      ],formula:{label:"단순화한 생성 지연",value:"latency ≈ queue + prefill(prompt) + Σ decode_step(output tokens)",note:"각 항은 batch와 cache 상태에 따라 달라진다. speculative decoding이나 parallel sampling이 있으면 단순 합보다 복잡해진다."}},
      {title:"Continuous batching은 완료된 자리를 즉시 재사용한다",paragraphs:[
        "정적 batch는 모든 요청이 끝날 때까지 같은 묶음을 유지해 짧은 요청이 긴 요청을 기다리게 한다. continuous batching은 decode iteration 경계에서 완료·취소 요청을 제거하고 대기 요청을 투입한다. GPU utilization을 높이지만 새 prefill이 진행 중 decode의 지연을 방해하지 않도록 token budget과 우선순위가 필요하다.",
        "prefill은 많은 token을 병렬 계산하고 decode는 요청당 보통 한 token을 계산한다. 둘을 같은 batch에 섞는 정책, chunked prefill로 큰 prompt를 나누는 정책, 별도 worker로 분리하는 정책은 TTFT와 TPOT를 서로 다르게 바꾼다. 사용자의 SLO와 traffic 분포가 선택 기준이다."
      ]},
      {title:"메모리 관리가 동시성을 결정한다",paragraphs:[
        "GPU 메모리는 model weights, temporary activation/workspace, CUDA graph buffer, KV cache가 나눈다. weight quantization으로 model 영역을 줄여도 KV가 긴 요청과 동시성에 따라 커진다. PagedAttention은 KV를 block 단위로 할당해 fragmentation과 사전 예약 낭비를 줄이고 더 많은 요청을 수용하도록 설계됐다.",
        "prefix caching은 반복되는 system prompt나 공통 문서 prefix의 prefill을 줄인다. 그러나 token sequence가 정확히 같고 position·model·adapter 상태가 호환될 때만 안전하다. cache hit rate만 높이려고 서로 다른 권한의 prompt를 공유하면 정보 누출 위험이 생긴다. tenant와 ACL 경계를 cache 설계에 포함한다."
      ]},
      {title:"병렬화는 통신과 batch 크기의 교환이다",paragraphs:[
        "tensor parallelism은 한 layer의 matrix를 여러 장치에 나누고 collective 통신을 매 layer 수행한다. pipeline parallelism은 layer 구간을 나눠 microbatch를 흘리며 bubble을 관리한다. data parallel replica는 요청을 복제본에 분산한다. expert parallelism은 MoE expert와 token dispatch를 나눈다. 모델 크기, interconnect와 workload에 맞춰 조합한다.",
        "작은 batch의 저지연 요청에서는 장치를 늘려도 통신 때문에 빨라지지 않을 수 있다. 반대로 큰 offline batch는 처리량을 위해 높은 병렬도를 활용할 수 있다. benchmark에는 GPU 종류·수, precision, prompt/output length, concurrency와 측정 percentile이 반드시 따라야 한다."
      ]},
      {title:"최적화는 정확성과 운영 계약을 보존해야 한다",paragraphs:[
        "quantization, fused kernel, speculative decoding, CUDA graph는 속도를 높일 수 있지만 출력 분포·지원 sampling·최대 길이·adapter 호환성에 영향을 줄 수 있다. speculative decoding은 draft가 제안한 여러 token을 target이 검증해 target forward 횟수를 줄이지만 acceptance rate가 낮으면 이득이 작다.",
        "production에서는 backpressure, rate limit, cancellation, retry, admission control, model revision pinning과 관측이 필요하다. timeout 뒤 GPU 작업이 계속되면 capacity가 새고, 무제한 긴 prompt는 다른 사용자의 SLO를 무너뜨린다. 성능 최적화와 제품 정책을 별도 층으로 두되 metric은 함께 연결한다."
      ],caution:"논문이나 vendor가 보고한 처리량 배수를 자사 서비스 수치로 옮기지 않는다. hardware, 길이 분포, batch, precision과 baseline이 다르면 배수는 재현되지 않는다."},
      {title:"실전 용량 계획은 분포와 실패 모드에서 시작한다",paragraphs:[
        "평균 prompt 1k라는 값만으로는 부족하다. p95 prompt와 output, burst concurrency, streaming 연결 시간, 긴 tool result가 capacity를 결정한다. load test는 실제 길이의 결합 분포와 도착 패턴을 재현하고 saturation 이전·이후의 queue 증가를 관찰해야 한다.",
        "OOM, worker crash, network partition, cache eviction storm, tokenizer mismatch, model reload를 주입해 복구를 확인한다. 품질 회귀 test도 배포 gate에 둔다. 더 빠른 kernel이 특정 입력에서 NaN이나 token 차이를 만든다면 serving 개선이 아니다."
      ]}
    ],
    implementationChecklist:["TTFT·TPOT·E2E·throughput·goodput을 prompt/output 길이별 percentile로 기록한다.","scheduler queue, prefill/decode token budget, KV 사용량과 eviction을 tracing한다.","대표 traffic에서 continuous batching과 chunked prefill 정책을 비교한다.","취소·timeout·OOM·worker 재시작과 권한별 prefix cache 격리를 시험한다.","모델·runtime·kernel revision과 benchmark 조건을 함께 보관한다."],
    misconceptions:[{myth:"GPU utilization이 높으면 좋은 serving 시스템이다.",correction:"높은 utilization이 queue와 tail latency를 악화시킬 수 있다. SLO를 지키는 goodput이 더 직접적인 목표다."},{myth:"batch를 키우면 언제나 효율이 좋아진다.",correction:"처리량은 늘 수 있지만 TTFT·TPOT와 메모리가 악화되며 어느 지점부터 포화된다."},{myth:"서빙 최적화는 모델 출력과 무관한 엔지니어링이다.",correction:"precision, kernel, cache와 decoding 전략이 수치 안정성 및 출력 분포에 영향을 줄 수 있어 품질 검증이 필요하다."}],
    resources:[{type:"원 논문",title:"Efficient Memory Management for Large Language Model Serving with PagedAttention",url:"https://arxiv.org/abs/2309.06180",note:"KV memory fragmentation과 block 기반 관리, serving 평가 방법을 본다."},{type:"원 논문",title:"Orca: A Distributed Serving System for Transformer-Based Generative Models",url:"https://www.usenix.org/conference/osdi22/presentation/yu",note:"iteration-level scheduling과 selective batching의 시스템 배경을 본다."},{type:"공식 구현",title:"vLLM documentation",url:"https://docs.vllm.ai/",note:"continuous batching, distributed serving와 지원 기능은 현재 버전 문서로 확인한다."}]
  },
  normalization: {
    estimatedMinutes: 30,
    objectives:["LayerNorm과 RMSNorm의 수식·shape·차이를 설명한다.","Pre-Norm과 Post-Norm이 residual 경로와 gradient에 미치는 영향을 구분한다.","epsilon, dtype, fused kernel에서 생기는 수치 문제를 점검한다."],
    sections:[
      {title:"정규화는 token별 hidden vector의 규모를 다룬다",paragraphs:[
        "Transformer의 residual stream은 여러 attention·FFN 출력을 계속 더한다. 층이 깊어질수록 activation 규모와 gradient 경로가 불안정해질 수 있다. LayerNorm은 각 token의 d차원 hidden vector 안에서 평균과 분산을 계산해 표준화하고 학습 가능한 scale γ와 bias β를 적용한다. batch token끼리 통계를 섞는 BatchNorm과 다르다.",
        "입력이 B×T×D라면 통계는 마지막 D축에서 각 B,T 위치별로 계산된다. 그래서 길이가 다른 요청이나 batch 크기가 달라도 같은 token vector의 정규화 방식은 변하지 않는다. 모델 config의 normalized_shape와 실제 hidden dimension이 맞아야 한다."
      ],formula:{label:"LayerNorm",value:"LN(x)=γ⊙(x−μ)/sqrt(σ²+ε)+β",note:"μ와 σ²는 token 하나의 D개 feature에서 계산한다. 출력 shape는 입력과 같은 B×T×D다."}},
      {title:"RMSNorm은 평균을 빼지 않고 크기만 맞춘다",paragraphs:[
        "RMSNorm은 re-centering을 생략하고 root mean square로 나눈다. RMS(x)=sqrt(mean(x²)+ε)이고 출력은 γ⊙x/RMS(x)다. 원 논문은 LayerNorm의 re-centering invariance가 필수인지 질문하고 더 단순한 연산을 제안했다. 현대 LLM에서 널리 쓰이지만 모든 구조에서 무조건 우월하다는 뜻은 아니다.",
        "bias가 없고 평균 계산이 빠져 kernel을 단순화할 수 있다. 다만 실제 속도 차이는 fused implementation, memory traffic과 전체 block 비용에 좌우된다. checkpoint가 LayerNorm으로 학습됐는데 RMSNorm으로 임의 교체하면 같은 함수가 아니므로 정상 동작을 기대할 수 없다."
      ],formula:{label:"RMSNorm",value:"RMSNorm(x)=γ⊙x/sqrt(mean(x²)+ε)",note:"평균 μ를 빼지 않는다. scale parameter는 D개이며 구현에 따라 unit offset 등 세부 convention이 다를 수 있다."}},
      {title:"Pre-Norm과 Post-Norm은 residual의 위치가 다르다",paragraphs:[
        "Post-Norm은 원 Transformer처럼 sublayer 출력을 residual에 더한 뒤 정규화한다: y=Norm(x+F(x)). Pre-Norm은 먼저 정규화한 입력을 sublayer에 넣고 residual에는 identity 경로를 둔다: y=x+F(Norm(x)). Pre-Norm은 깊은 네트워크에서 gradient가 identity path를 따라 흐르기 쉬워 학습 안정성이 좋은 경우가 많다.",
        "구조 선택은 최종 normalization, residual scaling, initialization과 함께 본다. 같은 ‘RMSNorm 사용’이라는 설명만으로 block ordering을 알 수 없다. 공개 architecture diagram과 구현을 확인하고 state dict key만으로 섣불리 추정하지 않는다."
      ]},
      {title:"수치 안정성과 fused implementation",paragraphs:[
        "FP16/BF16 입력의 제곱과 합은 overflow·정밀도 손실에 민감할 수 있어 통계를 FP32로 누적한 뒤 원 dtype으로 되돌리는 구현이 흔하다. ε는 0에 가까운 분모를 막지만 모델이 학습한 값과 다른 epsilon은 작은 출력 차이를 누적시킬 수 있다.",
        "실전 runtime은 residual add와 normalization을 하나의 fused kernel로 묶어 memory round trip을 줄인다. tensor parallel에서 hidden dimension이 분할돼 있으면 통계가 local shard만이 아니라 전체 normalized dimension을 반영하는지 구현을 확인한다."
      ],caution:"‘normalization이 activation을 항상 평균 0, 분산 1로 만든다’는 설명은 RMSNorm에는 맞지 않으며, γ·β 적용 뒤의 최종 출력에도 그대로 맞지 않는다."}
    ],
    implementationChecklist:["정규화 축과 hidden dimension, γ/β shape를 확인한다.","checkpoint의 epsilon·bias·unit-offset convention을 보존한다.","저정밀 입력에서도 통계 누적 dtype과 NaN 발생을 시험한다.","fused/unfused kernel의 출력 오차와 latency를 함께 비교한다."],
    misconceptions:[{myth:"LayerNorm과 RMSNorm은 이름만 다르고 교체 가능하다.",correction:"평균 제거 여부와 parameterization이 달라 재학습 없이 함수적으로 교체할 수 없다."},{myth:"Pre-Norm이면 깊이에 관계없이 학습이 자동으로 안정적이다.",correction:"initialization, residual scale, optimizer와 정밀도 등 다른 조건도 함께 작용한다."}],
    resources:[{type:"원 논문",title:"Layer Normalization",url:"https://arxiv.org/abs/1607.06450",note:"sample별 feature 통계를 쓰는 원 정의를 본다."},{type:"원 논문",title:"Root Mean Square Layer Normalization",url:"https://arxiv.org/abs/1910.07467",note:"re-centering을 제거한 수식과 실험을 확인한다."},{type:"추가 읽기",title:"On Layer Normalization in the Transformer Architecture",url:"https://arxiv.org/abs/2002.04745",note:"Pre-LN과 Post-LN의 gradient 관점을 본다."}]
  },
  "ffn-swiglu": {
    estimatedMinutes: 31,
    objectives:["attention과 FFN의 token·channel 혼합 역할을 구분한다.","표준 FFN과 GLU/SwiGLU의 tensor shape와 파라미터 비용을 계산한다.","MoE가 왜 대개 FFN expert의 묶음으로 구현되는지 연결한다."],
    sections:[
      {title:"Attention이 token을 섞고 FFN이 채널을 변환한다",paragraphs:[
        "Transformer block의 FFN은 각 token 위치에 같은 함수를 독립 적용한다. B×T×D 입력을 펼쳐 보면 B·T개의 D차원 벡터에 동일한 MLP를 쓰는 셈이다. attention이 서로 다른 위치의 정보를 모은 뒤 FFN은 각 위치에서 feature를 확장하고 비선형적으로 재조합한다.",
        "표준 FFN은 D에서 D_ff로 넓힌 뒤 activation을 적용하고 다시 D로 줄인다. 원 Transformer는 ReLU와 대략 4D의 intermediate width를 사용했다. 현대 decoder는 GELU, SiLU와 gated variant를 많이 쓰며 폭의 비율도 parameter budget에 맞춰 조정한다."
      ],formula:{label:"표준 position-wise FFN",value:"FFN(x)=W₂ φ(W₁x+b₁)+b₂",note:"x shape B×T×D, W₁은 D×D_ff, W₂는 D_ff×D이며 token 축에는 같은 가중치가 적용된다."}},
      {title:"GLU는 내용 경로와 gate 경로를 곱한다",paragraphs:[
        "gated FFN은 입력을 두 번 투영한다. 한 경로에 activation을 적용해 gate를 만들고 다른 내용 경로와 원소별 곱을 한 뒤 output projection을 거친다. SwiGLU는 gate activation으로 Swish/SiLU를 사용한다. 두 input projection이 있으므로 같은 intermediate width라면 표준 FFN보다 파라미터와 계산이 커진다.",
        "공정한 비교에서는 전체 parameter/FLOP budget을 맞추기 위해 gated FFN의 D_ff를 줄인다. 흔히 보이는 8D/3 부근의 폭은 두 입력 projection과 한 출력 projection의 총 비용을 표준 4D FFN과 비슷하게 맞추려는 계산에서 나온다. 실제 모델의 round-up 배수와 tensor-parallel shard 조건에 따라 값은 달라진다."
      ],formula:{label:"SwiGLU FFN",value:"SwiGLU(x)=W_o[SiLU(xW_g) ⊙ (xW_u)]",note:"W_g와 W_u는 D×D_ff, W_o는 D_ff×D다. bias 사용 여부와 행렬 표기 방향은 구현마다 다르다."}},
      {title:"넓은 intermediate는 지식과 계산의 큰 부분을 차지한다",paragraphs:[
        "decoder LLM에서 FFN weight는 전체 파라미터와 token당 FLOPs의 큰 몫이다. 그래서 양자화, tensor parallel, fused activation, MoE가 FFN을 중심으로 설계된다. activation tensor B×T×D_ff를 완전히 materialize하면 메모리 traffic이 커져 gate·multiply·projection을 fusion하는 kernel이 중요하다.",
        "학습에서는 backward를 위해 intermediate activation을 저장하거나 recompute한다. inference decode에서는 T가 작아 weight 읽기가 병목이 되기 쉽다. 같은 수식이라도 prefill과 decode에서 최적 kernel tile과 병렬화 전략이 다를 수 있다."
      ]},
      {title:"MoE는 하나의 FFN을 여러 조건부 FFN으로 바꾼다",paragraphs:[
        "MoE Transformer는 대개 attention은 공유하고 FFN 자리에 여러 expert FFN을 둔다. router가 token마다 top-k expert를 선택한다. 따라서 SwiGLU 같은 expert 내부 구조, expert 수와 width, 활성 expert 수를 함께 알아야 활성 계산량을 해석할 수 있다.",
        "FFN neuron이나 expert를 사실 데이터베이스의 한 항목처럼 해석하면 위험하다. 일부 feature가 특정 사실·패턴과 상관될 수 있지만 표현은 분산되고 activation은 문맥과 layer에 따라 달라진다. 인과적 해석에는 intervention과 재현 평가가 필요하다."
      ],caution:"SwiGLU가 쓰였다는 사실만으로 모델 품질 향상분을 분리해 귀속할 수 없다. 데이터, 폭, optimizer와 학습 compute를 통제한 비교가 필요하다."}
    ],
    implementationChecklist:["W_g·W_u·W_o와 intermediate shape를 checkpoint config에서 확인한다.","표준 FFN 비교 시 총 파라미터와 FLOPs를 맞춘다.","fused kernel과 reference 구현의 출력/gradient 허용 오차를 시험한다.","tensor-parallel shard가 intermediate width를 나눌 수 있는지 확인한다."],
    misconceptions:[{myth:"Transformer는 attention만으로 계산한다.",correction:"각 block의 FFN은 파라미터와 계산의 큰 부분이며 feature 변환의 핵심이다."},{myth:"SwiGLU는 SiLU로 activation 이름만 바꾼 것이다.",correction:"두 input projection을 곱하는 gated 구조이므로 표준 단일 경로 FFN과 parameterization이 다르다."}],
    resources:[{type:"원 논문",title:"Attention Is All You Need",url:"https://arxiv.org/abs/1706.03762",note:"원 position-wise FFN의 구조와 폭을 확인한다."},{type:"원 논문",title:"GLU Variants Improve Transformer",url:"https://arxiv.org/abs/2002.05202",note:"GEGLU·SwiGLU 등 gated variant와 비교 조건을 본다."}]
  },
  "attention-variants": {
    estimatedMinutes: 34,
    objectives:["MHA·MQA·GQA의 Q/K/V head shape를 비교한다.","KV head 공유가 cache bytes와 decode bandwidth를 줄이는 이유를 계산한다.","head sharing과 FlashAttention 같은 kernel 최적화를 서로 다른 축으로 구분한다."],
    sections:[
      {title:"MHA는 query마다 독립적인 key/value 표현을 둔다",paragraphs:[
        "Multi-Head Attention은 hidden D를 H개의 query head로 나눠 각 head가 서로 다른 Q,K,V projection을 학습한다. head dimension d_h=D/H라면 일반적인 MHA의 Q,K,V shape는 B×H×T×d_h다. 여러 관계를 병렬로 표현할 자유가 있지만 decode 때 모든 layer·token의 H개 K,V를 cache해야 한다.",
        "새 token 하나를 만들 때 query는 한 위치뿐이어도 과거 K,V 전체를 GPU memory에서 읽는다. 긴 context와 많은 동시 요청에서는 arithmetic보다 이 memory traffic이 병목이 된다. 이 문제를 줄이기 위해 query head는 유지하고 K,V head만 공유하는 계열이 등장했다."
      ]},
      {title:"MQA는 하나, GQA는 몇 개의 KV head를 공유한다",paragraphs:[
        "Multi-Query Attention은 H개의 query head가 K,V head 하나를 공유한다. KV cache는 대략 MHA의 1/H로 줄지만, K,V 표현의 자유를 크게 제한해 task나 모델에 따라 품질 손실이 생길 수 있다. Grouped-Query Attention은 H_q query head를 H_kv group으로 나누고 각 group이 하나의 K,V head를 공유한다.",
        "예를 들어 H_q=32, H_kv=8이면 query 4개가 K,V 한 쌍을 공유하고 cache는 같은 d_h의 MHA 대비 약 1/4이다. GQA 논문은 기존 MHA checkpoint를 원 pretraining compute의 일부로 uptrain하는 방법을 제시하고 MHA에 가까운 품질과 MQA에 가까운 속도를 보고했다. 이 결과는 논문의 설정 안에서 해석한다."
      ],formula:{label:"KV cache head 축 절감",value:"cache ratio vs MHA ≈ H_kv / H_q",note:"layer·sequence·head_dim·dtype이 같다는 단순화다. 실제 latency는 kernel, batch와 memory layout에 좌우된다."}},
      {title:"Training과 decode에서 이득의 크기가 다르다",paragraphs:[
        "training과 prefill은 많은 token을 병렬 처리해 QKᵀ와 FFN 계산 비중이 크다. K,V projection과 activation이 줄어드는 이점은 있지만 전체 학습 FLOPs가 cache 비율만큼 줄지는 않는다. decode는 한 step마다 긴 cache를 읽으므로 KV head 감소의 memory bandwidth 이득이 더 직접적이다.",
        "모델 architecture를 읽을 때 num_attention_heads와 num_key_value_heads를 따로 확인한다. 둘이 같으면 MHA, KV head가 1이면 MQA, 그 사이면 GQA로 볼 수 있다. head dimension이나 tensor parallel partition 조건이 맞지 않으면 runtime이 느린 fallback kernel을 쓸 수도 있다."
      ]},
      {title:"FlashAttention은 head 공유가 아니라 exact attention의 IO 최적화다",paragraphs:[
        "FlashAttention은 attention score의 거대한 T×T 행렬을 HBM에 전부 저장하지 않고 tile 단위로 계산하며 online softmax를 사용해 memory IO를 줄인다. attention 결과를 근사하는 sparse 방식이 아니며 MHA·GQA 어느 쪽에도 적용 가능한 kernel 축의 최적화다.",
        "따라서 ‘GQA vs FlashAttention’을 양자택일로 비교하면 범주가 다르다. GQA는 architecture와 cache shape를 바꾸고, FlashAttention은 같은 수학적 attention을 hardware-friendly하게 계산한다. sliding-window·sparse attention은 볼 수 있는 연결 자체를 제한하는 또 다른 축이다."
      ],caution:"head 수만 보고 품질이나 속도를 단정하지 않는다. head dimension, layer 수, cache dtype, context 길이와 runtime kernel을 함께 봐야 한다."}
    ],
    implementationChecklist:["num_attention_heads와 num_key_value_heads를 별도로 기록한다.","K/V repeat 또는 broadcast가 실제 tensor 복사를 만들지 않는지 profile한다.","MHA 대비 cache bytes/token과 decode TPOT를 같은 workload에서 측정한다.","FlashAttention 지원 shape·mask·dtype과 fallback 여부를 확인한다."],
    misconceptions:[{myth:"GQA는 attention head 수를 줄여 모델 전체를 작게 만든다.",correction:"query head는 유지하고 K,V head를 공유하는 것이 핵심이며 다른 weight와 FFN은 그대로일 수 있다."},{myth:"FlashAttention은 덜 중요한 token을 버리는 근사법이다.",correction:"원 논문 방식은 IO-aware tiling으로 표준 attention을 정확하게 계산한다."}],
    resources:[{type:"원 논문",title:"Fast Transformer Decoding: One Write-Head is All You Need",url:"https://arxiv.org/abs/1911.02150",note:"MQA가 decoder memory bandwidth를 줄이려는 배경을 본다."},{type:"원 논문",title:"GQA: Training Generalized Multi-Query Transformer Models",url:"https://arxiv.org/abs/2305.13245",note:"GQA 정의와 MHA checkpoint uptraining 비교를 본다."},{type:"원 논문",title:"FlashAttention",url:"https://arxiv.org/abs/2205.14135",note:"IO complexity와 exact tiled attention을 구분한다."}]
  },
  "state-space-models": {
    estimatedMinutes: 40,
    objectives:["상태공간 recurrence와 convolution 관점을 연결한다.","Mamba의 input-dependent selective parameters와 hardware-aware scan의 역할을 설명한다.","attention 대비 선형 시간·고정 상태의 장점과 정보 압축 한계를 함께 평가한다."],
    sections:[
      {title:"전체 과거를 다시 읽는 대신 상태를 갱신한다",paragraphs:[
        "state-space sequence model은 입력 x_t를 받아 이전 상태 h_{t−1}을 h_t로 갱신하고 상태에서 출력 y_t를 읽는다. 선형 시간 불변 시스템의 이산형은 h_t=A h_{t−1}+B x_t, y_t=C h_t+D x_t로 쓸 수 있다. 현재 state가 과거를 압축하므로 autoregressive inference에서 sequence 길이에 비례해 커지는 KV cache가 필요하지 않다.",
        "이 recurrence는 순차적으로는 O(T)에 계산되며 특정 조건에서는 긴 convolution kernel로 바꿔 training을 병렬화할 수 있다. 고전 RNN과 다른 점은 긴 의존성을 안정적으로 모델링하도록 구조화된 state matrix와 효율적인 parallel scan/convolution 알고리즘을 설계한다는 데 있다."
      ],formula:{label:"이산 상태공간 갱신",value:"h_t = A h_(t−1) + B x_t,   y_t = C h_t + D x_t",note:"실제 SSM은 연속 시스템의 discretization, 구조화된 A와 여러 channel/batch 차원을 사용한다."}},
      {title:"고정된 dynamics는 내용에 따라 기억하고 잊기 어렵다",paragraphs:[
        "time-invariant A,B,C가 모든 token에 같으면 입력 내용에 따라 특정 정보를 선택적으로 보존하거나 무시하기 어렵다. 단순히 오래 기억하는 필터와 문맥에서 중요한 이름·지시를 골라 유지하는 것은 다른 문제다. attention은 query에 따라 과거 위치를 직접 선택하지만 SSM은 state update에 선택성을 넣어야 한다.",
        "Mamba는 SSM parameter 일부를 입력에 의존하게 만들어 token 내용에 따라 정보를 state에 넣거나 유지하는 방식을 제안한다. 이 변화는 고정 convolution만으로는 계산할 수 없게 만들지만 hardware-aware parallel scan으로 GPU에서 효율적으로 처리하도록 함께 설계됐다."
      ]},
      {title:"Mamba block은 selective SSM과 local mixing을 결합한다",paragraphs:[
        "Mamba 계열 block은 입력 projection, 짧은 causal convolution, activation과 selective SSM scan, gate, output projection을 결합한다. 구체적 tensor layout과 expansion factor는 구현과 세대에 따라 다르므로 ‘attention 없는 RNN’ 한 문장으로 환원하면 실제 병목을 놓친다.",
        "training에서는 sequence 전체에 parallel scan을 사용하고 inference에서는 현재 state만 갱신한다. 긴 sequence에서 attention의 T² score matrix를 피하는 장점이 있지만 큰 matrix projection과 scan kernel의 memory access는 남는다. 이론적 complexity만으로 wall-clock 우위를 보장하지 않는다."
      ]},
      {title:"고정 크기 상태는 장점이자 병목이다",paragraphs:[
        "attention은 과거 token별 K,V를 보관해 필요할 때 세부 내용을 직접 참조한다. SSM은 과거를 제한된 state에 압축한다. streaming과 매우 긴 입력에는 유리할 수 있지만, 정확한 문자열 회수나 여러 멀리 떨어진 증거를 보존하는 과제에서는 압축 병목이 나타날 수 있다.",
        "그래서 현대 architecture는 pure attention, pure SSM뿐 아니라 attention과 SSM/conv를 섞는 hybrid도 사용한다. 어느 쪽이 낫다는 일반론보다 품질, training throughput, decode latency, state/cache memory, 지원 kernel과 목표 context 과제로 비교한다."
      ]},
      {title:"평가는 language modeling loss 밖까지 본다",paragraphs:[
        "perplexity와 일반 benchmark가 비슷해도 긴 문맥에서 exact recall, copying, induction, 시간 순서, in-context learning 특성이 다를 수 있다. 길이에 따른 품질 곡선과 state precision, chunk boundary, reset 정책을 시험한다. 문서 사이에서 state를 잘못 이어 붙이면 독립 요청의 정보가 섞일 수 있다.",
        "Mamba 원 논문은 selective SSM과 hardware-aware algorithm이 언어·audio·genomics에서 경쟁력 있는 결과를 보였다고 보고했다. 이후 모델의 개선을 원 Mamba의 동일한 구조로 가정하지 말고 각 기술 보고서에서 attention hybrid 여부와 공개 범위를 확인한다."
      ],caution:"선형 시간이라는 말은 무한한 기억이나 완벽한 long-context 이해를 뜻하지 않는다. 계산 복잡도와 정보 보존 능력은 별개의 질문이다."}
    ],
    implementationChecklist:["training parallel scan과 token-by-token inference state update를 각각 검증한다.","state dtype·reset·batch reorder가 요청 경계를 침범하지 않는지 시험한다.","동일 hardware와 품질 목표에서 attention baseline의 throughput·latency·memory를 비교한다.","길이별 exact recall과 장거리 추론 평가를 perplexity와 함께 실행한다."],
    misconceptions:[{myth:"SSM은 과거 token을 모두 state 안에 손실 없이 저장한다.",correction:"고정 크기 state는 과거를 압축하며 과제에 따라 정보 손실이 발생할 수 있다."},{myth:"O(T)이면 언제나 Transformer보다 빠르다.",correction:"kernel 효율, projection, sequence와 batch 크기, hardware에 따라 실제 속도는 달라진다."}],
    resources:[{type:"원 논문",title:"Efficiently Modeling Long Sequences with Structured State Spaces",url:"https://arxiv.org/abs/2111.00396",note:"S4의 구조화 state-space와 긴 sequence 배경을 본다."},{type:"원 논문",title:"Mamba: Linear-Time Sequence Modeling with Selective State Spaces",url:"https://arxiv.org/abs/2312.00752",note:"input-dependent selection과 hardware-aware scan의 결합을 확인한다."},{type:"추가 읽기",title:"Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality",url:"https://arxiv.org/abs/2405.21060",note:"후속 state-space duality 관점을 원 논문과 구분해 읽는다."}]
  },
  "fine-tuning": {
    estimatedMinutes: 32,
    objectives:["pretraining, supervised fine-tuning과 preference optimization을 구분한다.","full fine-tuning과 PEFT의 parameter·optimizer memory 차이를 계산한다.","catastrophic forgetting, data leakage와 base capability 회귀를 평가한다."],
    sections:[
      {title:"이미 학습된 분포를 목표 업무 쪽으로 이동시킨다",paragraphs:["fine-tuning은 pretrained parameter θ₀에서 시작해 더 작고 목적이 분명한 데이터의 loss로 parameter를 갱신하는 단계다. 분류 label, prompt-response, domain text, tool trace 등 데이터 형태에 따라 objective가 달라진다. ‘추가 학습’이라는 공통점만으로 instruction tuning, continued pretraining, preference optimization을 같은 것으로 부르면 안 된다.","continued pretraining은 domain의 raw text에서 next-token objective를 계속 사용한다. supervised fine-tuning(SFT)은 정답 response나 label을 조건부로 맞힌다. RLHF/DPO는 여러 response 사이의 선호를 사용한다. 실제 pipeline은 domain pretraining→SFT→preference/RL 순으로 결합할 수 있다."]},
      {title:"Full fine-tuning과 parameter-efficient adaptation",paragraphs:["full fine-tuning은 대부분 또는 모든 model weight에 gradient와 optimizer state를 둔다. Adam 계열에서는 weight 외에 gradient와 두 개 moment가 필요해 inference보다 memory가 훨씬 크다. activation memory도 sequence·batch·layer에 따라 커져 gradient checkpointing과 distributed sharding을 사용한다.","LoRA는 기존 weight W를 고정하고 저랭크 ΔW=BA만 학습한다. trainable parameter와 optimizer memory를 크게 줄이고 adapter를 교체할 수 있지만, rank와 target module이 부족하면 필요한 변화를 표현하지 못한다. QLoRA는 quantized base weight 위에서 adapter를 학습하지만 training 안정성과 kernel 지원을 검증해야 한다."],formula:{label:"LoRA update",value:"W' = W + (α/r)BA,   B∈R^(d_out×r), A∈R^(r×d_in)",note:"base W는 고정하고 rank r의 두 행렬만 학습한다. merge 여부와 inference adapter overhead는 runtime에 따라 다르다."}},
      {title:"데이터 형식이 곧 모델 행동의 계약이 된다",paragraphs:["chat fine-tuning에서는 system/user/assistant role과 special token, loss mask가 중요하다. user token까지 답으로 학습하거나 assistant 경계가 잘못되면 모델이 prompt를 복제하거나 role을 혼동한다. train과 inference의 chat template가 다르면 좋은 checkpoint도 성능이 무너진다.","작은 dataset은 duplication과 stylistic shortcut에 민감하다. 답변 길이, refusal, markdown 형식 같은 표면 신호가 label과 우연히 결합되면 모델은 과제 대신 지름길을 배운다. source provenance, split 기준과 contamination을 기록하고 동일 문서의 chunk가 train/test에 나뉘지 않게 한다."]},
      {title:"새 능력보다 회귀와 과적합을 먼저 찾는다",paragraphs:["fine-tuning task 점수만 오르면 성공처럼 보이지만 base model의 일반 능력, calibration, safety와 multilingual 성능이 떨어질 수 있다. domain data가 좁거나 learning rate·epoch가 크면 catastrophic forgetting이 생긴다. base checkpoint와 동일 benchmark plus domain holdout을 함께 평가한다.","training loss 최저점이 실제 답변 품질 최적점은 아니다. exact match뿐 아니라 사실성, instruction following, refusal, verbosity와 latency를 본다. 여러 seed와 unseen template에서 변화가 유지되는지도 확인한다."],caution:"fine-tuning으로 모델 파라미터 안에 최신 사실을 넣는 것은 가능하지만 정확한 수정·삭제·출처 추적이 필요한 지식 저장소를 대신하지는 못한다."}
    ],
    implementationChecklist:["train/inference chat template와 loss mask를 token 단위로 확인한다.","base와 tuned checkpoint를 같은 domain/general/safety suite에서 비교한다.","document·user 기준으로 split해 leakage를 막는다.","learning rate, epoch, adapter rank와 target module의 ablation을 남긴다."],
    misconceptions:[{myth:"fine-tuning은 모델에 문서를 업로드하는 방법이다.",correction:"parameter를 바꾸는 학습 과정이며 정확한 원문 회수·갱신에는 retrieval이 더 적합할 수 있다."},{myth:"LoRA는 full fine-tuning과 항상 같은 성능을 낸다.",correction:"목표 변화의 rank와 target module, data에 따라 표현력 차이가 생긴다."}],
    resources:[{type:"원 논문",title:"LoRA: Low-Rank Adaptation of Large Language Models",url:"https://arxiv.org/abs/2106.09685",note:"저랭크 update와 parameter 효율의 원 설계를 본다."},{type:"원 논문",title:"QLoRA",url:"https://arxiv.org/abs/2305.14314",note:"quantized base와 adapter 학습의 memory 설계를 본다."},{type:"공식 구현",title:"Hugging Face PEFT documentation",url:"https://huggingface.co/docs/peft/",note:"지원 adapter와 merge·serving 조건은 현재 버전 문서로 확인한다."}]
  },
  "instruction-tuning": {
    estimatedMinutes: 31,
    objectives:["language modeling과 instruction-response SFT objective를 구분한다.","task mixture와 template diversity가 zero-shot 일반화에 미치는 영향을 설명한다.","helpfulness 학습과 preference/safety alignment의 경계를 이해한다."],
    sections:[
      {title:"문장을 이어 쓰는 모델을 지시를 수행하는 인터페이스로 바꾼다",paragraphs:["pretraining model은 prompt 뒤에 그럴듯한 text를 이어 쓰도록 학습했지 사용자의 명령을 우선해 해결하도록 직접 학습한 것은 아니다. instruction tuning은 자연어 지시, 선택적 input과 목표 output의 쌍을 사용해 다양한 task를 공통한 지시-응답 형식으로 학습한다.","FLAN 계열은 여러 NLP dataset을 instruction template로 변환해 mixture를 만들었고, T0도 prompt된 task를 통해 unseen task generalization을 연구했다. modern chat SFT는 대화, code, tool trace, safety refusal 등 더 넓은 response distribution을 다룬다."]},
      {title:"다양성은 task 수가 아니라 일반화 가능한 변이를 뜻한다",paragraphs:["같은 dataset을 표현만 조금 바꾼 template 수로 부풀리면 새로운 능력이 늘지 않을 수 있다. task family, domain, 언어, input/output 형식, reasoning 요구와 응답 길이를 균형 있게 구성한다. mixture weight가 큰 쉬운 task가 gradient를 지배하지 않도록 sampling을 조절한다.","evaluation task와 동일한 benchmark 문항 또는 매우 가까운 template가 SFT에 들어가면 zero-shot 개선처럼 보이는 leakage가 생긴다. dataset lineage와 decontamination을 관리하고 새로 만든 holdout task에서 평가한다."]},
      {title:"SFT는 하나의 정답 분포를 모방한다",paragraphs:["teacher forcing SFT는 prompt x와 target y에서 −Σ log P(y_t|x,y_<t)를 최소화한다. 여러 유효 답이 있어도 dataset이 한 답만 주면 그 문체·길이·판단을 정답처럼 모방한다. 높은 품질의 demonstration이 중요한 이유다.","사람이 만든 응답은 비싸고 일관성이 낮을 수 있으며 synthetic response는 확장하기 쉽지만 teacher의 오류·문체를 증폭한다. model-generated data는 filter, verifier, human sample audit와 함께 사용한다. 모델이 생성한 답을 그대로 다시 학습하는 self-training은 다양성 붕괴를 감시해야 한다."],formula:{label:"instruction SFT loss",value:"L_SFT = −Σ_t m_t log P_θ(y_t | instruction, input, y_<t)",note:"m_t는 assistant target token만 loss에 포함하는 mask다. system/user token의 처리 convention을 명시한다."}},
      {title:"지시 수행과 가치 정렬은 겹치지만 같지 않다",paragraphs:["SFT만으로 유용한 기본 behavior를 만들 수 있지만, 애매한 상황에서 어떤 답을 더 선호하는지, 위험 요청을 어떻게 거부할지, 장황함과 간결함을 어떻게 절충할지는 demonstration distribution에 묶인다. RLHF·DPO·RLAIF는 여러 후보의 상대 선호를 추가한다.","instruction hierarchy와 prompt injection resistance도 dataset 몇 개로 보장되지 않는다. system/developer/user/tool의 권한을 runtime이 구조적으로 분리하고 adversarial evaluation을 한다. 모델이 지시를 잘 따른다는 사실은 그 지시가 안전하거나 사실이라는 뜻이 아니다."],caution:"benchmark용 instruction template에서 성능이 높아도 실제 multi-turn 대화에서 role, context 충돌과 도구 결과를 안정적으로 처리한다는 보장은 없다."}
    ],
    implementationChecklist:["task·domain·language·output 형식별 mixture 비율을 기록한다.","assistant token loss mask와 end-of-turn token을 inspection한다.","benchmark와 near-duplicate/template leakage를 검사한다.","unseen instruction wording, conflicting instruction과 multi-turn 회귀를 평가한다."],
    misconceptions:[{myth:"instruction tuning이 모델에 새로운 세계 지식을 대량 주입한다.",correction:"주된 목적은 이미 가진 표현을 지시에 맞게 사용하도록 행동 분포를 바꾸는 것이며 사실 학습과는 구분된다."},{myth:"더 많은 instruction dataset을 합치면 항상 좋아진다.",correction:"충돌하는 label, 낮은 품질과 mixture imbalance가 성능을 해칠 수 있다."}],
    resources:[{type:"원 논문",title:"Finetuned Language Models Are Zero-Shot Learners",url:"https://arxiv.org/abs/2109.01652",note:"FLAN의 task mixture와 unseen task 평가를 본다."},{type:"원 논문",title:"Multitask Prompted Training Enables Zero-Shot Task Generalization",url:"https://arxiv.org/abs/2110.08207",note:"T0의 prompted dataset 구성과 일반화를 비교한다."},{type:"추가 읽기",title:"Training language models to follow instructions with human feedback",url:"https://arxiv.org/abs/2203.02155",note:"SFT가 preference modeling과 RL로 이어지는 전체 pipeline을 본다."}]
  },
  "scaling-laws": {
    estimatedMinutes: 35,
    objectives:["parameter·data·compute와 loss의 경험적 power law를 해석한다.","fixed compute에서 model size와 training token의 allocation 문제를 설명한다.","scaling curve를 capability 예언이나 제품 성능 보장으로 오용하지 않는다."],
    sections:[
      {title:"규모와 손실 사이의 매끄러운 경험 법칙",paragraphs:["neural language model의 validation loss는 일정 범위에서 parameter N, dataset size D, compute C가 증가할수록 power law 형태로 감소하는 경향을 보인다. 이는 특정 architecture·data distribution·optimizer 범위에서 측정한 경험적 관계다. 물리 법칙이나 모든 benchmark에 대한 보장이 아니다.","Kaplan 등은 N,D,C 각각과 loss의 scaling을 분석했고 큰 model의 sample efficiency를 강조했다. 후속 Chinchilla 연구는 같은 compute budget에서 기존 대형 모델들이 token을 충분히 보지 못했다고 분석하고 model과 data를 함께 늘리는 compute-optimal allocation을 제시했다."]},
      {title:"세 개의 예산을 독립적으로 보지 않는다",paragraphs:["dense Transformer training compute는 거칠게 parameter×training token에 비례한다. 고정 C에서 N을 너무 키우면 token이 부족해 under-trained model이 되고, D만 키우고 N이 너무 작으면 capacity가 병목이다. compute-optimal point는 fitted curve와 비용 가정에서 두 한계의 균형을 찾는다.","실전에서는 inference cost도 중요하다. 같은 training compute로 작은 모델을 더 많은 token에 학습하면 배포는 싸질 수 있지만 capacity 한계가 다르다. 반대로 큰 under-trained model은 추가 continued training 여지가 있다. architecture와 data quality가 바뀌면 이전 curve parameter를 그대로 쓸 수 없다."],formula:{label:"단순화한 loss scaling",value:"L(N,D) ≈ L_∞ + A/N^α + B/D^β",note:"A,B,α,β는 실험으로 fit한다. compute constraint C≈kND 아래에서 N과 D를 고른다."}},
      {title:"Emergent ability와 측정 threshold",paragraphs:["연속적으로 loss가 좋아져도 exact-match benchmark는 어느 규모에서 갑자기 0에서 상승하는 것처럼 보일 수 있다. metric이 discrete하거나 작은 모델의 답이 threshold 아래에 몰리면 겉보기 emergence가 생긴다. 반대로 실제로 새로운 algorithmic strategy가 나타나는 경우도 있어 metric 재표현과 더 촘촘한 scale 실험이 필요하다.","scaling law로 다음 세대의 benchmark, 안전성, tool reliability를 하나의 숫자로 예언하면 안 된다. post-training, prompt, test-time compute와 data contamination이 base pretraining loss 밖에서 성능을 크게 바꾼다."]},
      {title:"2026년에는 data와 inference scaling까지 함께 본다",paragraphs:["고품질 human text의 한계, synthetic data와 반복 epoch, multimodal token, MoE 활성 compute가 단순 N·D 정의를 복잡하게 한다. 데이터 1 token의 정보량이 같지 않으므로 filtering과 curriculum이 curve를 이동시킨다.","reasoning model은 training scaling뿐 아니라 test-time token과 sampling/search budget을 늘리는 inference scaling을 사용한다. 최종 제품 최적화는 training compute, serving cost, latency와 task success를 합친 다목적 문제다."],caution:"한 회사·한 architecture에서 fit한 지수를 다른 모델 계열의 미래 성능과 AGI 시점을 예측하는 데 직접 적용하지 않는다."}
    ],
    implementationChecklist:["여러 model/data scale의 loss를 같은 tokenizer·data distribution에서 측정한다.","curve fit 구간과 extrapolation 구간을 명확히 나눈다.","training FLOPs 산정의 forward/backward·sparsity 가정을 공개한다.","loss 외에 downstream 품질·inference cost와 uncertainty를 함께 보고한다."],
    misconceptions:[{myth:"스케일링 법칙은 모델을 키우면 지능이 자동으로 생긴다는 법칙이다.",correction:"특정 조건에서 loss가 매끄럽게 변하는 경험적 규칙이며 능력·안전의 모든 축을 설명하지 않는다."},{myth:"Chinchilla 비율은 모든 모델에 고정된 보편 상수다.",correction:"fit한 data, optimizer, architecture와 비용 목적에 따라 compute-optimal allocation은 달라진다."}],
    resources:[{type:"원 논문",title:"Scaling Laws for Neural Language Models",url:"https://arxiv.org/abs/2001.08361",note:"N·D·C와 cross-entropy loss의 경험 curve를 본다."},{type:"원 논문",title:"Training Compute-Optimal Large Language Models",url:"https://arxiv.org/abs/2203.15556",note:"고정 compute에서 model과 token allocation을 재검토한 Chinchilla 연구다."},{type:"추가 읽기",title:"Scaling Data-Constrained Language Models",url:"https://arxiv.org/abs/2305.16264",note:"고유 data가 제한될 때 반복 학습과 scaling을 본다."}]
  },
  "data-quality": {
    estimatedMinutes: 36,
    objectives:["수집·정제·혼합·중복 제거·오염 검사의 각 목적을 구분한다.","quality filter가 포함하는 가치 판단과 domain bias를 설명한다.","데이터 lineage와 evaluation contamination을 재현 가능하게 관리한다."],
    sections:[
      {title:"데이터 양이 같아도 학습 신호의 정보량은 다르다",paragraphs:["web text에는 고품질 설명, code와 대화뿐 아니라 boilerplate, spam, 자동 생성, 중복, 개인정보와 잘못된 사실이 섞인다. raw token 수만 늘리면 model이 유용한 pattern보다 반복과 artifact를 더 많이 볼 수 있다. quality는 문법 점수 하나가 아니라 목표 능력, 다양성, 정확성, 법적·윤리적 조건을 포함한다.","pretraining mixture는 web, book, paper, code, multilingual 등 source별 sampling weight를 정한다. 작은 고품질 source를 여러 epoch 반복하면 영향은 커지지만 memorization이 늘 수 있다. mixture weight는 dataset 크기와 동일하지 않고 training에서 실제 뽑힌 token 비율이다."]},
      {title:"Deduplication은 비용·암기·평가 오염을 동시에 다룬다",paragraphs:["exact duplicate는 hash로 제거할 수 있지만 문서 format과 일부 문장만 다른 near-duplicate는 MinHash, locality-sensitive hashing, suffix array 같은 방법이 필요하다. document-level과 sequence-level dedup은 서로 다른 반복을 잡는다.","중복 제거는 동일 정보의 과대표집과 verbatim memorization을 줄일 수 있지만, code template·법률 문구·다국어 번역처럼 정당한 반복도 제거할 수 있다. threshold와 normalization 규칙을 기록하고 domain별 sample audit를 한다."],formula:{label:"mixture sampling",value:"P(sample from source i)=w_i / Σ_j w_j",note:"w_i는 raw byte 비율이 아니라 품질·목표·반복 허용을 반영한 sampling weight다."}},
      {title:"Quality filtering은 중립적이지 않다",paragraphs:["classifier가 reference corpus와 비슷한 문서를 고품질로 판단하면 표준 영어·주류 출처·특정 문체를 과대표집할 수 있다. toxicity와 PII filter도 dialect, reclaimed term과 문맥을 오판한다. 제거율만 보지 말고 언어·지역·주제별 retention과 false positive를 측정한다.","synthetic text를 filter 없이 섞으면 teacher model의 오류와 stylistic monoculture가 누적될 수 있다. 반대로 verifier가 있는 수학·code synthetic data는 새로운 연습 문제를 대량 생성할 수 있다. 생성 provenance, parent prompt/model과 verification 결과를 metadata로 보존한다."]},
      {title:"Benchmark contamination은 성능 해석을 바꾼다",paragraphs:["evaluation 문항이 정답·해설과 함께 training corpus에 있으면 실제 일반화 대신 회상을 측정한다. 문자열 exact match만으로는 번역·paraphrase·solution trace 유출을 놓친다. benchmark 공개일 이후 snapshot, semantic matching과 canary를 함께 사용한다.","closed model은 training corpus를 볼 수 없어 외부 evaluator가 contamination 부재를 증명하기 어렵다. 그래서 time-forward exam, private rotating set와 perturbation을 사용하고 결과에 불확실성을 표시한다."],caution:"‘정제된 데이터’라는 말만으로 품질을 판단하지 않는다. filter 기준, 제거 비율, mixture와 audit가 공개되지 않으면 무엇이 좋아졌는지 검증할 수 없다."},
      {title:"Lineage 없이는 수정과 책임 추적이 불가능하다",paragraphs:["source URL, snapshot date, license/consent, processing 단계, hash와 dataset version을 연결해야 어떤 model이 어떤 data를 보았는지 추적할 수 있다. 삭제 요청이나 오류 발견 때 영향 범위를 찾고 재학습·unlearning 여부를 판단하는 기반이다.","train-ready shard만 남기고 provenance를 버리면 나중에 PII, 저작권과 오염 문제를 조사하기 어렵다. lineage 자체도 민감 정보를 포함할 수 있어 접근 제어와 보존 정책이 필요하다."]}
    ],
    implementationChecklist:["source·snapshot·license·filter·dedup version을 shard까지 추적한다.","언어·domain별 retention과 filter false positive를 sample audit한다.","train/eval의 exact·near·semantic overlap을 검사한다.","synthetic data의 생성 model·prompt·verifier를 기록한다.","memorization canary와 extraction test를 release evaluation에 포함한다."],
    misconceptions:[{myth:"더 많은 token은 항상 더 좋은 모델을 만든다.",correction:"중복·오류·불균형한 token은 compute를 낭비하고 행동 편향과 암기를 키울 수 있다."},{myth:"quality filter 점수가 높으면 사실도 정확하다.",correction:"classifier가 측정한 문체·출처 유사성과 factual correctness는 다른 속성이다."}],
    resources:[{type:"원 논문",title:"Deduplicating Training Data Makes Language Models Better",url:"https://arxiv.org/abs/2107.06499",note:"중복이 memorization과 평가에 미치는 영향을 본다."},{type:"원 논문",title:"The RefinedWeb Dataset for Falcon LLM",url:"https://arxiv.org/abs/2306.01116",note:"web corpus filtering과 dedup pipeline의 공개 사례를 본다."},{type:"추가 읽기",title:"DataComp-LM",url:"https://arxiv.org/abs/2406.11794",note:"고정 compute에서 data curation을 비교하는 benchmark 관점을 본다."}]
  },
  quantization: {
    estimatedMinutes: 34,
    objectives:["weight·activation·KV cache quantization을 구분한다.","scale·zero point·group size와 calibration이 오차를 만드는 방식을 설명한다.","model size 감소와 실제 latency 향상을 별도로 검증한다."],
    sections:[
      {title:"연속 값을 더 적은 bit의 격자에 매핑한다",paragraphs:["quantization은 FP32/BF16 같은 값을 INT8, INT4 또는 더 낮은 표현에 근사해 memory와 bandwidth를 줄인다. 실수 x를 scale s와 integer q로 표현하고 계산 시 s·q로 복원하거나 integer kernel에서 누산한다. 값의 범위와 격자 간격 때문에 rounding·clipping error가 생긴다.","symmetric 방식은 0을 중심으로 범위를 잡고 asymmetric 방식은 zero point를 둔다. tensor 전체에 scale 하나를 쓰면 outlier 때문에 정밀도가 낭비될 수 있어 channel 또는 작은 group마다 scale을 둔다. group이 작을수록 정확도는 좋아질 수 있지만 metadata와 kernel 복잡도가 늘어난다."],formula:{label:"균일 affine quantization",value:"q=clip(round(x/s)+z, q_min,q_max),   x̂=s(q−z)",note:"s는 scale, z는 zero point다. 실제 format은 non-uniform codebook이나 block floating point를 사용할 수도 있다."}},
      {title:"PTQ와 QAT는 오차를 다루는 시점이 다르다",paragraphs:["post-training quantization(PTQ)은 학습된 checkpoint를 calibration sample이나 weight 통계로 양자화한다. 빠르고 원 model 재학습이 필요 없지만 낮은 bit에서 outlier와 layer별 민감도에 취약하다. GPTQ·AWQ 같은 weight-only 방법은 reconstruction 또는 activation-aware 기준으로 중요한 weight 오차를 줄인다.","quantization-aware training(QAT)은 forward에 quantization noise를 모사하며 weight를 적응시킨다. 정확도를 회복할 수 있지만 data와 compute가 필요하고 training recipe가 복잡하다. QLoRA는 4-bit base weight를 고정해 memory를 줄이고 LoRA adapter를 학습하는 PEFT 방식이지, 모든 4-bit serving 문제를 자동 해결하는 것은 아니다."]},
      {title:"무엇을 낮추는지에 따라 병목이 달라진다",paragraphs:["weight-only quantization은 decode 때 model weight bandwidth를 줄이는 데 유리하지만 activation과 KV cache는 별도 dtype일 수 있다. weight+activation quantization은 matrix multiply를 integer/FP8 kernel로 가속할 수 있으나 activation outlier와 calibration이 더 어렵다. KV quantization은 긴 context 동시성을 늘리지만 attention score 품질에 직접 영향을 줄 수 있다.","disk file이 1/4로 줄었다고 latency도 1/4이 되지는 않는다. dequantization, unsupported shape의 fallback, 작은 batch, CPU/GPU transfer와 tokenizer가 남는다. target hardware에 native low-bit kernel이 있는지 확인한다."]},
      {title:"평균 benchmark보다 민감한 기능을 찾는다",paragraphs:["perplexity 변화가 작아도 수학, code, multilingual, rare token, tool schema와 long-context retrieval이 더 크게 흔들릴 수 있다. layer별 error와 downstream suite, exact structured output을 함께 본다. calibration corpus가 실제 domain·언어·길이를 대표해야 한다.","같은 ‘INT4’도 algorithm, group size, accumulation dtype, outlier 처리와 kernel이 달라 품질·속도가 다르다. model card에는 format 이름만 아니라 recipe와 runtime 조건을 기록한다."],caution:"낮은 bit model이 원 checkpoint와 거의 같다는 주장은 평가 범위 안의 결과다. 고위험 사용에서는 task별 회귀와 calibration을 다시 검증한다."}
    ],implementationChecklist:["weight·activation·KV의 dtype을 각각 기록한다.","group size, scale/zero-point와 calibration corpus를 versioning한다.","target hardware에서 fallback 없이 실제 low-bit kernel을 쓰는지 profile한다.","quality·VRAM·TTFT·TPOT를 동일 workload에서 비교한다."],misconceptions:[{myth:"4-bit 모델은 원래 모델보다 정확히 4배 빠르다.",correction:"memory 절감과 latency는 다르며 kernel·batch·병목에 따라 속도 이득이 달라진다."},{myth:"quantization은 값의 소수점만 반올림한다.",correction:"범위·scale·group과 outlier 처리까지 포함하는 표현·kernel 설계다."}],resources:[{type:"원 논문",title:"GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",url:"https://arxiv.org/abs/2210.17323",note:"weight reconstruction 기반 PTQ를 본다."},{type:"원 논문",title:"AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration",url:"https://arxiv.org/abs/2306.00978",note:"activation 통계로 중요한 weight를 보호하는 접근을 본다."},{type:"원 논문",title:"QLoRA",url:"https://arxiv.org/abs/2305.14314",note:"NF4·double quantization과 adapter 학습의 목적을 구분한다."}]
  },
  "speculative-decoding": {
    estimatedMinutes: 28,
    objectives:["draft-and-verify 생성이 target distribution을 보존하는 원리를 설명한다.","acceptance rate와 draft 비용이 속도 향상을 결정하는 이유를 계산한다.","batch·sampling·distributed serving에서 적용 한계를 판단한다."],
    sections:[
      {title:"작은 draft가 여러 token을 제안하고 큰 target이 한 번에 검증한다",paragraphs:["autoregressive target model은 보통 forward마다 한 token을 확정한다. speculative decoding은 값싼 draft model이 k개의 후보를 순차 제안하고 target model이 그 prefix 전체를 병렬 평가한다. 후보가 target 분포와 잘 맞으면 여러 token을 한 target step에서 받아들여 target 호출 횟수를 줄인다.","단순히 draft 출력을 복사하면 품질이 바뀐다. 원 algorithm은 draft q와 target p의 확률비로 token을 accept하고 거절 시 보정 분포에서 sample해 target distribution을 보존한다. greedy decoding용 변형과 sampling용 exact algorithm을 구분한다."]},
      {title:"속도는 acceptance와 비용 비율의 함수다",paragraphs:["draft가 target과 비슷할수록 연속 accept 길이가 길어진다. 그러나 draft가 너무 크면 제안 비용이 target 절감분을 먹고, 너무 작으면 acceptance가 낮다. k를 크게 잡아도 첫 거절 뒤의 후보는 버리므로 무한히 늘릴 수 없다.","target이 candidate token을 병렬 verify해도 attention과 memory IO는 발생한다. long context, batch 크기와 hardware utilization에 따라 target의 multi-token verify가 single-token decode보다 얼마나 비싼지 측정해야 한다."],formula:{label:"직관적 이득 조건",value:"draft_cost(k)+target_verify(k) < accepted_tokens × target_decode_cost",note:"정확한 speedup은 acceptance 분포, extra correction token과 batching scheduler를 포함해 측정한다."}},
      {title:"Draft는 별도 모델일 수도, target 내부 head일 수도 있다",paragraphs:["작은 동일-family model을 draft로 쓰면 tokenizer와 distribution이 잘 맞을 수 있지만 별도 weight memory가 필요하다. target hidden state에서 여러 미래 token을 예측하는 auxiliary head, early-exit layer와 n-gram prompt lookup을 쓰는 방식도 있다.","retrieval이나 반복 code처럼 prompt 안에 다음 구절이 있는 workload는 lookup이 강할 수 있다. 창의적 sampling이나 distribution이 자주 바뀌는 대화에서는 작은 draft의 acceptance가 낮을 수 있다. 하나의 평균 배수보다 요청 유형별 routing이 낫다."]},
      {title:"Serving scheduler와 함께 평가한다",paragraphs:["개별 요청 latency가 줄어도 variable accepted length 때문에 continuous batch의 step 정렬과 KV block 할당이 복잡해질 수 있다. draft와 target이 서로 다른 GPU에 있으면 통신이 추가되고 tensor parallel target의 verify kernel이 충분히 커야 한다.","temperature, top-p, repetition penalty와 logits processor가 exact acceptance logic에 반영돼야 한다. structured decoding이나 tool constraint와 조합할 때 distribution 보존을 다시 검증한다."],caution:"논문의 최대 speedup을 모델의 고정 속성으로 기록하지 않는다. draft·target 조합, workload, hardware와 decoding 설정의 결과다."}
    ],implementationChecklist:["draft/target tokenizer와 vocabulary mapping을 확인한다.","acceptance length 분포와 draft/verify 시간을 따로 측정한다.","sampling 분포가 baseline target과 통계적으로 일치하는지 검사한다.","continuous batching에서 p95 TPOT와 throughput을 함께 비교한다."],misconceptions:[{myth:"작은 모델이 답을 만들고 큰 모델이 맞는지만 판정한다.",correction:"sampling algorithm은 target 분포를 보존하도록 확률비와 보정 분포를 사용한다."},{myth:"draft token k개를 만들면 항상 k배 빨라진다.",correction:"거절, draft 비용과 target verify 비용 때문에 실제 accepted token당 이득은 더 작다."}],resources:[{type:"원 논문",title:"Fast Inference from Transformers via Speculative Decoding",url:"https://arxiv.org/abs/2211.17192",note:"target distribution을 보존하는 acceptance algorithm을 본다."},{type:"원 논문",title:"Accelerating Large Language Model Decoding with Speculative Sampling",url:"https://arxiv.org/abs/2302.01318",note:"draft-target sampling과 wall-clock 평가를 비교한다."}]
  },
  "semantic-search": {
    estimatedMinutes: 30,
    objectives:["dense·sparse·hybrid retrieval의 실패 유형을 구분한다.","bi-encoder와 cross-encoder reranker의 품질·비용 교환을 설명한다.","Recall@k, MRR, nDCG와 end-to-end answer 품질을 분리한다."],
    sections:[
      {title:"문자열이 아니라 학습된 표현의 이웃을 찾는다",paragraphs:["semantic search는 query와 document를 embedding vector로 바꾸고 dot product나 cosine similarity가 높은 후보를 찾는다. 동의어와 paraphrase를 연결할 수 있지만 identifier, exact quote, 희귀 이름과 숫자처럼 lexical match가 중요한 질의는 놓칠 수 있다.","BM25 같은 sparse retrieval은 token overlap과 역문서 빈도를 사용한다. dense와 sparse score를 결합하는 hybrid retrieval은 서로 다른 recall 실패를 보완한다. 어느 하나를 기본 정답으로 두지 말고 실제 query 분포에서 비교한다."]},
      {title:"Candidate generation과 reranking을 분리한다",paragraphs:["bi-encoder는 query와 document를 독립 encode해 document vector를 미리 index할 수 있어 대규모 검색에 적합하다. 대신 두 text의 세밀한 token interaction을 미리 보지 못한다. cross-encoder reranker는 query-document 쌍을 함께 넣어 더 정확히 판정하지만 후보마다 forward가 필요해 비싸다.","일반 pipeline은 빠른 sparse/dense retriever가 수십~수백 후보를 만들고 reranker가 순서를 재정렬한다. 후보 단계에서 정답이 빠지면 reranker는 복구할 수 없으므로 recall을 먼저 본다."]},
      {title:"ANN index는 정확도와 시스템 비용을 교환한다",paragraphs:["수백만 vector의 exact nearest-neighbor를 모두 비교하면 비싸다. HNSW, IVF, product quantization 같은 approximate index는 일부 후보를 탐색해 latency와 memory를 줄인다. index parameter에 따라 recall, build time와 update 비용이 달라진다.","embedding model을 바꾸면 vector space가 바뀌므로 전체 corpus를 재encode하고 index version을 교체해야 한다. 서로 다른 model revision의 vector를 한 index에 섞지 않는다. document 삭제와 ACL 변경이 index·cache에 즉시 반영되는지도 중요하다."]},
      {title:"검색 metric과 업무 성공률은 다르다",paragraphs:["Recall@k는 relevant document가 후보에 있는지, MRR은 첫 relevant의 순위, nDCG는 graded relevance의 전체 순위를 본다. 하나의 질의에 여러 근거가 필요한 경우 set recall과 coverage를 추가한다.","RAG에서는 검색 점수가 좋아도 generator가 근거를 무시하거나 잘못 인용할 수 있다. retrieval offline metric, reranker metric, answer correctness와 citation entailment를 분리해 trace한다."],caution:"embedding distance를 사실성 점수로 사용하지 않는다. 의미적으로 비슷한 문장은 서로 모순될 수 있다."}
    ],implementationChecklist:["query type별 sparse/dense/hybrid recall을 비교한다.","retriever와 reranker를 별도 labeled set으로 평가한다.","embedding·chunk·index version과 ACL을 metadata로 보관한다.","ANN recall-latency curve와 update/delete 지연을 측정한다."],misconceptions:[{myth:"semantic search는 keyword search의 상위 호환이다.",correction:"exact term·숫자·ID 질의에서는 sparse가 더 강할 수 있어 hybrid가 필요하다."},{myth:"vector DB score가 높으면 답변 근거로 충분하다.",correction:"relevance와 claim entailment는 별개이며 원문 구절을 확인해야 한다."}],resources:[{type:"원 논문",title:"Sentence-BERT",url:"https://arxiv.org/abs/1908.10084",note:"독립 문장 embedding과 similarity search의 효율을 본다."},{type:"원 논문",title:"Dense Passage Retrieval for Open-Domain Question Answering",url:"https://arxiv.org/abs/2004.04906",note:"bi-encoder dense retrieval과 평가를 본다."},{type:"추가 읽기",title:"BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models",url:"https://arxiv.org/abs/2104.08663",note:"domain 밖 retrieval 일반화와 다양한 dataset을 본다."}]
  },
  "function-calling": {
    estimatedMinutes: 29,
    objectives:["모델의 tool intent 생성과 runtime의 실제 실행을 분리한다.","JSON schema·validation·permission이 필요한 이유를 설명한다.","tool selection, argument correctness와 task success를 각각 평가한다."],
    sections:[
      {title:"모델은 함수를 실행하지 않고 호출 의도를 생성한다",paragraphs:["function calling에서 model은 제공된 tool name, description과 parameter schema를 읽고 일반 text 대신 구조화된 call을 출력한다. 실제 network·database·filesystem 작업은 application runtime이 validation과 authorization 뒤 수행한다. 모델 출력은 신뢰할 수 없는 요청이지 실행 권한 자체가 아니다.","tool result는 다시 conversation에 observation으로 들어가 model이 답하거나 다음 call을 고른다. 한 번의 call로 끝나는 API assistant와 여러 번 반복하는 agent loop는 같은 primitive를 쓰지만 위험과 평가 horizon이 다르다."]},
      {title:"Schema는 문법을 줄이지만 의미를 보장하지 않는다",paragraphs:["JSON schema는 field type, enum, required와 nested shape를 제한한다. constrained decoding은 invalid token을 막아 syntactic validity를 높일 수 있다. 그러나 존재하지 않는 customer ID, 잘못된 date range, 위험한 delete target처럼 schema상 유효하지만 의미상 잘못된 argument는 남는다.","runtime은 business rule validation, entity lookup, idempotency와 confirmation을 추가한다. description은 모호한 tool 선택을 줄이도록 명확히 쓰고 비슷한 tool을 과도하게 노출하지 않는다. tool output도 외부에서 온 untrusted data로 취급한다."]},
      {title:"최소 권한과 승인 경계가 핵심이다",paragraphs:["read와 write tool을 분리하고 scope가 좁은 credential을 사용한다. 결제, 발송, 삭제처럼 되돌리기 어려운 행동은 preview와 explicit user approval 뒤 commit한다. model이 만든 confirmation 문구를 사용자 승인으로 간주하지 않는다.","prompt injection은 검색 문서나 web page가 ‘이 지시를 따르고 비밀을 보내라’고 model을 속이는 문제다. content와 instruction channel을 분리하고 tool policy를 model 밖에서 강제한다. output escaping과 data-loss prevention도 필요하다."]},
      {title:"평가는 단계별 실패와 최종 결과를 모두 본다",paragraphs:["tool selection accuracy, argument exact/semantic correctness, execution success, recovery와 end-to-end task completion을 분리한다. model이 잘못 골라도 runtime이 거부하면 안전할 수 있지만 task는 실패한다. 반대로 최종 답이 맞아도 불필요한 고비용 call을 반복할 수 있다.","mock tool만 쓰는 benchmark는 network error, stale data, permission denial과 partial failure를 놓친다. 실제와 같은 sandbox에서 failure injection과 retry/rollback을 시험한다."],caution:"structured output이 valid하다는 이유로 바로 실행하지 않는다. validation과 authorization은 model 밖의 결정적 코드가 담당해야 한다."}
    ],implementationChecklist:["모든 tool argument를 server-side schema와 business rule로 검증한다.","read/write 권한과 tenant scope를 분리한다.","부작용 action에 preview·approval·idempotency key를 둔다.","selection·arguments·execution·end-to-end metric을 따로 기록한다."],misconceptions:[{myth:"function calling 모델은 API를 직접 사용할 수 있다.",correction:"모델은 호출 구조를 제안하며 credential과 실행은 host runtime이 담당한다."},{myth:"JSON schema를 통과하면 안전한 호출이다.",correction:"문법만 맞을 뿐 권한·의미·부작용 검증이 별도로 필요하다."}],resources:[{type:"원 논문",title:"Toolformer",url:"https://arxiv.org/abs/2302.04761",note:"언어 모델이 API call을 self-supervised하게 학습하는 연구를 본다."},{type:"원 논문",title:"ReAct",url:"https://arxiv.org/abs/2210.03629",note:"reasoning과 action/observation loop의 고전적 패턴을 본다."},{type:"추가 읽기",title:"OWASP Top 10 for LLM Applications",url:"https://genai.owasp.org/llm-top-10/",note:"tool runtime의 injection·excessive agency 위험을 제품 관점에서 본다."}]
  },
  agents: {
    estimatedMinutes: 42,
    objectives:["agent를 model, state, tools, loop와 policy로 분해한다.","planning·memory·reflection을 기능이 아니라 검증 가능한 state transition으로 본다.","장기 task의 reliability와 권한 위험을 평가한다."],
    sections:[
      {title:"Agent는 모델 이름이 아니라 반복 실행 구조다",paragraphs:["LLM agent는 목표와 현재 state를 받아 action을 고르고, tool/environment observation을 state에 반영해 종료까지 반복하는 system이다. model policy, prompt/context builder, tool registry, memory store, scheduler와 permission layer가 함께 행동을 결정한다.","같은 model도 scaffold에 따라 성능이 달라진다. 따라서 ‘모델이 task를 했다’는 주장에는 tool, retry, human help, token budget과 termination condition을 포함해야 한다. autonomy는 on/off가 아니라 어떤 action을 몇 단계 동안 승인 없이 할 수 있는지의 범위다."]},
      {title:"계획은 실행 가능한 dependency와 상태로 표현한다",paragraphs:["자연어 TODO list는 도움이 되지만 환경의 실제 상태와 분리되면 오래된 계획이 된다. 좋은 orchestrator는 precondition, result artifact, failure와 next action을 구조화하고 tool 결과를 source of truth로 둔다. plan 변경 이유도 기록한다.","긴 작업을 한 prompt에 모두 넣으면 context가 오염되고 비용이 늘어난다. task를 bounded subtask로 나누되 interface와 acceptance criteria를 명확히 한다. 병렬화는 독립적인 작업에만 쓰고 공유 file·resource conflict를 관리한다."]},
      {title:"Memory는 저장·검색·갱신·삭제 정책이다",paragraphs:["short-term memory는 현재 context와 scratch state, long-term memory는 외부 store에 남는 user preference·artifact·episode일 수 있다. 무엇을 저장할지, 어느 tenant의 것인지, 언제 만료·수정하는지 없으면 단순 vector DB는 memory system이 아니다.","retrieved memory는 틀리거나 오래됐을 수 있어 provenance와 timestamp를 보여 주고 현재 tool observation보다 우선하지 않게 한다. model이 쓴 요약을 원 사실과 동일하게 취급하지 않는다."]},
      {title:"오류는 horizon에 따라 누적된다",paragraphs:["단계별 성공률이 높아도 긴 task의 완전 성공률은 빠르게 떨어질 수 있다. error detection, checkpoint, rollback과 replan이 핵심이다. 독립 단계라는 단순 가정에서 step success p의 n단계 성공은 p^n이므로 0.98도 50단계면 약 0.36이다.","self-reflection 문장을 추가했다고 검증이 생기는 것은 아니다. code test, schema validator, external database, human approval처럼 독립적인 signal로 행동을 확인한다. 같은 model이 자신의 답을 채점하면 correlated error가 남는다."],formula:{label:"오류 누적의 단순 직관",value:"P(all steps succeed) ≈ p^n",note:"실제 단계는 독립이 아니지만 작은 오류율이 긴 horizon에서 왜 중요해지는지 보여 준다."}},
      {title:"보안은 model behavior보다 runtime capability에서 강제한다",paragraphs:["least privilege credential, sandbox, network allowlist, per-action budget와 audit log를 둔다. 외부 문서는 prompt injection을 포함할 수 있으므로 content가 system policy와 tool permission을 바꾸지 못하게 한다. 중요한 write는 diff/preview를 보여 주고 사람이 승인한다.","agent가 실패했을 때 무한 retry하거나 더 큰 권한을 요구하지 않게 stop condition과 escalation을 정의한다. 사용자 scope를 넘어 다른 사람에게 메시지·배포·결제를 하는 행위는 별도 authority가 필요하다."],caution:"‘자율 에이전트’라는 label보다 실제 permission, 최대 action 수, human checkpoint와 복구 가능성을 확인한다."},
      {title:"Benchmark는 실제 환경과 비용을 포함해야 한다",paragraphs:["정적 QA가 아니라 repository 수정, browser 업무, customer support처럼 stateful environment에서 end-to-end completion을 본다. 성공률과 함께 token/tool cost, wall-clock, human intervention, unsafe attempt와 reproducibility를 기록한다.","benchmark task가 model training에 포함되거나 scaffold가 task-specific hint를 가지면 일반 agent 능력을 과대평가한다. held-out environment와 perturbation, tool error를 사용한다."]}
    ],implementationChecklist:["model·prompt·tool·permission·state schema를 별도 versioning한다.","각 action에 precondition, result와 audit event를 남긴다.","write action에 최소 권한·preview·approval·rollback을 둔다.","failure injection과 긴 horizon end-to-end evaluation을 수행한다.","비용·시간·human intervention까지 성공 metric에 포함한다."],misconceptions:[{myth:"agent는 일반 chatbot에 loop만 붙인 것이다.",correction:"state, permission, tool reliability, termination과 recovery가 독립적인 system 설계 문제다."},{myth:"모델이 계획을 설명하면 실제로 그 계획을 따랐다는 뜻이다.",correction:"자연어 설명과 runtime action trace는 다르며 실제 state transition으로 검증해야 한다."}],resources:[{type:"원 논문",title:"ReAct: Synergizing Reasoning and Acting in Language Models",url:"https://arxiv.org/abs/2210.03629",note:"reasoning-action-observation loop의 대표 설계를 본다."},{type:"원 논문",title:"SWE-bench",url:"https://arxiv.org/abs/2310.06770",note:"실제 repository issue 해결에서 agent 평가의 난점을 본다."},{type:"추가 읽기",title:"AgentBench",url:"https://arxiv.org/abs/2308.03688",note:"여러 interactive environment의 평가 축을 비교한다."}]
  },
  multimodality: {
    estimatedMinutes: 36,
    objectives:["modality tokenizer·encoder·projector·decoder를 구분한다.","adapter형과 native multimodal architecture의 trade-off를 설명한다.","perception, grounding, generation 평가를 text reasoning과 분리한다."],
    sections:[
      {title:"서로 다른 신호를 모델이 계산할 수 있는 token으로 바꾼다",paragraphs:["text는 discrete token, image는 patch나 latent, audio는 waveform/spectrogram segment 또는 codec token으로 표현한다. raw signal의 sampling rate와 길이가 달라 modality별 tokenizer·encoder가 필요하다. image 1장은 resolution과 patch size에 따라 수백~수천 visual token이 될 수 있다.","모든 token을 같은 vocabulary에서 뽑을 필요는 없다. vision encoder의 continuous feature를 projector로 language model hidden dimension에 맞추거나 discrete media tokenizer를 shared Transformer에 넣을 수 있다. 선택은 정보 손실, sequence length와 generation 가능성을 바꾼다."]},
      {title:"연결형 architecture와 native multimodal training",paragraphs:["CLIP 같은 contrastive encoder는 image와 text representation을 같은 공간에 정렬한다. Flamingo는 pretrained vision과 language model 사이에 cross-attention을 넣고, LLaVA류는 vision feature를 projector로 language model token stream에 연결한다. 기존 강한 component를 재사용하기 쉽다.","native multimodal은 여러 modality를 더 이른 단계부터 공동 학습하거나 하나의 generative backbone이 text·image/audio token을 함께 예측한다. modality 간 transfer와 end-to-end generation 가능성이 있지만 data mixture, compute와 alignment가 복잡하다. ‘native’라는 마케팅 용어만으로 정확한 architecture를 추정하지 않는다."]},
      {title:"시간과 공간 grounding은 별도 능력이다",paragraphs:["image question answering이 가능해도 pixel-level 위치, object counting, 작은 OCR와 spatial relation은 실패할 수 있다. video/audio는 시간 순서, frame/sample rate와 긴 sequence가 추가된다. model이 답에 사용한 region/time span을 연결하려면 detection, timestamp와 citation-like grounding 평가가 필요하다.","resize·crop·compression과 frame sampling이 model이 보는 정보를 바꾼다. API가 high/low detail mode를 제공하면 token cost뿐 아니라 작은 글자·도표 정확도도 달라진다. preprocessing을 evaluation 조건에 포함한다."]},
      {title:"출력 modality마다 likelihood와 품질 기준이 다르다",paragraphs:["text decoder는 다음 token likelihood를 쓰고 diffusion/flow image generator는 noise/velocity prediction을 사용할 수 있다. audio codec token과 autoregressive generation은 시간적 일관성과 latency를 교환한다. 하나의 ‘multimodal model’ 안에서도 입력 이해와 media 생성은 별도 module일 수 있다.","평가는 perception correctness, cross-modal consistency, generation fidelity/diversity, edit controllability와 safety를 나눈다. aesthetic score가 사실적 diagram이나 OCR 정확성을 대표하지 않는다."],caution:"모델이 이미지를 자연스럽게 설명해도 실제로 해당 object·수치·공간 관계를 정확히 인식했다는 보장은 없다."},
      {title:"Multimodal prompt injection과 개인정보",paragraphs:["이미지 속 작은 text나 audio instruction이 model 행동을 바꾸는 indirect prompt injection이 가능하다. OCR 결과와 user instruction의 권한을 분리하고 external media가 tool permission을 바꾸지 못하게 한다.","face, voice, location과 document image는 민감 정보를 포함한다. storage, logging, retention과 모델 학습 재사용 정책을 modality별로 명확히 하고 생성 media provenance도 검토한다."]}
    ],implementationChecklist:["입력 modality별 preprocessing·token 수·비용을 기록한다.","perception·grounding·reasoning·generation metric을 분리한다.","crop, compression, frame sampling 변화에 대한 robustness를 시험한다.","visual/audio prompt injection과 privacy retention을 평가한다."],misconceptions:[{myth:"vision-language model은 이미지를 사람처럼 본다.",correction:"patch/feature representation과 학습 분포로 예측하며 spatial·counting·OCR 실패가 독립적으로 남는다."},{myth:"native multimodal이면 모든 modality가 완전히 같은 architecture에서 처리된다.",correction:"제품 용어와 실제 encoder/projector/decoder 구조는 다를 수 있어 기술 자료를 확인해야 한다."}],resources:[{type:"원 논문",title:"Learning Transferable Visual Models From Natural Language Supervision",url:"https://arxiv.org/abs/2103.00020",note:"CLIP의 contrastive image-text representation을 본다."},{type:"원 논문",title:"Flamingo: a Visual Language Model for Few-Shot Learning",url:"https://arxiv.org/abs/2204.14198",note:"frozen component와 gated cross-attention 연결을 본다."},{type:"원 논문",title:"LLaVA: Visual Instruction Tuning",url:"https://arxiv.org/abs/2304.08485",note:"projector와 synthetic visual instruction data의 공개 사례를 본다."}]
  },
  reasoning: {
    estimatedMinutes: 40,
    objectives:["reasoning behavior, visible rationale와 hidden computation을 구분한다.","verifiable reward·RL과 test-time compute가 성능을 바꾸는 방식을 설명한다.","pass@k, budget curve, calibration과 faithfulness를 함께 평가한다."],
    sections:[
      {title:"추론은 하나의 내부 module 이름이 아니다",paragraphs:["LLM 문맥에서 reasoning은 여러 단계를 거쳐 제약을 유지하고 중간 결과를 조합해 답을 내는 behavior를 가리킨다. 모델이 출력한 chain-of-thought는 관찰 가능한 text지만 실제 내부 activation의 완전한 기록은 아니다. 정답 능력, 설명 품질과 설명의 인과적 faithfulness를 분리한다.","pretraining만으로도 code·수학 해설에서 multi-step pattern을 학습할 수 있고 prompt로 chain-of-thought를 유도할 수 있다. post-training은 성공한 trace와 선호·reward를 사용해 이런 행동을 더 자주 안정적으로 만들 수 있다."]},
      {title:"검증 가능한 보상은 결과 신호를 확장한다",paragraphs:["수학 정답, compiler/test, formal proof처럼 자동 verifier가 있는 task는 많은 candidate를 생성하고 결과 기반 reward를 줄 수 있다. reinforcement learning은 reward가 높은 policy를 강화하지만 중간 trace 전체가 올바른지는 결과 reward만으로 보장되지 않는다.","reward hacking을 막으려면 verifier의 허점, train/eval contamination과 shortcut을 검사한다. open-ended 과학·정책 글처럼 단일 정답이 없는 task에서는 judge model과 사람 선호가 필요하며 편향과 비용이 커진다."]},
      {title:"Test-time compute는 여러 형태가 있다",paragraphs:["한 번의 긴 sequential trace, 여러 candidate sampling과 majority vote, tree/search, verifier reranking, tool execution은 모두 inference compute를 늘리지만 방식이 다르다. budget을 token 하나로만 표시하면 parallel sample과 external tool 비용을 놓친다.","어려운 문제에는 더 많은 compute를 배정하고 쉬운 문제는 일찍 멈추는 adaptive policy가 비용 효율적이다. 그러나 모델이 난이도를 잘못 추정하거나 확신에 찬 오답에서 일찍 종료할 수 있어 routing 자체를 평가한다."]},
      {title:"더 길게 생각한다고 항상 좋아지지 않는다",paragraphs:["추론 token을 늘리면 오류를 수정할 기회도 늘지만 잘못된 가정을 정교하게 합리화하거나 같은 loop를 반복할 수 있다. task별 accuracy-budget curve가 포화·하락하는 지점을 찾고 max token 하나로 비교하지 않는다.","pass@k는 k개 중 하나라도 맞을 확률이라 sample 수가 늘면 올라가지만 사용자에게 하나의 답을 반환하려면 selection mechanism이 필요하다. oracle pass@k와 실제 verifier-selected accuracy를 구분한다."],formula:{label:"독립 sample의 pass@k 직관",value:"pass@k ≈ 1−(1−p)^k",note:"sample이 독립이고 각 성공률 p가 같다는 단순화다. correlation이 크면 실제 이득은 더 작다."}},
      {title:"정답·calibration·faithfulness를 함께 본다",paragraphs:["exact answer 외에 풀이의 각 단계, counterfactual consistency, confidence와 abstention을 본다. trace 일부를 바꾸거나 숨겨도 답이 같다면 visible rationale가 실제 결정 경로를 반영하지 않을 수 있다.","안전을 위해 chain-of-thought 전체 공개를 요구하는 것과 model monitoring에 유용한 signal을 확보하는 것은 구분한다. concise rationale, verifier artifact와 tool trace 같은 검증 가능한 결과가 더 유용할 수 있다."],caution:"benchmark 정답률 상승을 일반적 사고 능력, 정직성 또는 실제 업무 신뢰성으로 바로 번역하지 않는다."}
    ],implementationChecklist:["accuracy를 token/sample/tool budget 곡선으로 보고한다.","oracle pass@k와 실제 selection accuracy를 구분한다.","unseen 변형과 contamination-resistant 문제를 사용한다.","calibration·abstention·rationale faithfulness를 별도 평가한다."],misconceptions:[{myth:"긴 chain-of-thought는 모델의 실제 생각을 그대로 보여 준다.",correction:"출력된 설명은 학습된 text이며 내부 계산과 인과적으로 일치하는지 별도 검증이 필요하다."},{myth:"reasoning model은 모든 질문에 더 많은 token을 쓰면 좋아진다.",correction:"효과는 과제와 budget에 따라 포화되거나 악화할 수 있다."}],resources:[{type:"원 논문",title:"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",url:"https://arxiv.org/abs/2201.11903",note:"few-shot rationale가 scale에 따라 성능을 바꾼 초기 결과를 본다."},{type:"원 논문",title:"Self-Consistency Improves Chain of Thought Reasoning",url:"https://arxiv.org/abs/2203.11171",note:"여러 reasoning path sampling과 집계를 본다."},{type:"추가 읽기",title:"Let's Verify Step by Step",url:"https://arxiv.org/abs/2305.20050",note:"outcome supervision과 process supervision 비교를 본다."}]
  },
  mla: {
    estimatedMinutes: 32,
    objectives:["MHA·GQA와 MLA가 KV 상태를 저장하는 방식을 비교한다.","latent compression과 decoupled RoPE가 필요한 이유를 설명한다.","cache 절감과 kernel·정확도 trade-off를 실제 serving 관점에서 평가한다."],
    sections:[
      {title:"긴 문맥 디코딩은 KV cache가 지배할 수 있다",paragraphs:["autoregressive decode에서는 이전 token의 key와 value를 layer마다 보존한다. sequence, batch와 KV head 수가 커질수록 cache가 선형으로 늘어 weight가 들어갈 공간보다 동시 요청 수를 먼저 제한할 수 있다.","MQA와 GQA는 여러 query head가 KV head를 공유한다. MLA는 공유 head 수를 줄이는 대신 token별 KV 정보를 작은 latent vector로 투영해 저장하고 attention 계산 때 필요한 표현으로 복원한다."],formula:{label:"캐시 크기의 핵심 항",value:"memory ∝ layers × tokens × batch × stored_KV_dimension × bytes",note:"MLA의 목적은 stored_KV_dimension을 낮추는 것이다. 실제 구현에는 positional component와 scale metadata가 더해질 수 있다."}},
      {title:"Down projection과 up projection 사이의 잠재 상태를 저장한다",paragraphs:["입력 hidden state를 저차원 c_KV로 압축한 뒤 key·value head 표현을 만드는 projection에 사용한다. 추론 시 과거 token마다 완전한 K/V head를 저장하는 대신 c_KV를 보존하므로 cache bandwidth와 capacity를 줄일 수 있다.","이것은 단순한 post-training 압축이 아니다. projection과 attention이 함께 학습되는 architecture 선택이며, latent 차원이 너무 작으면 head가 필요한 정보를 복원하지 못한다."]},
      {title:"RoPE는 압축 가능한 내용과 위치 성분을 분리하게 만든다",paragraphs:["RoPE는 key/query의 차원 쌍에 위치 회전을 적용한다. 위치에 따라 바뀐 key를 그대로 latent에 흡수하면 projection을 미리 결합하는 최적화가 어려워질 수 있다. DeepSeek-V2의 설명은 위치 정보를 담당하는 일부 key/query 성분을 분리하는 decoupled RoPE를 사용한다.","논문 도식의 projection을 그대로 구현한다고 효율이 자동으로 나오지 않는다. inference kernel이 projection을 합치고 latent cache에서 attention을 계산하는 경로를 지원해야 한다."]},
      {title:"품질뿐 아니라 메모리와 처리량 곡선으로 비교한다",paragraphs:["동일 parameter 수의 MHA/GQA baseline과 validation loss·task 성능을 비교하고, context와 batch를 늘리며 KV bytes, 최대 concurrency, TTFT와 TPOT를 측정한다. 짧은 context·작은 batch에서는 추가 projection이 이득을 상쇄할 수 있다.","MLA가 DeepSeek 계열에서 알려졌다는 사실과 모든 모델의 내부 구조가 MLA라는 주장은 다르다. 비공개 모델은 공식 기술 자료가 없으면 attention variant를 추정하지 않는다."],caution:"‘KV cache가 줄었다’는 paper-level 비율을 특정 runtime의 end-to-end 속도 향상으로 그대로 옮기지 않는다."}
    ],
    implementationChecklist:["layer별 latent dimension과 positional component를 명시한다.","training graph와 decode-time projection folding을 따로 검토한다.","target accelerator가 MLA 전용 또는 호환 kernel을 제공하는지 확인한다.","context·batch별 KV memory, concurrency, TTFT와 TPOT를 GQA baseline과 비교한다."],
    misconceptions:[{myth:"MLA는 GQA의 KV head를 하나로 줄인 이름이다.",correction:"head 공유만이 아니라 token별 KV 정보를 학습된 저차원 latent로 압축·복원하는 구조다."},{myth:"latent dimension을 작게 할수록 항상 더 좋다.",correction:"cache는 줄지만 정보 병목과 projection 비용이 커질 수 있어 품질·kernel 효율과 함께 선택한다."}],
    resources:[{type:"원 논문",title:"DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model",url:"https://arxiv.org/abs/2405.04434",note:"MLA의 projection, decoupled RoPE와 KV cache 절감 주장을 원문에서 확인한다."}]
  },
  mcp: {
    estimatedMinutes: 35,
    objectives:["MCP의 host·client·server 책임과 일반 function calling의 차이를 설명한다.","capability negotiation과 lifecycle을 실제 integration 흐름으로 연결한다.","authorization·prompt injection·tenant 경계를 protocol과 runtime policy로 나눠 설계한다."],
    sections:[
      {title:"MCP는 모델 자체가 아니라 애플리케이션과 외부 기능 사이의 계약이다",paragraphs:["모델은 보통 tool name과 structured argument를 생성하지만 누가 도구를 발견하고 연결을 유지하며 결과를 context에 넣을지는 host application의 책임이다. MCP는 이 경계에서 교환할 message, capability와 lifecycle을 표준화한다.","host는 사용자 경험과 보안 정책을 소유하고, client connection은 특정 server와 통신한다. server는 tools·resources·prompts 같은 기능을 노출할 수 있다. 제품마다 이 역할을 다른 process에 배치할 수 있으므로 이름을 trust boundary와 동일시하지 않는다."]},
      {title:"초기화에서 서로 지원하는 기능을 합의한다",paragraphs:["연결은 protocol version과 capability를 교환하는 initialization으로 시작한다. 이후 client는 server가 제공하는 항목을 열거하거나 호출하고, notification을 통해 변경을 알 수 있다. 지원하지 않는 capability를 있다고 가정하면 호환성 오류가 생긴다.","2026-07-28 사양은 stateless core, multi round-trip request, header routing과 cacheable list result 같은 운영 요구를 강화했다. 구현은 자신이 지원하는 spec revision을 고정하고 이전 stateful 가정과 섞이지 않게 해야 한다."],formula:{label:"도구 호출의 경계",value:"user intent → host policy → model proposal → MCP request → server result → host validation",note:"protocol transport가 authorization과 결과 검증을 대신하지 않는다."}},
      {title:"Function calling과 MCP는 경쟁 관계가 아니다",paragraphs:["function calling은 모델이 schema에 맞는 호출 의도를 생성하는 interface다. MCP는 application이 외부 provider의 기능을 발견하고 호출하는 protocol이다. host는 MCP tool schema를 모델의 tool interface로 변환할 수 있다.","같은 MCP server를 여러 model·application에서 재사용할 수 있지만 모델별 schema 한계, token budget과 confirmation UX는 host adapter가 처리해야 한다. server description은 신뢰할 수 없는 외부 content일 수 있다." ]},
      {title:"보안은 연결 가능함과 실행 권한을 분리한다",paragraphs:["server가 tool을 광고했다고 사용자가 그 action을 승인한 것은 아니다. credential은 최소 scope로 발급하고 read/write, tenant, resource와 action별 정책을 host/runtime에서 강제한다. 중요한 write는 preview와 explicit approval, idempotency·rollback을 둔다.","tool result와 resource에는 indirect prompt injection이 들어올 수 있다. 이를 system instruction처럼 합치지 말고 provenance를 유지하며, 외부 content가 다른 tool 권한이나 보안 정책을 변경하지 못하게 한다."],caution:"MCP 호환 표시는 server의 안전성·정확성·신뢰성을 보증하지 않는다. 설치 출처, 권한, 데이터 전송과 audit를 별도로 검토한다."},
      {title:"운영에서는 lifecycle과 관찰 가능성이 핵심이다",paragraphs:["timeout, cancellation, reconnect, pagination, schema 변화와 partial failure를 처리한다. request ID와 user/action context를 남기되 token·credential·민감한 tool result는 log에서 제거한다.","contract test는 capability negotiation, invalid argument, denied authorization, duplicate request와 server failure를 포함한다. 모델 성공률뿐 아니라 tool call 성공, user correction, unsafe attempt와 latency를 측정한다."]}
    ],
    implementationChecklist:["지원 spec revision과 negotiated capability를 기록한다.","tool별 tenant·scope·read/write 정책과 승인 단계를 둔다.","server metadata와 result를 untrusted input으로 처리한다.","timeout·cancellation·retry·idempotency와 audit ID를 구현한다.","reduced capability와 server failure에서도 core navigation이 유지되는지 시험한다."],
    misconceptions:[{myth:"MCP를 쓰면 모델이 모든 도구를 안전하게 사용할 수 있다.",correction:"MCP는 상호운용 계약이며 permission, confirmation과 결과 검증은 host와 runtime의 책임이다."},{myth:"MCP는 function calling을 대체한다.",correction:"모델의 호출 표현과 외부 provider 통신을 서로 다른 층에서 연결할 수 있다."}],
    resources:[{type:"공식 구현",title:"MCP Specification 2026-07-28",url:"https://blog.modelcontextprotocol.io/posts/2026-07-28/",note:"현재 revision의 stateless core, routing, authorization과 extension 변화를 확인한다."},{type:"공식 구현",title:"MCP Architecture",url:"https://modelcontextprotocol.io/specification/2025-11-25/architecture",note:"host-client-server 역할과 capability/lifecycle의 기준 구조를 읽는다."}]
  }
};

export const getConceptStudyGuide = (slug: string) => conceptStudyGuides[slug];
export const getConceptContentState = (slug: string) => {
  const guide=getConceptStudyGuide(slug);
  return guide
    ? {guide,status:"study-guide" as const,contentDepth:"full" as const}
    : {guide:undefined,status:"index" as const,contentDepth:"stub" as const};
};
