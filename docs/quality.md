# 품질 검증

정적 배포 전 다음 명령을 순서대로 실행합니다.

```powershell
npm run content-qa
npm run test
npm run lint
npm run build
npm run check-links
npm run check-static-quality
npm run test:e2e
```

- `content-qa`: 중복 ID·slug, 출처 누락, 검증일 누락·만료를 검사합니다.
- `test`: 날짜 정밀도, 검색 정규화, 출처·개념 관계 검증을 확인합니다.
- `check-links`: `out/`의 내부 링크가 실제 정적 파일을 가리키는지 검사합니다.
- `check-static-quality`: 한국어 문서 언어, skip link, 메인 랜드마크, 이미지 대체 텍스트, gzip HTML 예산을 검사합니다.
- `test:e2e`: Chromium에서 타임라인 공유 URL, 관계 탐색, 모델 릴리스 출처, 이슈 근거, 키보드 skip link, 모바일 레이아웃, JavaScript 비활성 상태를 검사합니다.

Next.js의 스트리밍 정적 출력은 로딩 fallback과 숨김 완료 콘텐츠를 동시에 포함할 수 있습니다. 이 경우 완료 콘텐츠는 `hidden` 컨테이너 안에 있으므로, 검사기는 노출되는 랜드마크만 하나인지 판정합니다.

Playwright를 처음 실행하는 환경에서는 `npx playwright install chromium`을 한 번 실행합니다.

브라우저 수동 점검에서는 360px 폭의 내비게이션, 타임라인 URL 필터 재현, 검색 URL, 키보드 Tab 포커스, 학습 경로 완료 상태 저장을 확인합니다.