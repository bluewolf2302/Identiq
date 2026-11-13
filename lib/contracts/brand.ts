import { z } from "zod";

export const BrandContextSchema = z
  .object({
    brandProfile: z.string().min(1),
    approvedGuidelines: z.array(z.string().min(1)),
    approvedProductFacts: z.array(z.string().min(1)),
    approvedPromotionalClaims: z.array(z.string().min(1)),
    preferredTerminology: z.array(z.string().min(1)),
    prohibitedTerminology: z.array(z.string().min(1)),
    approvedColours: z.array(z.string().min(1)),
    approvedVisualAssetReferences: z.array(z.string().min(1)),
    sourceIds: z.array(z.string().min(1)),
    versionId: z.string().min(1),
    sourceVersionInformation: z.string().min(1),
  })
  .strict();

export type BrandContext = z.infer<typeof BrandContextSchema>;
