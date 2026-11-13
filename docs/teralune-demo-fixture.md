# Teralune demo fixture

The Teralune fixture is fictional local demo data for Identiq governance
testing. It is not live company information, not a Supabase record and not
evidence of real-world certification, registration or product performance.

## Authoritative provenance

The approved source is:

[`brand-identity-guidelines.pdf`](../sample-data/teralune/brand-identity-guidelines.pdf)

The companion advertisement is deliberately flawed test input only:

[`test-advertisement.pdf`](../sample-data/teralune/test-advertisement.pdf)

Advertisement claims are never loaded into the approved repository fixture.

## Fixture identity

- Brand ID: `demo-brand-teralune`
- Brand name: `Teralune`
- Legal entity: `Teralune Beverages Private Limited` (fictional)
- Primary product: `Teralune Still Spring Water`
- Tagline: `Refreshment, Naturally.`
- Guide version: `1.0`
- Demo organization: `demo-organisation-teralune`

## Source register

The fixture preserves the source IDs from the guide:

- `SRC-BRAND-01` — brand identity, voice and communication rules
- `SRC-PROD-01` — product name, SKU, pack size, MRP and packaging facts
- `SRC-CLAIM-01` — approved claims CLM-01 through CLM-04 and claim policy
- `SRC-ASSET-01` — approved logo, palette and product appearance guidance

Page references are retained in source metadata where the guide provides them.
The guide’s version is represented as `1.0`.

## Supported deterministic checks

The fixture supplies exact records for deterministic checks including:

- `Teralune®` versus the authorized `Teralune™` rule
- `500ml` versus the required `500 mL` spelling
- ₹25 per 500 mL bottle
- Product identity and SKU context
- Required terminology and approved claims context

The AI semantic layer receives the broader policy context for:

- Unsupported health, purity, clinical and environmental claims
- Unauthorized discounts and sale pricing
- Grammar and subject-verb agreement
- Aggressive urgency and manipulative language

Unsupported claims are classified as `UNVERIFIED` unless an authoritative
approved record establishes a contradiction. Visual rules remain separate from
the deterministic text engine and require visual analysis or human review.

## Registration boundary

`MockBrandKnowledgeRepository` registers the generic `brand-001` fixture and
the isolated Teralune fixture in a brand-keyed map. Adding another demo brand
requires registering another `BrandKnowledgeRecord`; the governance engine and
retrieval service do not need brand-specific branches.
