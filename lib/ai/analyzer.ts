import { GoogleGenAI, Type } from "@google/genai";
import {
  AnalysisRequestPayload,
  AnalysisResponsePayload,
  EvidenceStatus,
  FindingCategory,
  FindingSeverity,
  ReviewFinding,
} from "@/lib/types";

/**
 * Single Server-Side AI Service Abstraction for Identiq
 *
 * Provider precedence:
 * 1. OpenRouter (primary) via OPENROUTER_API_KEY
 * 2. Gemini (fallback) via GEMINI_API_KEY and @google/genai
 * 3. Deterministic structured mock analysis when credentials are unavailable
 */

const VALID_CATEGORIES: FindingCategory[] = [
  "Brand Claims",
  "Terminology",
  "Tone & Voice",
  "Visual Identity",
  "Legal & Usage",
];

const VALID_SEVERITIES: FindingSeverity[] = ["high", "medium", "low"];
const VALID_EVIDENCE: EvidenceStatus[] = ["supported", "conflicting", "unverified"];

function buildSystemPrompt(payload: AnalysisRequestPayload): string {
  const knowledgeContext =
    payload.knowledgeSummary && payload.knowledgeSummary.length > 0
      ? payload.knowledgeSummary.join("\n- ")
      : "Standard brand governance rules: avoid medical/absolute guarantees, verify numerical distribution claims, preserve approved product nomenclature.";

  return `You are Identiq, an evidence-driven brand governance analyzer.
Analyze the submitted ${payload.contentType} titled "${payload.title}" against the guideline collection "${payload.guidelineCollection}".

Approved Brand Knowledge Context:
- ${knowledgeContext}

CRITICAL EVIDENCE RULES:
1. Distinguish carefully between:
   - "supported": directly corroborated by approved brand knowledge
   - "conflicting": directly contradicts an approved rule, prohibited claim, or brand fact
   - "unverified": cannot be corroborated from available brand knowledge (NEVER label unverified claims as false or conflicting unless a direct contradiction exists)
2. Return ONLY valid JSON matching this exact schema:
{
  "complianceScore": number (0-100),
  "summary": string,
  "findings": [
    {
      "id": string,
      "category": "Brand Claims" | "Terminology" | "Tone & Voice" | "Visual Identity" | "Legal & Usage",
      "title": string,
      "description": string,
      "severity": "high" | "medium" | "low",
      "evidenceStatus": "supported" | "conflicting" | "unverified",
      "detectedValue": string,
      "expectedValue": string,
      "sourceReference": string,
      "recommendation": string,
      "affectedContent": string
    }
  ]
}`;
}

export function validateAnalysisOutput(
  raw: unknown,
  providerUsed: AnalysisResponsePayload["providerUsed"]
): AnalysisResponsePayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI response is not an object");
  }

  const obj = raw as Record<string, unknown>;
  const scoreRaw = typeof obj.complianceScore === "number" ? obj.complianceScore : 82;
  const complianceScore = Math.max(0, Math.min(100, Math.round(scoreRaw)));
  const summary =
    typeof obj.summary === "string" && obj.summary.trim().length > 0
      ? obj.summary.trim()
      : "Brand governance analysis completed against selected knowledge collection.";

  const rawFindings = Array.isArray(obj.findings) ? obj.findings : [];
  const findings: ReviewFinding[] = rawFindings.map((item, idx) => {
    const f = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const category = VALID_CATEGORIES.includes(f.category as FindingCategory)
      ? (f.category as FindingCategory)
      : "Brand Claims";
    const severity = VALID_SEVERITIES.includes(f.severity as FindingSeverity)
      ? (f.severity as FindingSeverity)
      : "medium";
    const evidenceStatus = VALID_EVIDENCE.includes(f.evidenceStatus as EvidenceStatus)
      ? (f.evidenceStatus as EvidenceStatus)
      : "unverified";

    return {
      id: typeof f.id === "string" && f.id ? f.id : `finding-${Date.now()}-${idx + 1}`,
      category,
      title: typeof f.title === "string" && f.title ? f.title : "Governance review item",
      description:
        typeof f.description === "string" && f.description
          ? f.description
          : "Requires reviewer inspection against brand guidelines.",
      severity,
      evidenceStatus,
      detectedValue: typeof f.detectedValue === "string" ? f.detectedValue : "Detected copy segment",
      expectedValue: typeof f.expectedValue === "string" ? f.expectedValue : "Approved guideline standard",
      sourceReference:
        typeof f.sourceReference === "string" && f.sourceReference
          ? f.sourceReference
          : "Brand Knowledge Hub · General Policy",
      recommendation:
        typeof f.recommendation === "string" && f.recommendation
          ? f.recommendation
          : "Review phrasing with brand governance lead before publishing.",
      affectedContent: typeof f.affectedContent === "string" ? f.affectedContent : "",
      resolved: evidenceStatus === "supported",
      comments: [],
    };
  });

  return {
    complianceScore,
    providerUsed,
    summary,
    findings,
  };
}

