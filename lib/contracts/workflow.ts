import { z } from "zod";

import { ReviewFindingSchema } from "./findings";

export const SubmissionStatusSchema = z.enum([
  "DRAFT",
  "SUBMITTED",
  "PROCESSING",
  "REVIEW_REQUIRED",
  "CHANGES_REQUESTED",
  "REASSESSMENT",
  "APPROVED",
  "FAILED",
]);

export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const ReviewDecisionSchema = z.enum([
  "APPROVE",
  "REQUEST_CHANGES",
  "REJECT",
]);

export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;

export const CorrectionRequestSchema = z
  .object({
    submissionId: z.string().min(1),
    findingId: z.string().min(1),
    correctedValue: z.string().min(1),
    requestedBy: z.string().min(1),
    note: z.string().min(1).optional(),
  })
  .strict();

export type CorrectionRequest = z.infer<typeof CorrectionRequestSchema>;

export const CorrectionResponseSchema = z
  .object({
    submissionId: z.string().min(1),
    findingId: z.string().min(1),
    correctedValue: z.string().min(1),
    finding: ReviewFindingSchema,
    status: z.enum(["SAVED", "REQUIRES_REASSESSMENT"]),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type CorrectionResponse = z.infer<typeof CorrectionResponseSchema>;

export const ReviewDecisionRequestSchema = z
  .object({
    submissionId: z.string().min(1),
    decision: ReviewDecisionSchema,
    decidedBy: z.string().min(1),
    note: z.string().min(1).optional(),
  })
  .strict();

export type ReviewDecisionRequest = z.infer<
  typeof ReviewDecisionRequestSchema
>;
