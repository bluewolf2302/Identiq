import assert from "node:assert/strict";
import test from "node:test";

import {
  BrandContextService,
  BrandNotFoundError,
  InvalidBrandIdError,
  InvalidBrandKnowledgeError,
} from "../lib/brand-context/brand-context-service";
import {
  MockBrandKnowledgeRepository,
  sampleKnowledge,
} from "../lib/brand-context/mock-brand-repository";
import {
  BrandKnowledgeRepositoryError,
  type BrandKnowledgeRepository,
} from "../lib/brand-context/repository";
import type { BrandKnowledgeRecord } from "../lib/brand-context/types";

test("retrieves a complete validated brand context", async () => {
  const result = await new BrandContextService(
    new MockBrandKnowledgeRepository(),
  ).getForSubmission({
    brandId: "brand-001",
    submissionId: "submission-001",
  });

  assert.equal(result.context.sourceIds[0], "mock-brand-guidelines-v1");
  assert.equal(result.context.versionId, "mock-v1");
  assert.match(result.context.brandProfile, /Sample Organisation/);
  assert.equal(result.warnings.length, 0);
});

test("returns an explicit warning when no approved facts exist", async () => {
  const noFacts: BrandKnowledgeRecord = {
    ...sampleKnowledge,
    productFacts: [],
  };
  const result = await new BrandContextService(
    new MockBrandKnowledgeRepository(new Map([["brand-no-facts", noFacts]])),
  ).getForSubmission({ brandId: "brand-no-facts" });

  assert.deepEqual(result.context.approvedProductFacts, []);
  assert.ok(result.warnings.includes("NO_APPROVED_PRODUCT_FACTS"));
});

test("returns only approved and applicable records", async () => {
  const knowledge: BrandKnowledgeRecord = {
    ...sampleKnowledge,
    productFacts: [
      ...sampleKnowledge.productFacts,
      {
        approved: true,
        kind: "PRODUCT_PRICE",
        value: "Only for web",
        applicableTo: { contentPlatforms: ["web"] },
        source: sampleKnowledge.productFacts[0].source,
      },
    ],
  };
  const result = await new BrandContextService(
    new MockBrandKnowledgeRepository(new Map([["brand-filtered", knowledge]])),
  ).getForSubmission({
    brandId: "brand-filtered",
    contentPlatform: "social",
  });

  assert.equal(result.context.approvedProductFacts.length, 1);
  assert.ok(!result.context.approvedProductFacts.some((fact) => fact.includes("Only for web")));
});

test("maps source references and fact versions", async () => {
  const result = await new BrandContextService(
    new MockBrandKnowledgeRepository(),
  ).getForSubmission({ brandId: "brand-001" });

  assert.ok(result.context.approvedProductFacts[0].includes("mock-brand-guidelines-v1"));
  assert.ok(result.context.approvedProductFacts[0].includes("mock-v1"));
  assert.ok(result.context.sourceVersionInformation.includes("Sample organisation approved brand handbook"));
});

test("rejects invalid IDs and missing brands", async () => {
  const service = new BrandContextService(new MockBrandKnowledgeRepository());
  await assert.rejects(
    service.getForSubmission({ brandId: "   " }),
    InvalidBrandIdError,
  );
  await assert.rejects(
    service.getForSubmission({ brandId: "missing-brand" }),
    BrandNotFoundError,
  );
});

test("rejects invalid retrieved information and preserves repository failures", async () => {
  const invalidRepository: BrandKnowledgeRepository = {
    async getBrandKnowledge() {
      return { ...sampleKnowledge, profile: { ...sampleKnowledge.profile, source: undefined } } as unknown as BrandKnowledgeRecord;
    },
  };
  await assert.rejects(
    new BrandContextService(invalidRepository).getForSubmission({
      brandId: "invalid",
    }),
    InvalidBrandKnowledgeError,
  );

  const failure = new BrandKnowledgeRepositoryError("database unavailable");
  const failingRepository: BrandKnowledgeRepository = {
    async getBrandKnowledge() {
      throw failure;
    },
  };
  await assert.rejects(
    new BrandContextService(failingRepository).getForSubmission({
      brandId: "brand-001",
    }),
    failure,
  );
});
