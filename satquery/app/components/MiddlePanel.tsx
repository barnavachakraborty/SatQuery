"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FolderOpen,
  Sparkles,
  Send,
  Layers,
  Sliders,
  Radio,
  ArrowRight,
} from "lucide-react";
import { SarDataset } from "../types";

interface MiddlePanelProps {
  currentDataset: SarDataset;
  allDatasets: SarDataset[];
  onSelectDataset: (dataset: SarDataset) => void;
  promptText: string;
  onPromptChange: (text: string) => void;
  onExecuteQuery: () => void;
  isAnalyzing: boolean;
  onCustomImageUpload: (file: File) => void;
}

export const MiddlePanel: React.FC<MiddlePanelProps> = ({
  currentDataset,
  allDatasets,
  onSelectDataset,
  promptText,
  onPromptChange,
  onExecuteQuery,
  isAnalyzing,
  onCustomImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCustomImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onCustomImageUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f4ee] border-r border-[#ded6c5] overflow-y-auto select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ded6c5] bg-[#f7f4ee] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#b24316]" />
          <h2 className="text-sm font-semibold text-[#232220] font-claude">
            SAR Ingestion & Prompt
          </h2>
        </div>
        <div className="flex items-center gap-2 font-ui">
          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#ffffff] text-[#5f5b55] border border-[#ded6c5] flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-[#b24316]" />
            Umbra X-SAR
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#fbeee8] text-[#b24316] border border-[#f2cdbc]">
            0.5m GSD
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Section 1: Browse / Input Images */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-[#b24316]" />
              <h3 className="text-xs font-semibold text-[#232220] font-claude uppercase tracking-wider">
                1. Browse & Input SAR Imagery
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-[#ede7dc] p-0.5 rounded-sm border border-[#ded6c5] text-[11px] font-ui">
              <button
                onClick={() => setActiveTab("presets")}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  activeTab === "presets"
                    ? "bg-[#b24316] text-[#ffffff] font-medium"
                    : "text-[#5f5b55] hover:text-[#232220]"
                }`}
              >
                Preloaded (13)
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  activeTab === "custom"
                    ? "bg-[#b24316] text-[#ffffff] font-medium"
                    : "text-[#5f5b55] hover:text-[#232220]"
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {activeTab === "custom" ? (
            /* Upload / Browse Drag & Drop Area */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-sm p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? "border-[#b24316] bg-[#fbeee8]"
                  : "border-[#ded6c5] hover:border-[#b24316] bg-[#ffffff]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".tif,.tiff,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-8 h-8 rounded-sm bg-[#f7f4ee] border border-[#ded6c5] flex items-center justify-center text-[#b24316]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#232220] font-claude">
                  Click to Browse or Drag & Drop SAR Image
                </p>
                <p className="text-[10px] text-[#8c867c] font-ui mt-0.5">
                  Supports GeoTIFF (.tif, .tiff), WebP, PNG, JPEG
                </p>
              </div>
              <div className="text-[10px] text-[#b24316] bg-[#fbeee8] px-2 py-0.5 rounded-sm border border-[#f2cdbc] font-mono">
                @E:\projects\SatQuery Ai\GeoTIFF_TIFF_Images
              </div>
            </div>
          ) : (
            /* Preloaded Benchmark Carousel */
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#5f5b55] font-ui">
                <span>Select from preloaded GeoTIFF scenes:</span>
                <span className="text-[#b24316] font-mono font-medium">{allDatasets.length} Available</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-0.5">
                {allDatasets.map((ds) => {
                  const isSelected = ds.id === currentDataset.id;
                  return (
                    <button
                      key={ds.id}
                      onClick={() => onSelectDataset(ds)}
                      className={`text-left rounded-sm p-1.5 border transition-colors flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#ffffff] border-[#b24316] shadow-sm"
                          : "bg-[#ffffff] border-[#ded6c5] hover:border-[#cac0ac]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full mb-1">
                        <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded-sm bg-[#f7f4ee] text-[#5f5b55] border border-[#ded6c5] truncate">
                          {ds.location.split("/")[0]}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b24316] flex-shrink-0" />
                        )}
                      </div>
                      <div className="w-full h-12 rounded-sm overflow-hidden relative mb-1 bg-[#ede7dc] border border-[#ded6c5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ds.imageSrc}
                          alt={ds.title}
                          className="w-full h-full object-cover filter contrast-125"
                        />
                      </div>
                      <p
                        className={`text-[10px] leading-tight truncate font-claude ${
                          isSelected ? "text-[#232220] font-bold" : "text-[#474440]"
                        }`}
                      >
                        {ds.title.split("&")[0].split("•")[0]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected SAR Image Flat Card */}
        <div className="rounded-sm border border-[#ded6c5] bg-[#ffffff] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#ded6c5] bg-[#fbf9f5]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b24316] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#232220] font-claude truncate">
                {currentDataset.title}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#b24316] bg-[#fbeee8] border border-[#f2cdbc] px-2 py-0.5 rounded-sm flex-shrink-0">
              {currentDataset.fileSize}
            </span>
          </div>

          <div className="relative bg-[#ede7dc] h-52 sm:h-56 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentDataset.imageSrc}
              alt={currentDataset.title}
              className="w-full h-full object-cover filter contrast-125"
            />
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 font-ui">
              <span className="bg-[#ffffff]/90 border border-[#ded6c5] px-2 py-0.5 rounded-sm text-[9px] text-[#232220]">
                {currentDataset.sensor}
              </span>
              <span className="bg-[#ffffff]/90 border border-[#b24316]/40 px-2 py-0.5 rounded-sm text-[9px] text-[#b24316] font-medium">
                {currentDataset.polarization}
              </span>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className="bg-[#ffffff]/95 border border-[#ded6c5] px-2 py-0.5 rounded-sm text-[9px] font-mono text-[#232220]">
                {currentDataset.coordinates.lat} | {currentDataset.coordinates.lon}
              </span>
            </div>
          </div>

          {/* Specs Flat Strip */}
          <div className="grid grid-cols-3 divide-x divide-[#ded6c5] text-[9px] font-mono bg-[#fbf9f5] text-[#5f5b55] py-1.5 px-2 border-t border-[#ded6c5]">
            <div className="px-1 truncate">
              <span>Mode: </span>
              <span className="text-[#232220] font-medium">{currentDataset.mode}</span>
            </div>
            <div className="px-1 truncate">
              <span>Freq: </span>
              <span className="text-[#232220] font-medium">{currentDataset.frequency}</span>
            </div>
            <div className="px-1 truncate">
              <span>File: </span>
              <span className="text-[#232220] font-medium">{currentDataset.filename}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Multimodal Prompt & Questions */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#b24316]" />
              <h3 className="text-xs font-semibold text-[#232220] font-claude uppercase tracking-wider">
                2. Ask Question on SAR Imagery
              </h3>
            </div>
            <span className="text-[10px] text-[#8c867c] font-mono">
              InSAR Multimodal
            </span>
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#5f5b55] font-ui">Suggested queries:</span>
            <div className="flex flex-wrap gap-1">
              {currentDataset.suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onPromptChange(prompt)}
                  className="text-left text-[11px] font-claude px-2.5 py-1 rounded-sm bg-[#ffffff] border border-[#ded6c5] hover:border-[#b24316] text-[#474440] hover:text-[#232220] transition-colors line-clamp-1 shadow-2xs"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Flat Prompt Textarea */}
          <div className="rounded-sm border border-[#ded6c5] bg-[#ffffff] focus-within:border-[#b24316] transition-colors shadow-2xs">
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Ask a question about this SAR tile..."
              className="w-full p-2.5 text-xs font-claude bg-transparent text-[#232220] placeholder-[#8c867c] resize-none focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-[#ded6c5] bg-[#fbf9f5] text-[10px] font-ui">
              <div className="flex items-center gap-1.5 text-[#5f5b55]">
                <Sliders className="w-3 h-3 text-[#b24316]" />
                <span>Multi-look Speckle Filter Active</span>
              </div>
              <span className="text-[#8c867c] font-mono">
                {promptText.length} chars
              </span>
            </div>
          </div>

          {/* Flat Rust Action Button */}
          <button
            onClick={onExecuteQuery}
            disabled={isAnalyzing}
            className={`w-full py-2.5 px-4 rounded-sm font-ui font-medium text-xs transition-colors flex items-center justify-center gap-2 ${
              isAnalyzing
                ? "bg-[#fbeee8] border border-[#b24316] text-[#b24316] cursor-wait"
                : "bg-[#b24316] hover:bg-[#98350d] text-[#ffffff] border border-[#b24316] shadow-sm"
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#b24316] border-t-transparent rounded-full animate-spin" />
                <span>Processing Multi-look SAR InSAR Backscatter...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute SatQuery Analysis</span>
                <ArrowRight className="w-3 h-3 ml-0.5 opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
