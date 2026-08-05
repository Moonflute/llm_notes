# Content repository

Each entity type has its own JSON index. The application loader validates each entry with Zod and verifies source references at build time.

- `sources/`: primary and supporting sources
- `events/`: timeline entries
- `organizations/`: organization metadata
- `model-families/`: family and release relationships
- `concepts/`: concept cards and learning relationships

Use `npm run validate-content` before committing any content edit.