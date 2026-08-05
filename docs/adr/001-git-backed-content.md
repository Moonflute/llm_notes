# ADR-001: Git-backed validated content

- Status: Accepted
- Date: 2026-08-05

The first release keeps structured content in TypeScript modules committed to Git. Zod validates source metadata, events, concepts, organizations, model families, and internal references during the static build. This keeps the authoring workflow transparent and avoids a CMS until non-developer editorial demand is proven.