import assert from "node:assert/strict";
import test from "node:test";

import { BrandContextService, MockBrandKnowledgeRepository, teraluneKnowledge } from "../lib/brand-context";
import { AnalysisOrchestrator } from "../lib/analysis";
import type { ReviewFinding } from "../lib/contracts";
import { DeterministicTextGovernanceEngine } from "../lib/governance";

const advertisementText =
  "TERALUNE®\nSPRING WATER | REFRESHMENT, NATURALLY.\n50% OFF TODAY!\nThe water that make you feel invincible!!!\nOur spring water keep you fresh and improves your immunity instantly.\nTERALUNE NATURAL SPRING WATER\n500ml\n+\nCURES TIREDNESS\n+\nBOOSTS IMMUNITY\n+\nDETOX YOUR BODY\nSPECIAL PRICE ₹19\n500ml BOTTLE\nBUY NOW!!!\n100% PURE • CLINICALLY PROVEN • CARBON NEUTRAL\nVisit www.teralune.example for more information\nRefreshment, Naturally. | Limited time offer!!!";

const evidence = (excerpt: string) => ({
  sourceId: "SRC-CLAIM-01",
  sourceType: "approved_brand_knowledge",
  sourceTitle: "Teralune Approved Marketing Claims (fictional)",
  excerpt,
  pageNumber: 4,
  section: "Approved claims and fact verification",
  versionId: "1.0",
});

function semanticFinding(
  findingId: string,
  issue: string,
  status: ReviewFinding["status"],
  severity: ReviewFinding["severity"],
  excerpt: string,
): ReviewFinding {
  return {
    findingId,
    category: issue.includes("grammar")
      ? "TONE_AND_TERMINOLOGY"
      : issue.includes("urgency")
        ? "TONE_AND_TERMINOLOGY"
        : "PROMOTIONAL_CLAIM",
    severity,
    status,
    issue,
    description: `Teralune semantic review: ${issue}.`,
    explanation: "The submitted advertisement is unsupported by the approved Teralune guide.",
    detectedValue: excerpt,
    expectedValue: "Use only approved Teralune wording or provide approved evidence.",
    evidenceReferences: [evidence(excerpt)],
    suggestedCorrection: "Remove the unsupported wording or provide an approved evidence record.",
    analysisProvider: "fake-teralune-ai",
  };
}

test("retrieves isolated Teralune identity and source register", async () => {
  const service = new BrandContextService(new MockBrandKnowledgeRepository());
  const result = await service.getForSubmission({
    brandId: "demo-brand-teralune",
    submissionId: "teralune-ad-1",
  });

  assert.equal(result.context.brandProfile.includes("Teralune"), true);
  assert.equal(result.context.brandProfile.includes("Sample Organisation"), false);
  assert.deepEqual(result.context.sourceIds.sort(), [
    "SRC-ASSET-01",
    "SRC-BRAND-01",
    "SRC-CLAIM-01",
    "SRC-PROD-01",
  ]);
  assert.equal(result.context.versionId, "1.0");
  assert.equal(result.context.approvedProductFacts.some((fact) => fact.includes("₹25")), true);
  assert.equal(result.context.sourceVersionInformation.includes("page 3"), true);
});

test("deterministic Teralune checks find trademark, unit and price conflicts", async () => {
  const service = new BrandContextService(new MockBrandKnowledgeRepository());
  const result = await service.getForSubmission({ brandId: "demo-brand-teralune" });
  const findings = new DeterministicTextGovernanceEngine().analyze({
    content: advertisementText,
    brandContext: result.context,
  }).findings;

  assert.equal(findings.some((finding) => finding.issue.includes("Teralune®")), true);
  assert.equal(findings.some((finding) => finding.issue.includes("500ml")), true);
  assert.equal(
    findings.some(
      (finding) =>
        finding.category === "FACT_VERIFICATION" &&
        finding.status === "CONFLICTING" &&
        finding.expectedValue?.includes("₹25"),
    ),
    true,
  );
  assert.equal(findings.some((finding) => finding.location?.startOffset !== undefined), true);
  assert.equal(findings.some((finding) => finding.evidenceReferences.some((ref) => ref.sourceId === "SRC-PROD-01")), true);
});

test("orchestration keeps unsupported claims unverified and leaves visuals pending", async () => {
  const service = new BrandContextService(new MockBrandKnowledgeRepository());
  const deterministic = new DeterministicTextGovernanceEngine();
  const orchestrator = new AnalysisOrchestrator({
    brandContextService: service,
    deterministicEngine: deterministic,
    aiAnalysisService: {
      analyze: async () => ({
        providerUsed: "fake-teralune-ai",
        fallbackUsed: false,
        findings: [
          semanticFinding("health", "unsupported health claims", "UNVERIFIED", "HIGH", "BOOSTS IMMUNITY"),
          semanticFinding("purity", "unsupported purity claim", "UNVERIFIED", "HIGH", "100% PURE"),
          semanticFinding("clinical", "unsupported clinical claim", "UNVERIFIED", "HIGH", "CLINICALLY PROVEN"),
          semanticFinding("environment", "unsupported environmental claim", "UNVERIFIED", "HIGH", "CARBON NEUTRAL"),
          semanticFinding("grammar", "subject-verb agreement grammar error", "CONFLICTING", "MEDIUM", "water that make"),
          semanticFinding("urgency", "aggressive urgency", "UNVERIFIED", "MEDIUM", "BUY NOW!!!"),
        ],
      }),
    },
    createAnalysisRunId: () => "teralune-run-1",
    now: () => new Date("2026-01-02T03:04:05.000Z"),
  });

  const response = await orchestrator.analyze({
    submissionId: "teralune-ad-1",
    brandId: "demo-brand-teralune",
    campaignName: "Teralune test advertisement",
    contentText: advertisementText,
  });

  assert.equal(response.analysisStatus, "COMPLETED");
  assert.equal(response.findings.some((finding) => finding.status === "UNVERIFIED"), true);
  assert.equal(response.findings.some((finding) => finding.issue.includes("health")), true);
  assert.equal(response.findings.some((finding) => finding.issue.includes("purity")), true);
  assert.equal(response.findings.some((finding) => finding.issue.includes("clinical")), true);
  assert.equal(response.findings.some((finding) => finding.issue.includes("environmental")), true);
  assert.equal(response.findings.some((finding) => finding.issue.includes("grammar")), true);
  assert.equal(response.findings.some((finding) => finding.issue.includes("urgency")), true);
  assert.equal(response.findings.some((finding) => finding.category === "VISUAL_COMPLIANCE"), false);
  assert.equal(
    response.findings.every((finding) =>
      finding.evidenceReferences.every((reference) => reference.sourceId !== "mock-brand-guidelines-v1"),
    ),
    true,
  );
  assert.equal(response.findings.every((finding) => finding.evidenceReferences.every((reference) => reference.versionId === "1.0")), true);
});

test("generic brand-001 remains separate from Teralune", async () => {
  const repository = new MockBrandKnowledgeRepository();
  const sample = await repository.getBrandKnowledge({ brandId: "brand-001" });
  const teralune = await repository.getBrandKnowledge({ brandId: "demo-brand-teralune" });

  assert.equal(sample?.profile.brandName, "Sample Organisation");
  assert.equal(teralune?.profile.brandName, "Teralune");
  assert.notDeepEqual(sample, teralune);
  assert.equal(teraluneKnowledge.profile.brandId, "demo-brand-teralune");
});