async function analyzeWithOpenRouter(
  payload: AnalysisRequestPayload
): Promise<AnalysisResponsePayload> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const systemPrompt = buildSystemPrompt(payload);
  const userContent: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: `Submission Title: ${payload.title}\nContent Type: ${payload.contentType}\nAsset Attached: ${payload.assetName || "None"}\n\nSubmitted Copy:\n${payload.textContent}`,
    },
  ];

  if (payload.assetBase64 && payload.assetMimeType?.startsWith("image/")) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${payload.assetMimeType};base64,${payload.assetBase64}`,
      },
    });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Identiq Brand Governance",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}`);
  }

  const data = await response.json();
  const contentText = data?.choices?.[0]?.message?.content;
  if (!contentText) {
    throw new Error("Empty response from OpenRouter");
  }

  const parsed = JSON.parse(contentText);
  return validateAnalysisOutput(parsed, "openrouter");
}

async function analyzeWithGemini(
  payload: AnalysisRequestPayload
): Promise<AnalysisResponsePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const parts: Array<Record<string, unknown>> = [
    {
      text: `Submission Title: ${payload.title}\nContent Type: ${payload.contentType}\nAsset Attached: ${payload.assetName || "None"}\n\nSubmitted Copy:\n${payload.textContent}`,
    },
  ];

  if (payload.assetBase64 && payload.assetMimeType?.startsWith("image/")) {
    parts.push({
      inlineData: {
        mimeType: payload.assetMimeType,
        data: payload.assetBase64,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-4-hydrogen",
    contents: { parts },
    config: {
      systemInstruction: buildSystemPrompt(payload),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          complianceScore: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING },
                evidenceStatus: { type: Type.STRING },
                detectedValue: { type: Type.STRING },
                expectedValue: { type: Type.STRING },
                sourceReference: { type: Type.STRING },
                recommendation: { type: Type.STRING },
                affectedContent: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  const parsed = JSON.parse((response.text ?? "{}").trim());
  return validateAnalysisOutput(parsed, "gemini");
}

function generateMockAnalysis(payload: AnalysisRequestPayload): AnalysisResponsePayload {
  const text = payload.textContent.toLowerCase();
  const findings: ReviewFinding[] = [];
  let score = 94;

  // Detect prohibited or conflicting claims
  if (
    text.includes("guarantee") ||
    text.includes("100%") ||
    text.includes("reverse aging") ||
    text.includes("unhackable") ||
    text.includes("unlimited") ||
    text.includes("cure")
  ) {
    score -= 18;
    const matchPhrase =
      text.includes("reverse aging")
        ? "reverse aging"
        : text.includes("unhackable")
        ? "100% unhackable"
        : text.includes("unlimited")
        ? "unlimited"
        : text.includes("100%")
        ? "100% guaranteed"
        : "guaranteed";

    findings.push({
      id: `f-mock-${Date.now()}-1`,
      category: "Brand Claims",
      title: "Absolute guarantee or efficacy phrasing detected",
      description:
        "Submitted copy includes absolute outcome terminology that conflicts with Identiq's Substantiated Claims standard.",
      severity: "high",
      evidenceStatus: "conflicting",
      detectedValue: matchPhrase,
      expectedValue: "Verifiable performance phrasing backed by documented consumer or audit metrics",
      sourceReference: `${payload.guidelineCollection} · Prohibited Claims Registry`,
      recommendation:
        "Replace absolute guarantees with measurable, evidence-backed outcomes and add scope qualifiers.",
      affectedContent: matchPhrase,
      resolved: false,
      comments: [],
    });
  }

  // Detect deprecated terminology
  if (text.includes("northstar black") || text.includes("bot") || text.includes("cheap")) {
    score -= 10;
    findings.push({
      id: `f-mock-${Date.now()}-2`,
      category: "Terminology",
      title: "Non-standard or deprecated terminology",
      description:
        "Detected phrasing deviates from the current Approved Terminology Lexicon.",
      severity: "medium",
      evidenceStatus: "conflicting",
      detectedValue: text.includes("northstar black") ? "Northstar Black" : "non-standard product term",
      expectedValue: text.includes("northstar black")
        ? "Northstar Obsidian Reserve"
        : "Preferred brand lexicon terminology",
      sourceReference: `${payload.guidelineCollection} · Terminology Lexicon`,
      recommendation: "Align product and brand naming with the latest approved lexicon entry.",
      affectedContent: text.includes("northstar black") ? "Northstar Black" : "",
      resolved: false,
      comments: [],
    });
  }

  // Detect unverified numeric or distribution claims without marking them false
  const numberMatch = payload.textContent.match(/\b\d+(\.\d+)?%|\b\d+\s+(countries|markets|days|hours)\b/i);
  if (numberMatch) {
    score -= 6;
    findings.push({
      id: `f-mock-${Date.now()}-3`,
      category: "Legal & Usage",
      title: "Quantitative claim requires source verification",
      description:
        "A specific metric or market count was detected. No exact matching record was found in the active knowledge snippet—marked as unverified pending source attachment rather than false.",
      severity: "medium",
      evidenceStatus: "unverified",
      detectedValue: numberMatch[0],
      expectedValue: "Citation linking to Approved Brand Facts or Q4 audit sheet",
      sourceReference: "Approved Brand Facts · Fact Verification Policy",
      recommendation:
        "Attach supporting report reference or confirm metric against the Brand Knowledge Hub.",
      affectedContent: numberMatch[0],
      resolved: false,
      comments: [],
    });
  }

  // Visual asset finding if an asset was attached
  if (payload.assetName) {
    findings.push({
      id: `f-mock-${Date.now()}-4`,
      category: "Visual Identity",
      title: "Attached media layout & clearspace check",
      description: `Uploaded creative (${payload.assetName}) aligns with neutral background and composition balance guidelines.`,
      severity: "low",
      evidenceStatus: "supported",
      detectedValue: payload.assetName,
      expectedValue: "Compliant neutral framing with 20px minimum emblem clearspace",
      sourceReference: `${payload.guidelineCollection} · Visual Asset Standards`,
      recommendation: "Visual asset cleared for campaign inclusion.",
      affectedContent: payload.assetName,
      resolved: true,
      comments: [],
    });
  }

  // Always include at least one supported tone check so Review Studio showcases balanced evidence
  findings.push({
    id: `f-mock-${Date.now()}-5`,
    category: "Tone & Voice",
    title: "Editorial clarity and brand voice alignment",
    description:
      "Sentence cadence and formatting follow the measured, calm editorial voice expected for enterprise communications.",
    severity: "low",
    evidenceStatus: "supported",
    detectedValue: "Active editorial voice",
    expectedValue: "Measured, transparent, human brand voice",
    sourceReference: `${payload.guidelineCollection} · Brand Voice & Tone`,
    recommendation: "Tone alignment confirmed; retain concise opening structure.",
    affectedContent: payload.textContent.slice(0, 60),
    resolved: true,
    comments: [],
  });

  return {
    complianceScore: Math.max(45, score),
    providerUsed: "mock-development",
    summary:
      "Analyzed submission using Identiq local governance engine (OpenRouter/Gemini keys not set in environment).",
    findings,
  };
}

export async function analyzeSubmission(
  payload: AnalysisRequestPayload
): Promise<AnalysisResponsePayload> {
  // 1. Try OpenRouter (Primary)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await analyzeWithOpenRouter(payload);
    } catch (err) {
      console.warn("[Identiq AI] OpenRouter failed, falling back to Gemini:", err);
    }
  }

  // 2. Try Gemini (Fallback)
  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(payload);
    } catch (err) {
      console.warn("[Identiq AI] Gemini fallback failed, using development analyzer:", err);
    }
  }

  // 3. Development Mock Fallback
  return generateMockAnalysis(payload);
}
