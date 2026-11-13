import type { BrandKnowledgeRecord } from "./types";

const brandSource = {
  sourceDocumentId: "SRC-BRAND-01",
  sourceTitle: "Teralune Brand Identity & AI Governance Guidelines (fictional)",
  versionId: "1.0",
  section: "Brand overview and communication standards",
} as const;

const productSource = {
  sourceDocumentId: "SRC-PROD-01",
  sourceTitle: "Teralune Approved Product Record (fictional)",
  versionId: "1.0",
  section: "Product standards, page 3",
  pageNumber: 3,
} as const;

const claimsSource = {
  sourceDocumentId: "SRC-CLAIM-01",
  sourceTitle: "Teralune Approved Marketing Claims (fictional)",
  versionId: "1.0",
  section: "Approved claims and fact verification, page 4",
  pageNumber: 4,
} as const;

const assetSource = {
  sourceDocumentId: "SRC-ASSET-01",
  sourceTitle: "Teralune Approved Logo and Product Appearance (fictional)",
  versionId: "1.0",
  section: "Visual identity and asset standards, page 2",
  pageNumber: 2,
} as const;

const source = <
  T extends {
    readonly sourceDocumentId: string;
    readonly sourceTitle: string;
    readonly versionId: string;
    readonly section: string;
  },
>(
  metadata: T,
): T => metadata;

