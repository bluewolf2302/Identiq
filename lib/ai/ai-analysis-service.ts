import { BrandContextSchema } from "../contracts";
import {
  AiProviderError,
  AiAnalysisUnavailableError,
  MissingAiProviderCredentialsError,
  type AiAnalysisInput,
  type AiAnalysisResult,
  type AiAnalysisServiceOptions,
  type AiProvider,
} from "./types";
import { GeminiProvider } from "./gemini-provider";
import { OpenRouterProvider } from "./openrouter-provider";
import { buildAiAnalysisRequest } from "./prompt-builder";
import { parseAndValidateCandidates } from "./response-validator";

export class AiAnalysisService {
  private readonly primary?: AiProvider;
  private readonly fallback?: AiProvider;

  constructor(options: AiAnalysisServiceOptions) {
    this.primary = options.primary;
    this.fallback = options.fallback;
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    const context = BrandContextSchema.safeParse(input.brandContext);
    if (!context.success || !input.content.trim()) {
      return { findings: [], providerUsed: "none", fallbackUsed: false };
    }

    const request = buildAiAnalysisRequest(
      input.content,
      context.data,
      input.deterministicFindings,
    );
    const failures: AiProviderError[] = [];
    for (const [index, provider] of [this.primary, this.fallback].entries()) {
      if (!provider) {
        continue;
      }
      try {
        const raw = await provider.analyze(request);
        const findings = parseAndValidateCandidates(raw, context.data, input.content)
          .filter((finding) => !isDuplicateOfDeterministic(finding, input.deterministicFindings));
        return {
          findings,
          providerUsed: provider.name,
          fallbackUsed: index > 0,
        };
      } catch (error) {
        if (error instanceof MissingAiProviderCredentialsError) {
          failures.push(
            new AiProviderError(provider.name, error.message, { cause: error }),
          );
        } else {
          failures.push(
            new AiProviderError(
              provider.name,
              error instanceof Error
                ? error.message
                : "Provider returned an invalid response.",
              { cause: error },
            ),
          );
        }
      }

    }

    throw new AiAnalysisUnavailableError(failures);
  }
}

export function createAiAnalysisServiceFromEnvironment(): AiAnalysisService {
  const primary =
    process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL
      ? new OpenRouterProvider({
          apiKey: process.env.OPENROUTER_API_KEY,
          model: process.env.OPENROUTER_MODEL,
        })
      : undefined;
  const fallback =
    process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL
      ? new GeminiProvider({
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL,
        })
      : undefined;
  return new AiAnalysisService({ primary, fallback });
}

function isDuplicateOfDeterministic(
  finding: import("../contracts").ReviewFinding,
  deterministicFindings: import("../contracts").ReviewFinding[] = [],
): boolean {
  return deterministicFindings.some(
    (existing) =>
      existing.category === finding.category &&
      existing.location?.startOffset === finding.location?.startOffset &&
      existing.location?.endOffset === finding.location?.endOffset &&
      existing.issue.toLocaleLowerCase() === finding.issue.toLocaleLowerCase(),
  );
}
