import { EvidenceStatus, FindingSeverity, PastelTheme, ReviewStatus } from "@/lib/types";

export const PASTEL_SURFACE: Record<
  PastelTheme,
  { bg: string; border: string; iconBg: string }
> = {
  pink: {
    bg: "bg-[#F6D5DA]",
    border: "border-[#EBC3CA]",
    iconBg: "bg-white",
  },
  peach: {
    bg: "bg-[#F9DEC0]",
    border: "border-[#EDD0AF]",
    iconBg: "bg-white",
  },
  lavender: {
    bg: "bg-[#E2DBFB]",
    border: "border-[#D3CAEE]",
    iconBg: "bg-white",
  },
  mint: {
    bg: "bg-[#CDEEE0]",
    border: "border-[#BAE0D0]",
    iconBg: "bg-white",
  },
  blue: {
    bg: "bg-[#DDF0FA]",
    border: "border-[#CBE2EF]",
    iconBg: "bg-white",
  },
  yellow: {
    bg: "bg-[#FAF0C8]",
    border: "border-[#EDE1B4]",
    iconBg: "bg-white",
  },
};

export const EVIDENCE_STYLE: Record<
  EvidenceStatus,
  { label: string; cardBg: string; cardBorder: string; textClass: string }
> = {
  supported: {
    label: "Supported by Evidence",
    cardBg: "bg-[#DDF0FA]",
    cardBorder: "border-[#C4E1F0]",
    textClass: "text-[#0F5132]",
  },
  conflicting: {
    label: "Conflicting Evidence",
    cardBg: "bg-[#F6D5DA]",
    cardBorder: "border-[#E9BEC6]",
    textClass: "text-[#842029]",
  },
  unverified: {
    label: "Unverified (No Record Found)",
    cardBg: "bg-[#FAF0C8]",
    cardBorder: "border-[#EADBA3]",
    textClass: "text-[#664D03]",
  },
};

export const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  high: "High Severity",
  medium: "Medium Severity",
  low: "Low Severity",
};

export const REVIEW_STATUS_META: Record<
  ReviewStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  Approved: {
    label: "Approved",
    dotColor: "text-[#16A34A]",
    textColor: "text-[#14532D]",
  },
  "Pending Approval": {
    label: "Pending Approval",
    dotColor: "text-[#D97706]",
    textColor: "text-[#78350F]",
  },
  "In Review": {
    label: "In Review",
    dotColor: "text-[#2563EB]",
    textColor: "text-[#1E3A8A]",
  },
  "Changes Requested": {
    label: "Changes Requested",
    dotColor: "text-[#DC2626]",
    textColor: "text-[#7F1D1D]",
  },
};
