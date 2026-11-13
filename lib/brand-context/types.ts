import { z } from "zod";

const SourceMetadataSchema = z
  .object({
    sourceDocumentId: z.string().trim().min(1),
    sourceTitle: z.string().trim().min(1),
    versionId: z.string().trim().min(1),
    pageNumber: z.number().int().positive().optional(),
    section: z.string().trim().min(1).optional(),
  })
  .strict();

const ApplicabilitySchema = z
  .object({
    submissionIds: z.array(z.string().trim().min(1)).optional(),
    contentPlatforms: z.array(z.string().trim().min(1)).optional(),
  })
  .strict();

const ApprovedRecordSchema = z
  .object({
    approved: z.literal(true),
    applicableTo: ApplicabilitySchema.optional(),
    source: SourceMetadataSchema,
  })
  .strict();

export const BrandProfileRecordSchema = ApprovedRecordSchema.extend({
  brandId: z.string().trim().min(1),
  organisationId: z.string().trim().min(1),
  brandName: z.string().trim().min(1),
  profile: z.string().trim().min(1),
  voiceAndTone: z.string().trim().min(1),
  communicationInstructions: z.array(z.string().trim().min(1)),
  designGuidelines: z.array(z.string().trim().min(1)),
  usagePolicies: z.array(z.string().trim().min(1)),
  approvedColours: z.array(z.string().trim().min(1)),
  typographyReferences: z.array(z.string().trim().min(1)),
  approvedLogoReferences: z.array(z.string().trim().min(1)),
  assetMetadata: z.array(z.string().trim().min(1)),
});

export type BrandProfileRecord = z.infer<typeof BrandProfileRecordSchema>;

const KnowledgeRecordSchema = ApprovedRecordSchema.extend({
  value: z.string().trim().min(1),
});

export const BrandKnowledgeRecordSchema = z
  .object({
    profile: BrandProfileRecordSchema,
    guidelines: z.array(
      KnowledgeRecordSchema.extend({
        kind: z.enum(["VOICE_AND_TONE", "COMMUNICATION", "DESIGN", "USAGE"]),
      }),
    ),
    productFacts: z.array(
      KnowledgeRecordSchema.extend({
        kind: z.enum([
          "PRODUCT_NAME",
          "PRODUCT_PRICE",
          "PRODUCT_SPECIFICATION",
          "APPROVED_DATE",
          "COMPANY_INFORMATION",
        ]),
      }),
    ),
    promotionalClaims: z.array(
      KnowledgeRecordSchema.extend({
        supportingEvidence: z.string().trim().min(1),
        restrictions: z.array(z.string().trim().min(1)),
      }),
    ),
    terminology: z.array(
      KnowledgeRecordSchema.extend({
        kind: z.enum(["PREFERRED", "PROHIBITED", "SPELLING"]),
      }),
    ),
    visualAssets: z.array(
      KnowledgeRecordSchema.extend({
        kind: z.enum(["COLOUR", "TYPOGRAPHY", "LOGO", "ASSET_METADATA"]),
      }),
    ),
  })
  .strict();

export type BrandKnowledgeRecord = z.infer<typeof BrandKnowledgeRecordSchema>;

export type BrandContextQuery = {
  brandId: string;
  submissionId?: string;
  contentPlatform?: string;
};

export type BrandContextWarning =
  | "NO_APPROVED_GUIDELINES"
  | "NO_APPROVED_PRODUCT_FACTS"
  | "NO_APPROVED_PROMOTIONAL_CLAIMS"
  | "NO_APPROVED_TERMINOLOGY"
  | "NO_APPROVED_VISUAL_ASSETS";
