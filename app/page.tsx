"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Layers,
  Megaphone,
  Newspaper,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useIdentiq } from "@/components/IdentiqProvider";
import { PASTEL_SURFACE, REVIEW_STATUS_META } from "@/components/ThemeTokens";
import { MONTHLY_COMPLIANCE_CHART } from "@/lib/seed-data";
import { ContentType } from "@/lib/types";

const CONTENT_FILTERS: Array<{
  label: string;
  value: "All" | ContentType;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { label: "All", value: "All", icon: Layers },
  { label: "Campaign Copy", value: "Campaign Copy", icon: Megaphone },
  { label: "Social Creative", value: "Social Creative", icon: Sparkles },
  { label: "Product Sheet", value: "Product Sheet", icon: FileText },
  { label: "Press Release", value: "Press Release", icon: Newspaper },
];

export default function DashboardPage() {
  const router = useRouter();
  const { reviews, activities, knowledge, settings, setActiveReviewId } = useIdentiq();
  const [selectedFilter, setSelectedFilter] = useState<"All" | ContentType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("Nov");

  const stats = useMemo(() => {
    const total = reviews.length;
    const completed = reviews.filter((r) => r.status === "Approved").length;
    const awaitingApproval = reviews.filter(
      (r) => r.status === "Pending Approval" || r.status === "In Review"
    ).length;
    const openIssues = reviews.reduce(
      (acc, r) => acc + r.findings.filter((f) => !f.resolved).length,
      0
    );
    const avgCompliance =
      total > 0
        ? Math.round(reviews.reduce((sum, r) => sum + r.complianceScore, 0) / total)
        : 100;

    return { total, completed, awaitingApproval, openIssues, avgCompliance };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesCategory =
        selectedFilter === "All" || r.contentType === selectedFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.guidelineCollection.toLowerCase().includes(q) ||
        r.submittedBy.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [reviews, selectedFilter, searchQuery]);

  const openInStudio = (reviewId: string) => {
    setActiveReviewId(reviewId);
    router.push(`/studio?id=${reviewId}`);
  };

  const approvedKnowledgeCount = knowledge.filter((k) => k.status === "Approved").length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col xl:flex-row gap-7 items-start">
        {/* Main Left / Center Editorial Workspace (Reference 1) */}
        <div className="flex-1 min-w-0 w-full space-y-7">
          {/* Welcome Header + Primary CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#6B6560] mb-1.5">
                Identiq Governance Overview · {approvedKnowledgeCount} active brand rules
              </p>
              <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight leading-[1.12] text-[#141414] max-w-xl text-balance">
                Govern your brand with verified evidence
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/reviews/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141414] text-white hover:bg-[#2B2B2B] text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Start New Review
              </Link>
            </div>
          </div>

          {/* Search & Content-Type Segmented Filter Bar (Reference 1 style) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CONTENT_FILTERS.map((f) => {
                const Icon = f.icon;
                const active = selectedFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setSelectedFilter(f.value)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 border ${
                      active
                        ? "bg-[#141414] text-white border-[#141414]"
                        : "bg-white text-[#3F3B37] border-[#E7E1DA] hover:bg-[#F3EDE8]"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        active ? "bg-white/15 text-white" : "bg-[#FAF8F6] text-[#141414]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-60 shrink-0">
              <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter submissions..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#E7E1DA] text-xs text-[#141414] placeholder:text-[#8E8780] focus:outline-none focus:border-[#141414]"
              />
            </div>
          </div>

          {/* Compliance KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-[#E7E1DA] rounded-2xl p-4">
              <p className="text-xs text-[#6B6560] mb-1">Brand Compliance</p>
              <p className="text-2xl font-bold text-[#141414] tabular-nums">
                {stats.avgCompliance}%
              </p>
              <p className="text-[11px] text-[#524E4A] mt-1">Across {stats.total} active reviews</p>
            </div>
            <div className="bg-[#CDEEE0]/55 border border-[#BAE0D0] rounded-2xl p-4">
              <p className="text-xs text-[#3F5E50] mb-1">Reviews Completed</p>
              <p className="text-2xl font-bold text-[#141414] tabular-nums">
                {stats.completed}
              </p>
              <p className="text-[11px] text-[#3F5E50] mt-1">Approved for release</p>
            </div>
            <div className="bg-[#FAF0C8]/65 border border-[#EDE1B4] rounded-2xl p-4">
              <p className="text-xs text-[#5E5225] mb-1">Awaiting Approval</p>
              <p className="text-2xl font-bold text-[#141414] tabular-nums">
                {stats.awaitingApproval}
              </p>
              <p className="text-[11px] text-[#5E5225] mt-1">Queued in Review Studio</p>
            </div>
            <div className="bg-[#F6D5DA]/60 border border-[#EBC3CA] rounded-2xl p-4">
              <p className="text-xs text-[#692E38] mb-1">Issues Detected</p>
              <p className="text-2xl font-bold text-[#141414] tabular-nums">
                {stats.openIssues}
              </p>
              <p className="text-[11px] text-[#692E38] mt-1">Open findings to resolve</p>
            </div>
          </div>

          {/* Recent Submissions Grid (Reference 1 Pastel Cards) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#141414]">Recent Submissions</h2>
              <Link
                href="/approvals"
                className="text-xs font-medium text-[#524E4A] hover:text-[#141414] inline-flex items-center gap-1"
              >
                View approval queue
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="bg-white border border-[#E7E1DA] rounded-[22px] p-8 text-center">
                <Filter className="w-7 h-7 text-[#8E8780] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#141414]">
                  No submissions match your filter
                </p>
                <p className="text-xs text-[#6B6560] mt-1 mb-4">
                  Clear the search filter or start a new multimodal brand review.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter("All");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-full bg-[#141414] text-white text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map((review, index) => {
                  const surface = PASTEL_SURFACE[review.pastelTheme];
                  const openCount = review.findings.filter((f) => !f.resolved).length;
                  const statusMeta = REVIEW_STATUS_META[review.status];
                  return (
                    <motion.button
                      key={review.id}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: index * 0.03 }}
                      onClick={() => openInStudio(review.id)}
                      className={`text-left w-full ${surface.bg} border ${surface.border} rounded-[22px] p-5 hover:brightness-[0.985] transition-all flex flex-col justify-between min-h-[172px]`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-8 h-8 rounded-xl ${surface.iconBg} flex items-center justify-center shrink-0 text-[#141414]`}
                            >
                              <FileText className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-medium text-[#3F3B37] truncate">
                              {review.contentType}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-white/85 text-[11px] font-semibold text-[#141414] tabular-nums shrink-0">
                            {review.complianceScore}% Score
                          </span>
                        </div>

                        <h3 className="text-[17px] font-bold text-[#141414] leading-snug mb-2">
                          {review.title}
                        </h3>
                        <p className="text-xs text-[#3F3B37] line-clamp-2 leading-relaxed">
                          {review.textContent}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-black/8 text-xs text-[#3F3B37]">
                        <span className="truncate">
                          {review.submittedBy} ·{" "}
                          <span className="tabular-nums font-medium">
                            {openCount} open {openCount === 1 ? "issue" : "issues"}
                          </span>
                        </span>
                        <span className={`font-semibold shrink-0 ${statusMeta.textColor}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Summary, Compliance Chart & Activity Panel (Reference 1 inspired) */}
        <aside className="w-full xl:w-[348px] shrink-0 bg-[#F3EDE8] border border-[#E7E1DA] rounded-[28px] p-5 space-y-5">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/activity"
              aria-label="View governance notifications"
              className="w-9 h-9 rounded-full bg-white border border-[#E7E1DA] flex items-center justify-center text-[#141414] hover:bg-[#FAF8F6] transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>
            <Link
              href="/settings"
              aria-label="Open governance settings"
              className="w-9 h-9 rounded-full bg-white border border-[#E7E1DA] flex items-center justify-center text-[#141414] hover:bg-[#FAF8F6] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          <div className="text-center">
            <img
              src="/images/avatar_brand_lead.jpg"
              alt={settings.reviewerName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-white shadow-xs mb-2.5"
            />
            <h2 className="text-base font-bold text-[#141414]">{settings.reviewerName}</h2>
            <p className="text-xs text-[#6B6560]">{settings.reviewerRole}</p>
          </div>

          {/* Pending Approvals Quick Row */}
          <Link
            href="/approvals"
            className="flex items-center justify-between bg-white border border-[#E7E1DA] rounded-2xl px-4 py-3 hover:border-[#141414]/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#FAF8F6] flex items-center justify-center text-[#141414]">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-[#141414] tabular-nums">
                {stats.awaitingApproval} Pending Approvals
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6B6560]" />
          </Link>

          {/* Monthly Compliance Activity Stacked Pastel Bar Chart (Reference 1 motif) */}
          <div className="bg-white border border-[#E7E1DA] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-[#141414]">Review Activity</p>
                <p className="text-[11px] text-[#6B6560] mt-0.5 tabular-nums">
                  {selectedMonth} · {stats.avgCompliance}% avg score
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#524E4A]">2026</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-2">
              {MONTHLY_COMPLIANCE_CHART.map((bar) => {
                const isSelected = selectedMonth === bar.month;
                return (
                  <button
                    key={bar.month}
                    type="button"
                    onClick={() => setSelectedMonth(bar.month)}
                    className={`flex flex-col items-center justify-end h-full rounded-xl p-1 transition-all ${
                      isSelected ? "border-2 border-[#141414]" : "border border-transparent hover:bg-[#FAF8F6]"
                    }`}
                  >
                    <div className="w-full flex flex-col gap-0.5 items-stretch justify-end flex-1">
                      <div
                        className="w-full rounded-t-md bg-[#F6D5DA]"
                        style={{ height: `${Math.max(10, bar.open * 1.4)}%` }}
                      />
                      <div
                        className="w-full bg-[#E2DBFB]"
                        style={{ height: `${Math.max(14, bar.resolved * 0.9)}%` }}
                      />
                      <div
                        className="w-full rounded-b-md bg-[#CDEEE0]"
                        style={{ height: `${Math.max(24, bar.supported * 0.65)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 ${
                        isSelected
                          ? "bg-[#141414] text-white px-1.5 py-0.2 rounded-md font-semibold"
                          : "text-[#6B6560]"
                      }`}
                    >
                      {bar.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Recent Activity / Insights */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#141414]">Recent Activity</h3>
              <Link
                href="/activity"
                className="text-[11px] font-medium text-[#524E4A] hover:text-[#141414]"
              >
                All logs
              </Link>
            </div>

            <div className="space-y-2.5">
              {activities.slice(0, 3).map((act, idx) => {
                const cardColor =
                  idx === 0
                    ? "bg-[#F6D5DA] border-[#EBC3CA]"
                    : idx === 1
                    ? "bg-[#DDF0FA] border-[#CBE2EF]"
                    : "bg-[#CDEEE0] border-[#BAE0D0]";
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() =>
                      act.reviewId ? openInStudio(act.reviewId) : router.push("/activity")
                    }
                    className={`w-full text-left ${cardColor} border rounded-2xl p-3.5 hover:brightness-[0.985] transition-all`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-[#141414] flex items-center gap-1.5">
                        {act.type === "approved" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#14532D]" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-[#141414]" />
                        )}
                        {act.actor}
                      </span>
                      <span className="text-[11px] text-[#524E4A] tabular-nums">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#2B2927] leading-snug">
                      {act.action} <span className="font-semibold">{act.target}</span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
