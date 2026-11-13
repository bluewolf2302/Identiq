import {
  AnalysisRequestSchema,
  AnalysisResponseSchema,
  type AnalysisRequest,
  type AnalysisResponse,
} from "../contracts";
import {
  BrandNotFoundError,
  type BrandContextRetrieval,
} from "../brand-context";
import type { ReviewFinding } from "../contracts";
import { mergeFindings } from "./finding-merger";
import type {
  AnalysisOrchestratorDependencies,
  BrandContextRetriever,
  DeterministicAnalyzer,
  SemanticAnalyzer,
} from "./types";

export type AnalysisFailureStage =
  | "request-validation"
  | "brand-context"
  | "deterministic"
  | "ai"
  | "response-validation";

export class AnalysisOrchestrationError extends Error {
  readonly stage: AnalysisFailureStage;
  readonly cause: unknown;

  constructor(
    stage: AnalysisFailureStage,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "AnalysisOrchestrationError";
    this.stage = stage;
    this.cause = cause;
  }
}

export class InvalidAnalysisRequestError extends AnalysisOrchestrationError {
  readonly issues: unknown;

  constructor(issues: unknown) {
    super(
      "request-validation",
      "The analysis request is invalid.",
      issues,
    );
    this.name = "InvalidAnalysisRequestError";
    this.issues = issues;
  }
}

export class AnalysisResponseValidationError extends AnalysisOrchestrationError {
  readonly issues: unknown;

  constructor(issues: unknown) {
    super(
      "response-validation",
      "The analysis response failed contract validation.",
      issues,
    );
    this.name = "AnalysisResponseValidationError";
    this.issues = issues;
  }
}

function defaultRunId(): string {
  return globalThis.crypto?.randomUUID() ?? `analysis-${Date.now()}`;
}

function toSafeFailureMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Analysis dependency failed.";
}

export class AnalysisOrchestrator {
  private readonly brandContextService: BrandContextRetriever;
  private readonly deterministicEngine: DeterministicAnalyzer;
  private readonly aiAnalysisService: SemanticAnalyzer;
  private readonly createAnalysisRunId: () => string;
  private readonly now: () => Date;

  constructor(dependencies: AnalysisOrchestratorDependencies) {
    this.brandContextService = dependencies.brandContextService;
    this.deterministicEngine = dependencies.deterministicEngine;
    this.aiAnalysisService = dependencies.aiAnalysisService;
    this.createAnalysisRunId = dependencies.createAnalysisRunId ?? defaultRunId;
    this.now = dependencies.now ?? (() => new Date());
  }

  async analyze(input: unknown): Promise<AnalysisResponse> {
    const request = AnalysisRequestSchema.safeParse(input);
    if (!request.success) {
      throw new InvalidAnalysisRequestError(request.error.issues);
    }

    const contextResult = await this.retrieveContext(request.data);
    const content = request.data.contentText ?? "";
    const deterministicFindings = this.runDeterministic(content, contextResult);
    const semanticResult = await this.runSemantic(
      content,
      contextResult,
      deterministicFindings,
    );
    const findings = mergeFindings(
      deterministicFindings,
      semanticResult.findings,
    );

    const responseInput = {
      submissionId: request.data.submissionId,
      analysisRunId: this.createAnalysisRunId(),
      analysisStatus:
        contextResult.warnings.length > 0 ? ("PARTIAL" as const) : ("COMPLETED" as const),
      findings,
      providerUsed: semanticResult.providerUsed,
      fallbackUsed: semanticResult.fallbackUsed,
      analysisTimestamp: this.now().toISOString(),
    };
    const response = AnalysisResponseSchema.safeParse(responseInput);
    if (!response.success) {
      throw new AnalysisResponseValidationError(response.error.issues);
    }
    return response.data;
  }

  private async retrieveContext(
    request: AnalysisRequest,
  ): Promise<BrandContextRetrieval> {
    try {
      return await this.brandContextService.getForSubmission({
        brandId: request.brandId,
        submissionId: request.submissionId,
        contentPlatform: request.contentPlatform,
      });
    } catch (error) {
      const message =
        error instanceof BrandNotFoundError
          ? error.message
          : `Brand context retrieval failed: ${toSafeFailureMessage(error)}`;
      throw new AnalysisOrchestrationError("brand-context", message, error);
    }
  }

  private runDeterministic(
    content: string,
    contextResult: BrandContextRetrieval,
  ): ReviewFinding[] {
    try {
      return this.deterministicEngine.analyze({
        content,
        brandContext: contextResult.context,
      }).findings;
    } catch (error) {
      throw new AnalysisOrchestrationError(
        "deterministic",
        `Deterministic analysis failed: ${toSafeFailureMessage(error)}`,
        error,
      );
    }
  }

  private async runSemantic(
    content: string,
    contextResult: BrandContextRetrieval,
    deterministicFindings: ReviewFinding[],
  ) {
    try {
      return await this.aiAnalysisService.analyze({
        content,
        brandContext: contextResult.context,
        deterministicFindings,
      });
    } catch (error) {
      throw new AnalysisOrchestrationError(
        "ai",
        "AI semantic analysis failed.",
        error,
      );
    }
  }
}
