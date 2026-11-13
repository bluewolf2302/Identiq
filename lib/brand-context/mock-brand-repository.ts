import type {
  BrandContextQuery,
  BrandKnowledgeRecord,
} from "./types";
import type { BrandKnowledgeRepository } from "./repository";
import { teraluneKnowledge } from "./teralune-brand-fixture";

const SAMPLE_SOURCE = {
  sourceDocumentId: "mock-brand-guidelines-v1",
  sourceTitle: "Sample organisation approved brand handbook",
  versionId: "mock-v1",
  section: "Approved brand knowledge",
} as const;

const sampleProfile: BrandKnowledgeRecord["profile"] = {
  approved: true,
  brandId: "brand-001",
  organisationId: "organisation-sample",
  brandName: "Sample Organisation",
  profile: "Clearly labelled sample brand profile for local contract testing.",
  voiceAndTone: "Clear, helpful and evidence-led.",
  communicationInstructions: ["Use direct language."],
  designGuidelines: ["Use approved colours only."],
  usagePolicies: ["Do not imply unverified product outcomes."],
  approvedColours: ["#123456"],
  typographyReferences: ["Sample Sans"],
  approvedLogoReferences: ["mock-logo-primary"],
  assetMetadata: ["Local mock asset; not a live repository reference."],
  source: SAMPLE_SOURCE,
};

const sampleKnowledge: BrandKnowledgeRecord = {
  profile: sampleProfile,
  guidelines: [
    {
      approved: true,
      kind: "VOICE_AND_TONE",
      value: "Use a clear, helpful and evidence-led voice.",
      source: SAMPLE_SOURCE,
    },
  ],
  productFacts: [
    {
      approved: true,
      kind: "PRODUCT_NAME",
      value: "Sample Product",
      source: SAMPLE_SOURCE,
    },
  ],
  promotionalClaims: [
    {
      approved: true,
      value: "Sample Product supports documented workflows.",
      supportingEvidence: "mock-evidence-product-workflows",
      restrictions: ["Use only for documented workflows."],
      source: SAMPLE_SOURCE,
    },
  ],
  terminology: [
    {
      approved: true,
      kind: "PREFERRED",
      value: "customer",
      source: SAMPLE_SOURCE,
    },
    {
      approved: true,
      kind: "PROHIBITED",
      value: "guaranteed",
      source: SAMPLE_SOURCE,
    },
  ],
  visualAssets: [
    {
      approved: true,
      kind: "COLOUR",
      value: "#123456",
      source: SAMPLE_SOURCE,
    },
  ],
};

export class MockBrandKnowledgeRepository
  implements BrandKnowledgeRepository
{
  private readonly brands: ReadonlyMap<string, BrandKnowledgeRecord>;

  constructor(
    brands: ReadonlyMap<string, BrandKnowledgeRecord> = new Map([
      [sampleProfile.brandId, sampleKnowledge],
      [teraluneKnowledge.profile.brandId, teraluneKnowledge],
    ]),
  ) {
    this.brands = brands;
  }

  async getBrandKnowledge(
    query: BrandContextQuery,
  ): Promise<BrandKnowledgeRecord | null> {
    return this.brands.get(query.brandId) ?? null;
  }
}

export { sampleKnowledge };
export { teraluneKnowledge };
