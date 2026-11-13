import { z } from "zod";

import { BrandContextSchema } from "./brand";
import { ReviewFindingSchema } from "./findings";

export const UploadedFileReferenceSchema = z
  .object({
    fileId: z.string().min(1),
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    uri: z.string().min(1),
    sizeBytes: z.number().int().nonnegative().optional(),
  })
  .strict();

export type UploadedFileReference = z.infer<
  typeof UploadedFileReferenceSchema
>;

export const AnalysisRequestSchema = z
  .object({
    submissionId: z.string().min(1),
    brandId: z.string().min(1),
    campaignName: z.string().min(1),
    contentText: z.string().optional(),
    uploadedFileReferences: z.array(UploadedFileReferenceSchema).optional(),
    contentPlatform: z.string().min(1).optional(),
    brandContext: BrandContextSchema.optional(),
  })
  .strict();

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

export const AnalysisStatusSchema = z.enum([
  "COMPLETED",
  "PARTIAL",
  "FAILED",
]);
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;

export const AnalysisResponseSchema = z
  .object({
    submissionId: z.string().min(1),
    analysisRunId: z.string().min(1),
    analysisStatus: AnalysisStatusSchema,
    findings: z.array(ReviewFindingSchema),
    providerUsed: z.string().min(1),
    fallbackUsed: z.boolean(),
    analysisTimestamp: z.string().datetime({ offset: true }),
  })
  .strict();

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
