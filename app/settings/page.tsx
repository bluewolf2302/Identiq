"use client";

import React, { useState } from "react";
import { CheckCircle2, Database, RefreshCw, ShieldCheck } from "lucide-react";
import { useIdentiq } from "@/components/IdentiqProvider";

export default function SettingsPage() {
  const { settings, updateSettings, resetDemoWorkspace } = useIdentiq();

  const [reviewerName, setReviewerName] = useState(settings.reviewerName);
  const [reviewerRole, setReviewerRole] = useState(settings.reviewerRole);
  const [autoFlagUnverified, setAutoFlagUnverified] = useState(settings.autoFlagUnverified);
  const [strictClaimsMode, setStrictClaimsMode] = useState(settings.strictClaimsMode);
  const [minimumApprovalScore, setMinimumApprovalScore] = useState(
    settings.minimumApprovalScore
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      reviewerName: reviewerName.trim() || "Maya Lin",
      reviewerRole: reviewerRole.trim() || "Brand Governance Lead",
      autoFlagUnverified,
      strictClaimsMode,
      minimumApprovalScore,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div>
        <p className="text-xs font-medium text-[#6B6560] mb-1">
          Workspace Preferences & Integration Architecture
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#141414]">Settings</h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-[#E7E1DA] rounded-[26px] p-6 space-y-6"
      >
        <h2 className="text-base font-bold text-[#141414]">Reviewer Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3F3B37] mb-1.5">
              Active Reviewer Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F6] text-sm text-[#141414]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3F3B37] mb-1.5">
              Governance Role
            </label>
            <input
              type="text"
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F6] text-sm text-[#141414]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#EFECE7] space-y-4">
          <h2 className="text-base font-bold text-[#141414]">Evidence & Approval Policies</h2>

          <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F6] border border-[#E7E1DA] cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[#141414]">
                Preserve Unverified vs. Conflicting Distinction
              </p>
              <p className="text-xs text-[#6B6560] mt-0.5">
                Flag claims lacking supporting Brand Knowledge Hub evidence as unverified rather than false.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoFlagUnverified}
              onChange={(e) => setAutoFlagUnverified(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#141414]"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F6] border border-[#E7E1DA] cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[#141414]">
                Strict Substantiated Claims Mode
              </p>
              <p className="text-xs text-[#6B6560] mt-0.5">
                Automatically assign High Severity to absolute guarantees or prohibited terminology.
              </p>
            </div>
            <input
              type="checkbox"
              checked={strictClaimsMode}
              onChange={(e) => setStrictClaimsMode(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#141414]"
            />
          </label>

          <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E7E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#141414]">
                Minimum Recommended Approval Score
              </p>
              <p className="text-xs text-[#6B6560]">
                Target compliance score threshold for fast-track approval.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={60}
                max={95}
                value={minimumApprovalScore}
                onChange={(e) => setMinimumApprovalScore(Number(e.target.value))}
                className="accent-[#141414]"
              />
              <span className="font-mono tabular-nums text-sm font-bold text-[#141414] w-10">
                {minimumApprovalScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-[#2B2B2B]"
          >
            Save Governance Settings
          </button>
        </div>
      </form>

      {/* Integration Boundaries Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#DDF0FA]/70 border border-[#CBE2EF] rounded-[24px] p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#141414]">
            <ShieldCheck className="w-4 h-4" />
            Server-Side AI Pipeline
          </div>
          <p className="text-xs text-[#3F3B37] leading-relaxed">
            Routed through <span className="font-mono">/api/analyze</span> with OpenRouter as primary provider, Gemini (<span className="font-mono">@google/genai</span>) as fallback, and structured output validation. Keys remain strictly server-side.
          </p>
          <p className="text-xs font-semibold text-[#14532D] inline-flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mock & Live Pipeline Ready
          </p>
        </div>

        <div className="bg-[#CDEEE0]/70 border border-[#BAE0D0] rounded-[24px] p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#141414]">
            <Database className="w-4 h-4" />
            Supabase Integration Boundary
          </div>
          <p className="text-xs text-[#3F3B37] leading-relaxed">
            Workspace mutations persist locally in browser storage for immediate demo reliability and are abstracted in <span className="font-mono">lib/supabase/client.ts</span> for PostgreSQL, Auth, and Storage wiring.
          </p>
          <button
            type="button"
            onClick={resetDemoWorkspace}
            className="inline-flex items-center gap-1.5 mt-1 px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#141414] hover:bg-[#FAF8F6]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Workspace Data
          </button>
        </div>
      </div>
    </div>
  );
}
