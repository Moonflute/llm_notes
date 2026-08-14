export default function Changelog(){
  return <main id="main-content" className="detail">
    <p className="sectionLabel">CHANGELOG</p><h1>변경 로그</h1>
    <section><h2>2026-08-14 · v0.9.1 상호작용·콘텐츠 상태 보정</h2><p>Home의 개별 노드 드래그를 제거하고 빈 캔버스 pan, wheel zoom과 동일 캔버스 camera focus로 통일했습니다. 모델·계보·학습 경로는 drag·wheel·화살표가 하나의 active index를 공유하며, 문서 이전·다음 이동에는 방향성 View Transition을 적용했습니다.</p><p>타임라인 기본값을 전체 사건으로 고치고 표시 개수를 데이터에서 계산합니다. 핵심 가이드 상태를 단일 함수에서 산출하며 Quantization·Reasoning을 포함한 완성 문서는 더 이상 편집 중 색인으로 표시하지 않습니다. MLA와 MCP 가이드를 추가하고 World Models·Interpretability의 분야 직접 출처를 자동 검사합니다.</p></section>
    <section><h2>2026-08-14 · v0.9.0 기존 제품 대규모 리팩터링</h2><p>타임라인 중복 제거와 canonical ID, claim 단위 출처 상태, 통합 문서 metadata를 도입했습니다. Home에는 pan·wheel zoom·관성·복귀를, 모델·계보·학습 경로·개념 색인에는 공통 kinetic rail과 방향성 전환을 적용했습니다. 상세 문서는 차분한 장문 독서, 진행률과 이전/다음 탐색을 유지합니다.</p><p>핵심 기술 가이드를 25개로 확장하고 위치 인코딩/RoPE, 정규화, FFN/SwiGLU, attention 변형, state-space model을 새 개념으로 추가했습니다. Issues 12개와 Frontiers 8개를 구조화된 장문 brief로 교체하고 잘못 연결된 범용 출처를 분야 직접 출처로 바꿨습니다. 모델 상세의 반복 문장 248개를 제거하고 주요 8개 family에 세대 변화·공개 범위·단절 해설을 추가했습니다.</p></section>
    <section><h2>2026-08-10 · v0.8.1 궤도선 정리</h2><p>실선과 점선으로 중복되던 에코 궤도와 방사형 연결선을 제거했습니다. 모든 행성 궤도는 한 줄의 얇은 실선으로 통일하고, 모델 계보도 중복선과 수직 꺾임 대신 하나의 부드러운 시간 경로로 정리했습니다.</p></section>
    <section><h2>2026-08-10 · v0.8.0 궤도형 지식 은하</h2><p>전체 지도를 중앙 LLM과 세 겹의 기울어진 궤도, 여섯 범주 행성으로 다시 설계했습니다. 범주를 확대하면 하위 항목이 위성계처럼 전개되고, 순서가 중요한 모델 릴리스와 역사만 시간 경로로 표시합니다.</p></section>
    <section><h2>2026-08-10 · v0.7.x 전체 지도와 모바일 정비</h2><p>데스크톱·모바일 지도의 노드 충돌과 관계선, 개념 학습 레이아웃을 정비하고 화면 크기별 별도 배치를 적용했습니다.</p></section>
    <section><h2>2026-08-09 · v0.2–0.6 편집 디자인과 지식 지도</h2><p>타이포그래피, 통합 navigation, 모바일 메뉴, 모델 장문 문서와 종이·먹선 기반 공간형 지식 지도를 단계적으로 도입했습니다.</p></section>
    <section><h2>2026-08-05 · 초기 공개 기반</h2><p>정적 사이트, 콘텐츠 검증, 타임라인·엔티티·검색 라우트, sitemap과 품질 검사를 추가했습니다.</p></section>
  </main>;
}
