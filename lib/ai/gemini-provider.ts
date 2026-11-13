import {
  AiProviderError,
  MissingAiProviderConfigurationError,
  MissingAiProviderCredentialsError,
  type AiProvider,
  type AiProviderRequest,
  type ProviderConfiguration,
  type ResolvedProviderConfiguration,
} from "./types";

const CANDIDATE_SCHEMA = {
  type: "OBJECT",
  properties: {
    findings: { type: "ARRAY", items: { type: "OBJECT" } },
  },
  required: ["findings"],
};

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private readonly config: ResolvedProviderConfiguration;

  constructor(config: ProviderConfiguration) {
    if (!config.apiKey.trim()) {
      throw new MissingAiProviderCredentialsError(this.name);
    }
    if (!config.model.trim()) {
      throw new MissingAiProviderConfigurationError(this.name, "GEMINI_MODEL");
    }
    this.config = {
      ...config,
      model: config.model.trim(),
      timeoutMs: config.timeoutMs ?? 20_000,
      fetcher: config.fetcher ?? fetch,
    };
  }

  async analyze(request: AiProviderRequest): Promise<unknown> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.config.model,
    )}:generateContent?key=${encodeURIComponent(this.config.apiKey)}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const response = await this.config.fetcher(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: request.systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseJsonSchema: CANDIDATE_SCHEMA,
            },
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new AiProviderError(this.name, "Gemini request failed.", {
            retryable: response.status >= 500 || response.status === 429,
          });
        }
        const payload = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new AiProviderError(this.name, "Gemini returned no structured content.");
        }
        try {
          return JSON.parse(text);
        } catch (error) {
          throw new AiProviderError(this.name, "Gemini returned malformed JSON.", {
            cause: error,
          });
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw error;
      }
      throw new AiProviderError(
        this.name,
        error instanceof DOMException && error.name === "AbortError"
          ? "Gemini request timed out."
          : "Gemini request could not be completed.",
        { retryable: true, cause: error },
      );
    }
  }
}
