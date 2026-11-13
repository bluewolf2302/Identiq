# AI Semantic Text Analysis

The AI layer in [`lib/ai`](../lib/ai) complements the deterministic engine; it
does not replace or rewrite it. Providers are server-side, injectable, and
return only evidence-validated `ReviewFinding` objects.

## Architecture

- `types.ts` defines the provider seam, configuration, and typed failures.
- `prompt-builder.ts` separates system instructions, approved context, and
  submitted content.
- `openrouter-provider.ts` calls OpenRouter's chat-completions endpoint with a
  strict JSON-schema response format.
- `gemini-provider.ts` calls Gemini `generateContent` with JSON response
  configuration.
- `response-validator.ts` validates candidate structure, source IDs, versions,
  locations, and final `ReviewFinding` compatibility.
- `ai-analysis-service.ts` orchestrates one primary call and at most one
  fallback call.

## Provider configuration

Set server-only variables using `.env` or the deployment environment:

```text
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
```

`.env.example` contains placeholders only. Do not use `NEXT_PUBLIC_` prefixes.
Model identifiers are required; deployments must set explicit identifiers
currently supported by their provider account. No model default is embedded in
the application.

## Fallback behavior

Construct providers only when credentials are configured. The service calls
OpenRouter once, then Gemini once if a fallback was injected and the primary
call fails. It never retries indefinitely and never turns provider failure into
an empty successful result. If all providers fail, it throws
`AiAnalysisUnavailableError` with safe provider-level messages.

## Supported AI checks

The prompt asks the model to analyze contextual tone, meaningful guideline
inconsistency, semantic claim conflicts, and unsupported claims using only the
provided approved context. Submitted text is explicitly untrusted. Findings
that duplicate deterministic findings by category, issue, and location are
removed.

## Evidence validation

AI candidates must include at least one evidence reference. Every source ID and
version ID must exist in the supplied `BrandContext`. Location quotes must
match the submitted text and offsets must be in bounds. Candidates that fail
these checks are rejected; fabricated references are never converted into
findings.

## Security precautions

- Provider credentials are read only by server-side provider constructors.
- Credentials are never inserted into prompts, logs, or public error messages.
- Provider errors are replaced with safe messages.
- Submitted content is serialized as data and treated as untrusted input.
- No provider call is made by the frontend in this phase.

## Tested functionality and limitations

Tests cover successful provider parsing, fallback, unavailable providers,
timeouts, malformed responses, invalid/fabricated evidence, semantic findings,
clean results, deduplication, and prompt-injection text.

The provider schema intentionally uses a small internal candidate shape because
the public Phase 1 contracts do not include a first-class structured guideline
or claim model. Semantic quality remains model-dependent, and no API route,
frontend integration, persistence, or real paid provider call is included in
this phase.

Provider API references:

- [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs)
- [OpenRouter API reference](https://openrouter.ai/docs/api_reference/overview)
- [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini text generation](https://ai.google.dev/gemini-api/docs/generate-content)