export const teraluneKnowledge: BrandKnowledgeRecord = {
  profile: {
    approved: true,
    brandId: "demo-brand-teralune",
    organisationId: "demo-organisation-teralune",
    brandName: "Teralune",
    profile:
      "Fictional bottled-water brand positioned around clear, dependable and everyday refreshment. The identity is calm, natural and contemporary, with simple factual language and restrained visual elements inspired by water and the natural landscape.",
    voiceAndTone: "Clear, calm, helpful, factual, refreshing and considerate.",
    communicationInstructions: [
      "Use simple, factual language.",
      "Use short sentences and familiar words.",
      "Avoid aggressive urgency, unrealistic promises, medical authority and manipulative language.",
      "Use the exact product name Teralune Still Spring Water.",
      "Use the unit style 500 mL.",
      "Use grammatically correct English and standard punctuation.",
    ],
    designGuidelines: [
      "Use Deep Current #163A52, Spring Teal #239A8B, Mist #DFF1ED and Cloud White #F4F8F7 for prominent brand elements.",
      "Use the approved droplet-and-wave logo artwork without distortion, recolouring, cropping or effects.",
      "Maintain logo clear space equal to at least the droplet symbol height.",
      "Use the complete logo at least 28 mm wide in print or 120 px wide digitally.",
    ],
    usagePolicies: [
      "Do not imply unsupported health outcomes, certifications, endorsements or environmental benefits.",
      "Do not use Teralune®; the fictional guide authorizes Teralune™ only.",
      "A sale price or discount is not currently approved.",
      "Visual checks that cannot be reliably assessed require human review.",
    ],
    approvedColours: [
      "Deep Current #163A52",
      "Spring Teal #239A8B",
      "Mist #DFF1ED",
      "Cloud White #F4F8F7",
    ],
    typographyReferences: [
      "Manrope Bold preferred for headings",
      "Inter or equivalent readable sans serif for body text",
    ],
    approvedLogoReferences: [
      "Primary horizontal logo with droplet mark, TERALUNE wordmark and tagline",
      "Approved symbol-only droplet-and-wave mark",
      "Approved reversed white wordmark with teal symbol",
    ],
    assetMetadata: [
      "Clear PET bottle",
      "Deep Current cap",
      "White label with Spring Teal droplet mark",
      "Fictional local demo asset; not a live repository reference",
    ],
    source: source(brandSource),
  },
  guidelines: [
    {
      approved: true,
      kind: "VOICE_AND_TONE",
      value:
        "LANG-01/LANG-03/LANG-07: Use clear, calm, helpful and factual language; avoid confusing constructions, aggressive urgency and unrealistic promises.",
      source: source(brandSource),
    },
    {
      approved: true,
      kind: "COMMUNICATION",
      value:
        "LANG-02/LANG-04/LANG-05: Use consistent English spelling, sentence case and standard punctuation; avoid full-sentence capitals, repeated exclamation marks and excessive ellipses.",
      source: source(brandSource),
    },
    {
      approved: true,
      kind: "USAGE",
      value:
        "LANG-06: Use the exact product name Teralune Still Spring Water and the unit style 500 mL.",
      source: source(brandSource),
    },
    {
      approved: true,
      kind: "DESIGN",
      value:
        "LOG-01 through LOG-06 and IMG-01 through IMG-09 govern logo integrity, approved colours, clear space, size, background, composition, accessibility and visual uncertainty.",
      source: source(assetSource),
    },
    {
      approved: true,
      kind: "USAGE",
      value:
        "CLM-POLICY: Claims about cures, disease, immunity, detoxification, concentration, tiredness, guaranteed health outcomes, purity, clinical proof, medical recommendation, mineral enrichment, carbon neutrality, plastic-free status, superiority, certifications or endorsements require approved evidence; otherwise label them Unverified.",
      source: source(claimsSource),
    },
    {
      approved: true,
      kind: "USAGE",
      value:
        "PRD-05: No discounted price or offer is currently approved; a sale price or discount requires separate authorization.",
      source: source(productSource),
    },
  ],
  productFacts: [
    {
      approved: true,
      kind: "PRODUCT_NAME",
      value: "Teralune Still Spring Water (PRD-01)",
      source: source(productSource),
    },
    {
      approved: true,
      kind: "PRODUCT_SPECIFICATION",
      value: "TLSW-500 (PRD-02; SKU must match exactly)",
      source: source(productSource),
    },
    {
      approved: true,
      kind: "PRODUCT_SPECIFICATION",
      value: "500 mL bottle (PRD-04; use a space and capital L)",
      source: source(productSource),
    },
    {
      approved: true,
      kind: "PRODUCT_PRICE",
      value: "₹25 per 500 mL bottle (PRD-05; no sale price is currently approved)",
      source: source(productSource),
    },
    {
      approved: true,
      kind: "COMPANY_INFORMATION",
      value: "Teralune Beverages Private Limited (fictional)",
      source: source(brandSource),
    },
  ],
  promotionalClaims: [
    {
      approved: true,
      value: "CLM-01: Refreshment, Naturally.",
      supportingEvidence: "SRC-CLAIM-01; page 4",
      restrictions: ["Official tagline; preserve punctuation and capitalisation where practical."],
      source: source(claimsSource),
    },
    {
      approved: true,
      value: "CLM-02: Still spring water for everyday hydration.",
      supportingEvidence: "SRC-CLAIM-01; page 4",
      restrictions: ["Approved product description."],
      source: source(claimsSource),
    },
    {
      approved: true,
      value: "CLM-03: A crisp, refreshing option for everyday moments.",
      supportingEvidence: "SRC-CLAIM-01; page 4",
      restrictions: ["Approved general lifestyle copy."],
      source: source(claimsSource),
    },
    {
      approved: true,
      value: "CLM-04: Available in a 500 mL bottle.",
      supportingEvidence: "SRC-CLAIM-01; page 4",
      restrictions: ["Approved availability and pack-size statement."],
      source: source(claimsSource),
    },
  ],
  terminology: [
    {
      approved: true,
      kind: "PREFERRED",
      value: "REQUIRED: Teralune Still Spring Water",
      source: source(brandSource),
    },
    {
      approved: true,
      kind: "PREFERRED",
      value: "REQUIRED: 500 mL",
      source: source(productSource),
    },
    {
      approved: true,
      kind: "PROHIBITED",
      value: "Teralune®",
      source: source(brandSource),
    },
    {
      approved: true,
      kind: "PROHIBITED",
      value: "500ml",
      source: source(productSource),
    },
  ],
  visualAssets: [
    {
      approved: true,
      kind: "COLOUR",
      value: "Deep Current #163A52",
      source: source(assetSource),
    },
    {
      approved: true,
      kind: "COLOUR",
      value: "Spring Teal #239A8B",
      source: source(assetSource),
    },
    {
      approved: true,
      kind: "COLOUR",
      value: "Mist #DFF1ED",
      source: source(assetSource),
    },
    {
      approved: true,
      kind: "COLOUR",
      value: "Cloud White #F4F8F7",
      source: source(assetSource),
    },
    {
      approved: true,
      kind: "LOGO",
      value:
        "LOG-01 to LOG-06: approved droplet-and-wave logo; preserve proportions, colours, clear space, minimum size and plain high-contrast background.",
      source: source(assetSource),
    },
    {
      approved: true,
      kind: "ASSET_METADATA",
      value:
        "IMG-01 to IMG-09: clear PET bottle, Deep Current cap, white label, Spring Teal droplet mark; visual uncertainty requires human review.",
      source: source(assetSource),
    },
  ],
};
