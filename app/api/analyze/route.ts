import { NextRequest, NextResponse } from "next/server";
import { analyzeSubmission } from "@/lib/ai/analyzer";
import { AnalysisRequestPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnalysisRequestPayload>;

    if (!body.title?.trim() || !body.textContent?.trim()) {
      return NextResponse.json(
        { error: "Submission title and copy content are required for governance review." },
        { status: 400 }
      );
    }

    const payload: AnalysisRequestPayload = {
      title: body.title.trim(),
      contentType: body.contentType || "Campaign Copy",
      guidelineCollection: body.guidelineCollection || "Aura Botanicals Global v2.4",
      textContent: body.textContent.trim(),
      assetName: body.assetName,
      assetBase64: body.assetBase64,
      assetMimeType: body.assetMimeType,
      knowledgeSummary: Array.isArray(body.knowledgeSummary) ? body.knowledgeSummary : [],
    };

    const result = await analyzeSubmission(payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/analyze] Analysis error:", error);
    return NextResponse.json(
      { error: "Unable to complete brand governance analysis." },
      { status: 500 }
    );
  }
}
