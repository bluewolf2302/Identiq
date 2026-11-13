import { z } from "zod";

import {
  BrandContextSchema,
  ReviewFindingSchema,
  type BrandContext,
  type EvidenceReference,
  type ReviewFinding,
} from "../contracts";

const CandidateEvidenceSchema = z
  .object({
    sourceId: z.string().min(1),
    versionId: z.string().min(1),
    sourceTitle: z.string().min(1),
    sourceType: z.string().min(1),
    excerpt: z.string().min(1).optional(),
    pageNumber: z.number().int().positive().optional(),
    section: z.string().min(1).optional(),
  })
  .strict();

const CandidateLocationSchema = z
  .object({
    startOffset: z.number().int().nonnegative().optional(),
    endOffset: z.number().int().nonnegative().optional(),
    quote: z.string().min(1).optional(),
  })
  .strict()
  .refine(
    (location) =>
      location.endOffset === undefined ||
      location.startOffset === undefined ||
      location.endOffset >= location.startOffset,
    "endOffset must be greater than or equal to startOffset",
  );

export const AiFindingCandidateSchema = z
  .object({
    category: z.enum([
      "TONE_AND_TERMINOLOGY",
      "FACT_VERIFICATION",
      "PROMOTIONAL_CLAIM",
      "VISUAL_COMPLIANCE",
      "ACCESSIBILITY",
    ]),
    severity: z.enum(["HIGH", "MEDIUM", "LOW", "INFO"]),
    status: z.enum([
      "SUPPORTED",
      "CONFLICTING",
      "UNVERIFIED",
      "NEEDS_HUMAN_REVIEW",
    ]),
    issue: z.string().trim().min(1),
    description: z.string().trim().min(1),
    detectedValue: z.string().trim().min(1).optional(),
    expectedValue: z.string().trim().min(1).optional(),
    explanation: z.string().trim().min(1),
    suggestedCorrection: z.string().trim().min(1).optional(),
    evidenceReferences: z.array(CandidateEvidenceSchema).min(1),
    location: CandidateLocationSchema.optional(),
    confidence: z.number().min(0).max(1).optional(),
  })
  .strict();

export const AiCandidateResponseSchema = z
  .object({
    findings: z.array(AiFindingCandidateSchema),
  })
  .strict();

export type AiFindingCandidate = z.infer<typeof AiFindingCandidateSchema>;

export class AiCandidateValidationError extends Error {
  readonly issues: z.ZodIssue[];

  constructor(issues: z.ZodIssue[]) {
    super("AI response did not contain valid structured findings.");
    this.name = "AiCandidateValidationError";
    this.issues = issues;
  }
}

export class AiEvidenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiEvidenceValidationError";
  }
}

export function parseAndValidateCandidates(
  value: unknown,
  context: BrandContext,
  content: string,
): ReviewFinding[] {
  const parsedContext = BrandContextSchema.safeParse(context);
  if (!parsedContext.success) {
    throw new AiEvidenceValidationError("Brand context is invalid.");
  }

  const parsed = AiCandidateResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new AiCandidateValidationError(parsed.error.issues);
  }

  const sourceIds = new Set(parsedContext.data.sourceIds);
  const versionIds = new Set(parsedContext.data.versionId.split(",").map((id) => id.trim()));
  return parsed.data.findings.map((candidate, index) => {
    for (const evidence of candidate.evidenceReferences) {
      if (!sourceIds.has(evidence.sourceId)) {
        throw new AiEvidenceValidationError(
          `AI finding ${index} referenced an unknown source.`,
        );
      }
      if (!versionIds.has(evidence.versionId)) {
        throw new AiEvidenceValidationError(
          `AI finding ${index} referenced an invalid source version.`,
        );
      }
    }

    const location = candidate.location
      ? validateLocation(candidate.location, content, index)
      : undefined;
    const evidenceReferences: EvidenceReference[] = candidate.evidenceReferences;
    const finding = ReviewFindingSchema.parse({
      findingId: `ai-${index + 1}`,
      ...candidate,
      evidenceReferences,
      location,
      analysisProvider: "ai-semantic-analysis",
    });
    return finding;
  });
}

function validateLocation(
  location: AiFindingCandidate["location"],
  content: string,
  index: number,
) {
  if (!location) {
    return undefined;
  }
  if (
    location.startOffset !== undefined &&
    location.endOffset !== undefined &&
    (location.endOffset > content.length ||
      location.startOffset > location.endOffset)
  ) {
    throw new AiEvidenceValidationError(
      `AI finding ${index} contained an invalid text location.`,
    );
  }
  if (
    location.quote &&
    (location.startOffset === undefined ||
      content.slice(
        location.startOffset,
        location.endOffset ?? location.startOffset + location.quote.length,
      ) !== location.quote)
  ) {
    throw new AiEvidenceValidationError(
      `AI finding ${index} contained a location quote that does not match submitted text.`,
    );
  }
  return {
    startOffset: location.startOffset,
    endOffset: location.endOffset,
  };
}
