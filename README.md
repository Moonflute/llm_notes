# LLM History

A Korean-first, static knowledge application for exploring the history, concepts, and debates around LLMs and generative AI.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

## Quality checks

```powershell
npm.cmd run lint
npm.cmd run validate-content
npm.cmd run build
```

`npm.cmd run build` exports a server-free website to `out/`. Open `out/index.html` to view it locally.

## Content rules

- Use stable lowercase kebab-case IDs and slugs.
- Every public event and concept must cite at least one source.
- Dates, source IDs and relationships are validated during the build.
- Mark unknown specifications as undisclosed; do not infer values.
- Separate verified facts from organization claims and forecasts in page copy.
## 품질 검증
`npm run content-qa`, `npm run test`, `npm run lint`, `npm run build`, `npm run check-links`, `npm run check-static-quality`, `npm run test:e2e`를 실행합니다. 자세한 기준은 [docs/quality.md](docs/quality.md)를 참고하세요.
