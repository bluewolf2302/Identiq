# Deterministic Text Governance Engine

The implementation in [`lib/governance`](../lib/governance) evaluates text
against the validated Phase 2 `BrandContext`. It is independent of the brand
repository and any AI provider.

## Architecture

- [`text-matching.ts`](../lib/governance/text-matching.ts) contains
  case-insensitive whole-word matching, exact normalization, structured-value
  extraction, and source-reference parsing.
- [`deterministic-text-engine.ts`](../lib/governance/deterministic-text-engine.ts)
  validates input, runs supported checks, creates evidence-backed findings, and
  validates every generated finding with `ReviewFindingSchema`.
- [`types.ts`](../lib/governance/types.ts) contains the analysis input/result
  types.

Call:

```ts
const result = engine.analyze({
  content: submittedText,
  brandContext,
});
```

The result is `{ findings: ReviewFinding[] }`. The original context is never
mutated.

## Implemented checks

### Prohibited terminology

Every non-empty entry in `prohibitedTerminology` is treated as an explicitly
prohibited phrase. Matching is case-insensitive and uses Unicode-aware
whole-word boundaries, preventing `scam` from matching `scamper`.

### Required terminology

Only entries explicitly prefixed with `REQUIRED:` or
`REQUIRED_TERMINOLOGY:` are treated as required. Ordinary preferred terminology
is not treated as mandatory.

### Exact structured facts

Only `PRODUCT_PRICE:` and `APPROVED_DATE:` entries in
`approvedProductFacts` are compared. A conflict is reported only when the text
contains a different comparable numeric, currency, or ISO-date token. Free-form
fact prose is ignored.

### Explicit prohibited claims

Only approved-claim entries explicitly prefixed with `PROHIBITED:` or
`PROHIBITED_PHRASE:` are checked as prohibited exact phrases. Approved wording
itself does not create a finding.

## Findings and evidence

Findings use the existing `ReviewFinding` contract. They include category,
severity, status, explanation, optional correction, reliable character
locations, and evidence references parsed from the Phase 2 source marker.
Fallback source IDs and versions come only from the supplied `BrandContext`.

## Limitations

The current Phase 1 `BrandContext` stores structured repository records as
strings. Consequently, the engine only interprets explicit prefixes and source
markers produced by Phase 2. It does not infer rules from arbitrary prose,
understand semantic claims, assess tone, verify product specifications,
validate visuals, or determine whether a claim is factually true.

Those capabilities require later structured contracts, richer source metadata,
or AI/visual analysis. No AI or provider SDK is used in this phase.
