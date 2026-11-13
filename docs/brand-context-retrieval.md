# Brand Context Retrieval Service

The service in [`lib/brand-context`](../lib/brand-context) converts approved
brand knowledge into the Phase 1 `BrandContext` contract. It does not call
Supabase directly and does not access browser storage.

## Architecture

- [`repository.ts`](../lib/brand-context/repository.ts) defines the
  database-neutral `BrandKnowledgeRepository` interface and a typed repository
  failure.
- [`types.ts`](../lib/brand-context/types.ts) defines the validated repository
  record shape, source metadata, applicability filters, and retrieval warnings.
- [`brand-context-service.ts`](../lib/brand-context/brand-context-service.ts)
  validates the brand ID, retrieves one brand, filters approved/applicable
  records, maps source/version information, validates the final
  `BrandContext`, and distinguishes empty sections from failures.
- [`mock-brand-repository.ts`](../lib/brand-context/mock-brand-repository.ts)
  provides clearly labelled local sample data for tests only.

Call `BrandContextService.getForSubmission({ brandId, submissionId,
contentPlatform })`. It returns `{ context, warnings }`. Empty approved
sections are valid and reported through warnings; they are not treated as
database failures.

## Supabase handoff

No Supabase client, migrations, or Aditi-owned schema are present on the
current branch, so no database adapter was implemented. Aditi's adapter should
implement `BrandKnowledgeRepository` and return a `BrandKnowledgeRecord`:

1. Use the existing Supabase server client and actual table/column names.
2. Scope every query by the requested `brandId` and organisation ownership.
3. Filter to approved records in the database and preserve applicability.
4. Populate every `source` field, including document ID, title, and version.
5. Throw `BrandKnowledgeRepositoryError` for connection/query failures.
6. Return `null` only when the requested brand does not exist.

The service will reject incomplete records through
`BrandKnowledgeRecordSchema`; it will never invent missing source or version
information.
