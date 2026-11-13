import type {
  AnalysisRequest,
  AnalysisResponse,
  BrandContext,
  ReviewFinding,
} from "../contracts";
import type { BrandContextRetrieval } from "../brand-context";
import type {
  AiAnalysisInput,
  AiAnalysisResult,
} from "../ai";
import type {
  DeterministicTextAnalysisInput,
  DeterministicTextAnalysisResult,
} from "../governance";

export type BrandContextRetriever = {
  getForSubmission(query: {
    brandId: string;
    submissionId?: string;
    contentPlatform?: string;
  }): Promise<BrandContextRetrieval>;
};

export type DeterministicAnalyzer = {
  analyze(
    input: DeterministicTextAnalysisInput,
  ): DeterministicTextAnalysisResult;
};

export type SemanticAnalyzer = {
  analyze(input: AiAnalysisInput): Promise<AiAnalysisResult>;
};

export type AnalysisOrchestratorDependencies = {
  brandContextService: BrandContextRetriever;
  deterministicEngine: DeterministicAnalyzer;
  aiAnalysisService: SemanticAnalyzer;
  createAnalysisRunId?: () => string;
  now?: () => Date;
};

export type AnalysisExecution = {
  request: AnalysisRequest;
  context: BrandContext;
  findings: ReviewFinding[];
  warnings: string[];
  providerUsed: string;
  fallbackUsed: boolean;
  analysisStatus: AnalysisResponse["analysisStatus"];
};
