"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FilePlus2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useIdentiq } from "@/components/IdentiqProvider";
import { REVIEW_STATUS_META } from "@/components/ThemeTokens";

export default function ActivityHistoryPage() {
  const router = useRouter();
  const { reviews, activities, setActiveReviewId } = useIdentiq();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"reviews" | "audit">("reviews");

  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.submittedBy.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [reviews, searchQuery]);

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activities.filter(
      (a) =>
        !q ||
        a.actor.toLowerCase().includes(q) ||
        a.target.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q)
    );
  }, [activities, searchQuery]);

  const openStudio = (reviewId: string) => {
    setActiveReviewId(reviewId);
    router.push(`/studio?id=${reviewId}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#6B6560] mb-1">
            Submission Records & Governance Audit Trail
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#141414]">
            Activity & History
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F3EDE8] p-1 rounded-full border border-[#E7E1DA]">
            <button
              type="button"
              onClick={() => setViewMode("reviews")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                viewMode === "reviews"
                  ? "bg-[#141414] text-white"
                  : "text-[#524E4A] hover:text-[#141414]"
              }`}
            >
              Previous Reviews
            </button>
            <button
              type="button"
              onClick={() => setViewMode("audit")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                viewMode === "audit"
                  ? "bg-[#141414] text-white"
                  : "text-[#524E4A] hover:text-[#141414]"
              }`}
            >
              Audit Timeline
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter history..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#E7E1DA] text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
            />
          </div>
        </div>
      </div>

      {viewMode === "reviews" ? (
        <div className="bg-white border border-[#E7E1DA] rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E1DA] bg-[#FAF8F6] text-[11px] font-semibold text-[#6B6560]">
                  <th className="py-3.5 px-5">Submission</th>
                  <th className="py-3.5 px-4">Type & Collection</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Compliance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE7] text-xs">
                {filteredReviews.map((rev) => {
                  const statusMeta = REVIEW_STATUS_META[rev.status];
                  return (
                    <tr key={rev.id} className="hover:bg-[#FAF8F6]/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-[#141414]">
                        {rev.title}
                      </td>
                      <td className="py-3.5 px-4 text-[#524E4A]">
                        {rev.contentType} · {rev.guidelineCollection}
                      </td>
                      <td className="py-3.5 px-4 text-[#3F3B37]">{rev.submittedBy}</td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-[#6B6560]">
                        {rev.submittedAt}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#141414]">
                        {rev.complianceScore}%
                      </td>
                      <td className={`py-3.5 px-4 font-semibold ${statusMeta.textColor}`}>
                        {statusMeta.label}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => openStudio(rev.id)}
                          className="inline-flex items-center gap-1 font-semibold text-[#141414] hover:underline"
                        >
                          Inspect
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E1DA] rounded-[24px] p-6 space-y-3">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFECE7]"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-white border border-[#E7E1DA] flex items-center justify-center shrink-0">
                  {act.type === "approved" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                  ) : act.type === "submitted" ? (
                    <FilePlus2 className="w-4 h-4 text-[#141414]" />
                  ) : act.type === "changes_requested" ? (
                    <ShieldAlert className="w-4 h-4 text-[#842029]" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#524E4A]" />
                  )}
                </span>
                <div className="text-xs">
                  <p className="text-[#141414]">
                    <span className="font-bold">{act.actor}</span> {act.action}{" "}
                    <span className="font-semibold">{act.target}</span>
                  </p>
                  <p className="text-[11px] text-[#6B6560] mt-0.5 tabular-nums">
                    {act.timestamp}
                  </p>
                </div>
              </div>

              {act.reviewId && (
                <button
                  type="button"
                  onClick={() => openStudio(act.reviewId!)}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#E7E1DA] text-xs font-semibold text-[#141414] hover:border-[#141414] self-start sm:self-center shrink-0"
                >
                  Open Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
