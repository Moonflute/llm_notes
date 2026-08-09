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
  }
};

export const getConceptStudyGuide = (slug: string) => conceptStudyGuides[slug];
