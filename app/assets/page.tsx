"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileImage,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useIdentiq } from "@/components/IdentiqProvider";
import { PASTEL_SURFACE } from "@/components/ThemeTokens";
import { AssetCategory, BrandAsset, PastelTheme } from "@/lib/types";

const CATEGORIES: Array<"All" | AssetCategory> = [
  "All",
  "Logos",
  "Brand Images",
  "Marketing Assets",
  "Icons & Marks",
];

export default function AssetLibraryPage() {
  const { assets, addAsset, deleteAsset, notify } = useIdentiq();

  const [selectedCategory, setSelectedCategory] = useState<"All" | AssetCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload state
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState<AssetCategory>("Brand Images");
  const [assetNote, setAssetNote] = useState("");
  const [assetPreviewData, setAssetPreviewData] = useState<string | undefined>(undefined);
  const [assetFormat, setAssetFormat] = useState("PNG");
  const [uploadError, setUploadError] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const catMatch = selectedCategory === "All" || asset.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        asset.name.toLowerCase().includes(q) ||
        asset.usageNote.toLowerCase().includes(q) ||
        asset.format.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [assets, selectedCategory, searchQuery]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (!assetName.trim()) {
      setAssetName(file.name.replace(/\.[^/.]+$/, ""));
    }
    const ext = file.name.split(".").pop()?.toUpperCase() || "IMAGE";
    setAssetFormat(ext);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAssetPreviewData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      setUploadError("Please enter an asset title.");
      return;
    }

    const tones: PastelTheme[] = ["pink", "peach", "lavender", "mint", "blue", "yellow"];
    const nextAsset: BrandAsset = {
      id: `ast-${Date.now()}`,
      name: assetName.trim(),
      category: assetCategory,
      format: assetFormat,
      dimensions: assetPreviewData ? "Custom Upload" : "Vector",
      status: "Approved",
      previewUrl: assetPreviewData,
      colorTone: tones[assets.length % tones.length],
      usageNote:
        assetNote.trim() ||
        "Uploaded to Identiq Asset Library. Maintain minimum 20px safe margin.",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    addAsset(nextAsset);
    setUploadOpen(false);
    setAssetName("");
    setAssetNote("");
    setAssetPreviewData(undefined);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#6B6560] mb-1 tabular-nums">
            {assets.length} visual resources · Approved logos, photography, and marks
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#141414]">
            Asset Library
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141414] text-white hover:bg-[#2A2A2A] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload Asset
        </button>
      </div>

      {/* Category Filter + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-[#141414] text-white border-[#141414]"
                    : "bg-white text-[#3F3B37] border-[#E7E1DA] hover:bg-[#F3EDE8]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand assets..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#E7E1DA] text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
          />
        </div>
      </div>

      {/* Asset Cards Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white border border-[#E7E1DA] rounded-[22px] p-10 text-center">
          <FileImage className="w-8 h-8 text-[#8E8780] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#141414]">No matching brand assets</p>
          <p className="text-xs text-[#6B6560] mt-1 mb-4">
            Adjust category filters or upload a new approved visual resource.
          </p>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2 rounded-full bg-[#141414] text-white text-xs font-semibold"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const tone = PASTEL_SURFACE[asset.colorTone];
            const isApproved = asset.status === "Approved";
            return (
              <div
                key={asset.id}
                className="bg-white border border-[#E7E1DA] rounded-[24px] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Asset Visual Frame */}
                  <button
                    type="button"
                    onClick={() => setPreviewAsset(asset)}
                    className={`w-full aspect-[4/3] ${tone.bg} relative flex items-center justify-center overflow-hidden group`}
                  >
                    {asset.previewUrl ? (
                      <img
                        src={asset.previewUrl}
                        alt={asset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                          <ShieldCheck className="w-7 h-7 text-[#141414]" />
                        </div>
                        <span className="text-xs font-bold text-[#141414] tracking-tight">
                          {asset.name}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold text-[#141414] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3 h-3" />
                      Preview
                    </span>
                  </button>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="text-[#6B6560]">
                        {asset.category} · {asset.format}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isApproved ? "text-[#166534]" : "text-[#92400E]"
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {asset.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#141414] mb-1.5">{asset.name}</h3>
                    <p className="text-xs text-[#524E4A] leading-relaxed line-clamp-2">
                      {asset.usageNote}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-[#F0ECE7] flex items-center justify-between text-xs text-[#6B6560]">
                  <span className="font-mono tabular-nums">{asset.dimensions}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      className="text-xs font-semibold text-[#141414] hover:underline"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAsset(asset.id)}
                      aria-label={`Remove ${asset.name}`}
                      className="text-[#991B1B] hover:opacity-75 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-white border border-[#E7E1DA] rounded-[26px] max-w-xl w-full overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1DA]">
              <div>
                <p className="text-xs text-[#6B6560]">
                  {previewAsset.category} · {previewAsset.format} · {previewAsset.dimensions}
                </p>
                <h2 className="text-base font-bold text-[#141414]">{previewAsset.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                aria-label="Close preview"
                className="p-1.5 rounded-lg hover:bg-[#FAF8F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF8F6] p-6 flex items-center justify-center">
              {previewAsset.previewUrl ? (
                <img
                  src={previewAsset.previewUrl}
                  alt={previewAsset.name}
                  referrerPolicy="no-referrer"
                  className="max-h-72 rounded-2xl object-contain"
                />
              ) : (
                <div className="w-full h-56 rounded-2xl bg-[#E2DBFB] flex flex-col items-center justify-center gap-2">
                  <ShieldCheck className="w-10 h-10 text-[#141414]" />
                  <p className="text-sm font-bold text-[#141414]">{previewAsset.name}</p>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#6B6560] mb-1">Approved Usage Guidance</p>
                <p className="text-sm text-[#141414] leading-relaxed">{previewAsset.usageNote}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#6B6560] tabular-nums">
                  Updated {previewAsset.updatedAt}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(previewAsset.name);
                    notify("Asset reference copied to clipboard");
                  }}
                  className="px-4 py-2 rounded-full bg-[#141414] text-white text-xs font-semibold"
                >
                  Copy Asset Reference
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="bg-white border border-[#E7E1DA] rounded-[26px] max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#141414]">Upload Brand Asset</h2>
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                aria-label="Close upload modal"
                className="p-1.5 rounded-lg hover:bg-[#FAF8F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <p className="text-xs text-[#991B1B] bg-[#F6D5DA]/50 px-3 py-2 rounded-xl">
                  {uploadError}
                </p>
              )}

              <label className="block border-2 border-dashed border-[#DED6CE] hover:border-[#141414] rounded-2xl p-6 text-center cursor-pointer bg-[#FAF8F6] transition-colors">
                <Upload className="w-6 h-6 text-[#524E4A] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#141414]">
                  Select an image, logo SVG, or marketing creative
                </p>
                <p className="text-[11px] text-[#6B6560] mt-1">PNG, JPG, WEBP, SVG supported</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFilePick}
                  className="hidden"
                />
                {assetPreviewData && (
                  <img
                    src={assetPreviewData}
                    alt="Selected asset preview"
                    className="mt-4 max-h-32 mx-auto rounded-xl object-contain"
                  />
                )}
              </label>

              <div>
                <label className="block text-xs font-semibold text-[#3F3B37] mb-1">
                  Asset Title
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g., Holiday Campaign Primary Banner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#141414]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3F3B37] mb-1">
                  Category
                </label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F6] text-xs text-[#141414]"
                >
                  <option value="Logos">Logos</option>
                  <option value="Brand Images">Brand Images</option>
                  <option value="Marketing Assets">Marketing Assets</option>
                  <option value="Icons & Marks">Icons & Marks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3F3B37] mb-1">
                  Usage Policy Note
                </label>
                <textarea
                  rows={2}
                  value={assetNote}
                  onChange={(e) => setAssetNote(e.target.value)}
                  placeholder="Clearspace, channel restrictions, or approved crop instructions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E1DA] text-xs text-[#141414]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E7E1DA] text-xs font-semibold text-[#3F3B37]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#141414] text-white text-xs font-semibold"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
