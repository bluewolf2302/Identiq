import type { BrandContext, ReviewFinding } from "../contracts";

export type DeterministicTextAnalysisInput = {
  content: string;
  brandContext: BrandContext;
};

export type DeterministicTextAnalysisResult = {
  findings: ReviewFinding[];
};
