import assert from "node:assert/strict";
import test from "node:test";

import {
  BrandContextSchema,
  ReviewFindingSchema,
  type BrandContext,
} from "../lib/contracts";
import {
  DeterministicTextGovernanceEngine,
  InvalidDeterministicAnalysisInputError,
} from "../lib/governance";

const source = "[Source: Approved handbook (handbook-v1; v1; section Terminology)]";

function context(overrides: Partial<BrandContext> = {}): BrandContext {
  return BrandContextSchema.parse({
    brandProfile: "Sample Organisation",
    approvedGuidelines: [],
    approvedProductFacts: [
      `PRODUCT_PRICE: $99 ${source}`,
      `APPROVED_DATE: 2026-01-15 ${source}`,
    ],
    approvedPromotionalClaims: [],
    preferredTerminology: [`REQUIRED_TERMINOLOGY: customer ${source}`],
    prohibitedTerminology: [`guaranteed ${source}`, `scam ${source}`],
    approvedColours: [],
    approvedVisualAssetReferences: [],
    sourceIds: ["handbook-v1"],
    versionId: "v1",
    sourceVersionInformation: "Approved handbook (handbook-v1; v1; section Terminology)",
    ...overrides,
  });
}

const engine = new DeterministicTextGovernanceEngine();

test("clean content returns no findings", () => {
  assert.deepEqual(
    engine.analyze({ content: "Our customer can review the $99 product.", brandContext: context() }).findings,
    [],
  );
});

test("detects explicit prohibited terminology case-insensitively without partial matches", () => {
  const result = engine.analyze({
    content: "This product is GUARANTEED. The word scamper is allowed.",
    brandContext: context({ preferredTerminology: [] }),
  });
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0]?.detectedValue, undefined);
  assert.equal(result.findings[0]?.location?.startOffset, 16);
  assert.equal(result.findings[0]?.location?.endOffset, 26);
});

test("checks explicitly required terminology", () => {
  const result = engine.analyze({
    content: "Our product is available today.",
    brandContext: context(),
  });
  assert.equal(result.findings.length, 1);
  assert.match(result.findings[0]!.issue, /customer/);
});

test("detects exact approved price conflicts", () => {
  const result = engine.analyze({
    content: "Buy now for $109.",
    brandContext: context({
      preferredTerminology: [],
      approvedProductFacts: [`PRODUCT_PRICE: $99 ${source}`],
    }),
  });
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0]?.expectedValue, "$99");
  assert.equal(result.findings[0]?.detectedValue, "$109");
});

test("matching approved facts produce no violation", () => {
  const result = engine.analyze({
    content: "Our customer can buy this for $99 on 2026-01-15.",
    brandContext: context(),
  });
  assert.deepEqual(result.findings, []);
});

test("preserves source/version evidence and validates every finding", () => {
  const result = engine.analyze({
    content: "This is guaranteed for $109.",
    brandContext: context(),
  });
  assert.ok(result.findings.length >= 2);
  for (const finding of result.findings) {
    assert.equal(ReviewFindingSchema.safeParse(finding).success, true);
    assert.equal(finding.evidenceReferences[0]?.sourceId, "handbook-v1");
    assert.equal(finding.evidenceReferences[0]?.versionId, "v1");
  }
});

test("handles empty context collections safely", () => {
  const result = engine.analyze({
    content: "Any content.",
    brandContext: context({
      approvedProductFacts: [],
      preferredTerminology: [],
      prohibitedTerminology: [],
    }),
  });
  assert.deepEqual(result.findings, []);
});

test("ignores malformed or unsupported rule data", () => {
  const result = engine.analyze({
    content: "The value is 100 and this is not semantic analysis.",
    brandContext: context({
      approvedProductFacts: ["A free-form price claim without a structured kind"],
      preferredTerminology: ["Use clear language"],
      prohibitedTerminology: ["not-a-whole-word"],
    }),
  });
  assert.deepEqual(result.findings, []);
});

test("rejects invalid analysis input", () => {
  assert.throws(
    () =>
      engine.analyze({
        content: "text",
        brandContext: { ...context(), versionId: "" },
      }),
    InvalidDeterministicAnalysisInputError,
  );
});
