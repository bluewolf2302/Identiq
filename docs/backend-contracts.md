# Identiq backend contracts

The shared contracts in [`lib/contracts`](../lib/contracts) are the common
boundary between analysis providers, deterministic compliance rules, Supabase
persistence, the Review Studio frontend, and integration tests.

## Validation rules

Every schema is a strict Zod object. Unknown object properties are rejected.
String identifiers and required text fields must be non-empty. Optional values
may be omitted, but an explicitly supplied optional string must be non-empty.

- `confidence` is a number from `0` through `1`.
- Finding `category`, `severity`, and `status` use the enums in
  `lib/contracts/findings.ts`.
- `SubmissionStatus` is intentionally separate from `FindingStatus`.
- `analysisTimestamp` and correction `updatedAt` must be ISO datetime strings
  with an explicit UTC offset.
- Finding offsets, line numbers, columns, and page numbers are positive or
  non-negative as appropriate.
- `endOffset` cannot be before `startOffset`.

Use the schemas at all untrusted boundaries, including AI provider output,
incoming API requests, and data loaded before display or persistence:

```ts
const request = AnalysisRequestSchema.parse(input);
const response = AnalysisResponseSchema.parse(providerOutput);
```

Use `safeParse` when the caller must return a structured validation response
instead of throwing:

```ts
const result = ReviewFindingSchema.safeParse(value);
if (!result.success) {
  // Return or record result.error; do not display the unvalidated finding.
}
```

## Core contract shapes

### `AnalysisRequest`

Requires `submissionId`, `brandId`, and `campaignName`. It may include text
content, uploaded file references, a content platform, and a resolved
`BrandContext`.

### `BrandContext`

Carries the brand profile, approved guidelines, product facts, promotional
claims, terminology rules, approved colours, visual asset references, source
IDs, and version information needed to explain a finding.

### `ReviewFinding`

Every analyzer emits the same finding shape. Findings identify the compliance
category, severity, status, issue, explanation, provider, evidence, and
optional correction/location/confidence data.

### `AnalysisResponse`

Wraps findings with submission/run identifiers, completion status, provider
information, fallback usage, and an offset-aware timestamp.

### Workflow contracts

- `CorrectionRequest` records a requested finding correction.
- `CorrectionResponse` returns the stored correction and the resulting finding.
- `ReviewDecisionRequest` records an approve/request-changes/reject decision.
- `SubmissionStatus` models submission lifecycle independently from finding
  status.

## Integration guidance

- Aditi's Brand Knowledge Hub should map its records into `BrandContext` and
  preserve `sourceIds`, `versionId`, and `sourceVersionInformation`.
- Soham's deterministic rules and Harsh Joshi's visual analyzer should emit
  `ReviewFinding` objects and use their provider name in `analysisProvider`.
- The backend orchestration layer should validate provider output with
  `ReviewFindingSchema` or `AnalysisResponseSchema` before storage.
- Harsh Kumar's Review Studio should consume `AnalysisResponse` and keep
  submission status separate from finding status.
- Bhumi's tests can use the schemas directly to exercise valid and invalid
  payloads without depending on a provider or database.
