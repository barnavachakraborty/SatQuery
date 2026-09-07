"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Layers,
  FileDown,
  Copy,
  Check,
  ShieldCheck,
  Target,
  SlidersHorizontal,
} from "lucide-react";
import { SarDataset, SarViewMode, DetectionItem } from "../types";
import { ReportModal } from "./ReportModal";

interface RightPanelProps {
  dataset: SarDataset;
  userPrompt: string;
  isAnalyzing: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  dataset,
  userPrompt,
  isAnalyzing,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<SarViewMode>("detections");
  const [selectedDetection, setSelectedDetection] = useState<DetectionItem | null>(null);
  const [hoveredCoords, setHoveredCoords] = useState<{ lat: string; lon: string; db: string }>({
    lat: dataset.coordinates.lat,
    lon: dataset.coordinates.lon,
    db: "-18.2 dBσ₀",
  });
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedDetection(null);
    setHoveredCoords({
      lat: dataset.coordinates.lat,
      lon: dataset.coordinates.lon,
      db: dataset.metrics.meanBackscatter,
    });
  }, [dataset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      const latNum = parseFloat(dataset.coordinates.lat) || 1.24;
      const lonNum = parseFloat(dataset.coordinates.lon) || 103.92;
      const offsetLat = ((0.5 - relY) * 0.04).toFixed(4);
      const offsetLon = ((relX - 0.5) * 0.04).toFixed(4);

      const nearTarget = dataset.detections.some(
        (d) => Math.abs(d.x - relX * 100) < 6 && Math.abs(d.y - relY * 100) < 6
      );
      const dbVal = nearTarget
        ? `+${(16 + Math.random() * 8).toFixed(1)} dBσ₀`
        : `-${(15 + Math.random() * 8).toFixed(1)} dBσ₀`;

      setHoveredCoords({
        lat: `${latNum > 0 ? "+" : ""}${(latNum + parseFloat(offsetLat)).toFixed(4)}°`,
        lon: `${lonNum > 0 ? "+" : ""}${(lonNum + parseFloat(offsetLon)).toFixed(4)}°`,
        db: dbVal,
      });
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 6.5));
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.3, 6.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev * 0.77, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedDetection(null);
  };

  const handleCopyAnalysis = () => {
    const text = `${dataset.title}\n\nPrompt: ${userPrompt || dataset.defaultPrompt}\n\nExecutive Summary:\n${dataset.analysisFindings.executiveSummary}\n\nTarget Inventory:\n${dataset.analysisFindings.targetInventory}\n\nRadar Physics:\n${dataset.analysisFindings.radarPhysics}\n\nTactical Advisory:\n${dataset.analysisFindings.tacticalAdvisory}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f4ee] overflow-y-auto select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ded6c5] bg-[#f7f4ee] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#b24316]" />
          <h2 className="text-sm font-semibold text-[#232220] font-claude">
            Interactive SAR Region Viewer & Intelligence Output
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-ui">
          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#ffffff] text-[#5f5b55] border border-[#ded6c5] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b24316]" />
            {dataset.location}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Top Section: Interactive Map / Zoomable Photo */}
        <div className="relative rounded-sm border border-[#ded6c5] bg-[#ffffff] overflow-hidden shadow-sm">
          {/* Controls Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#ded6c5] bg-[#fbf9f5] z-10 font-ui">
            <div className="flex items-center gap-1 bg-[#ede7dc] p-0.5 rounded-sm border border-[#ded6c5] text-[11px]">
              <button
                onClick={() => setViewMode("detections")}
                className={`px-2 py-0.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  viewMode === "detections"
                    ? "bg-[#b24316] text-[#ffffff] font-medium"
                    : "text-[#5f5b55] hover:text-[#232220]"
                }`}
              >
                <Target className="w-3 h-3" />
                Detections
              </button>
              <button
                onClick={() => setViewMode("raw")}
                className={`px-2 py-0.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  viewMode === "raw"
                    ? "bg-[#b24316] text-[#ffffff] font-medium"
                    : "text-[#5f5b55] hover:text-[#232220]"
                }`}
              >
                <Layers className="w-3 h-3" />
                Raw SAR
              </button>
              <button
                onClick={() => setViewMode("pseudocolor")}
                className={`px-2 py-0.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                  viewMode === "pseudocolor"
                    ? "bg-[#b24316] text-[#ffffff] font-medium"
                    : "text-[#5f5b55] hover:text-[#232220]"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Heatmap
              </button>
            </div>

            {/* Flat Zoom Buttons */}
            <div className="flex items-center gap-1 bg-[#ede7dc] px-1 py-0.5 rounded-sm border border-[#ded6c5] text-[#232220]">
              <button
                onClick={handleZoomIn}
                className="p-1 hover:text-[#b24316] hover:bg-[#ffffff] rounded-sm transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 hover:text-[#b24316] hover:bg-[#ffffff] rounded-sm transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:text-[#b24316] hover:bg-[#ffffff] rounded-sm transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-[#5f5b55]">
                {(zoom * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Map Canvas */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`relative w-full h-80 sm:h-96 md:h-[420px] overflow-hidden select-none bg-[#ede7dc] ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div
              className="absolute inset-0 flex items-center justify-center origin-center will-change-transform"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <div className="relative inline-block max-w-full max-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataset.imageSrc}
                  alt={dataset.title}
                  draggable={false}
                  className={`max-w-none w-[700px] h-[700px] object-cover filter ${
                    viewMode === "raw"
                      ? "contrast-125 brightness-95 grayscale"
                      : viewMode === "pseudocolor"
                      ? "contrast-150 brightness-110 sepia-[0.8] hue-rotate-[-30deg]"
                      : "contrast-125 brightness-100"
                  }`}
                />

                {/* Flat Rust Bounding Boxes */}
                {viewMode === "detections" &&
                  dataset.detections.map((item) => {
                    const isSelected = selectedDetection?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetection(item);
                        }}
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: `${item.width}%`,
                          height: `${item.height}%`,
                        }}
                        className={`absolute border-2 rounded-none transition-colors cursor-pointer ${
                          isSelected
                            ? "border-[#b24316] bg-[#b24316]/30"
                            : "border-[#b24316] bg-[#b24316]/15 hover:bg-[#b24316]/25"
                        }`}
                      >
                        <div className="absolute -top-5 left-0 px-1 py-0.2 bg-[#b24316] text-[#ffffff] text-[8px] font-ui whitespace-nowrap pointer-events-none flex items-center gap-1 font-semibold">
                          <span>{item.label.split("(")[0]}</span>
                          <span>{(item.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Flat Reticle Telemetry HUD */}
            <div className="absolute top-2 left-2 pointer-events-none font-ui">
              <div className="bg-[#ffffff]/95 border border-[#ded6c5] rounded-sm px-2 py-1 text-[9px] text-[#232220] space-y-0.5 shadow-xs">
                <div className="text-[#b24316] font-semibold">
                  SAR TELEMETRY
                </div>
                <div className="text-[#5f5b55]">Lat: {hoveredCoords.lat}</div>
                <div className="text-[#5f5b55]">Lon: {hoveredCoords.lon}</div>
                <div className="text-[#232220] font-mono font-medium">σ₀: {hoveredCoords.db}</div>
              </div>
            </div>

            {/* Flat Target Details Popup */}
            {selectedDetection && (
              <div className="absolute bottom-2 left-2 max-w-xs bg-[#ffffff] border border-[#b24316] rounded-sm p-2.5 text-xs text-[#232220] z-20 font-ui shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#b24316] text-xs font-claude">
                    {selectedDetection.label}
                  </span>
                  <button
                    onClick={() => setSelectedDetection(null)}
                    className="text-[#8c867c] hover:text-[#232220] text-[10px]"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[10px] text-[#5f5b55] mt-1 font-claude leading-tight">
                  {selectedDetection.details}
                </p>
                <div className="grid grid-cols-2 gap-1 mt-2 text-[9px] font-mono bg-[#fbf9f5] p-1 border border-[#ded6c5]">
                  <div>
                    <span className="text-[#8c867c]">Conf: </span>
                    <span className="text-[#232220] font-bold">
                      {(selectedDetection.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8c867c]">RCS: </span>
                    <span className="text-[#b24316]">
                      {selectedDetection.metrics?.backscatterDb !== undefined
                        ? `+${selectedDetection.metrics.backscatterDb} dB`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-2 right-2 pointer-events-none bg-[#ffffff]/95 border border-[#ded6c5] px-2 py-0.5 rounded-sm text-[9px] font-mono text-[#5f5b55]">
              <span className="text-[#b24316]">●</span> INCIDENCE: 38.2°
            </div>

            <div className="absolute bottom-2 right-2 pointer-events-none bg-[#ffffff]/95 border border-[#ded6c5] px-2 py-0.5 rounded-sm text-[9px] font-mono text-[#5f5b55]">
              <span>Scale: </span>
              <span className="text-[#232220]">250m ━━━━</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: AI Findings & Answer */}
        <div className="rounded-sm border border-[#ded6c5] bg-[#ffffff] p-4 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ded6c5] pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#b24316]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#232220] font-claude">
                  SAR Intelligence Findings & Answer
                </h3>
              </div>
              <p className="text-[11px] text-[#5f5b55] font-claude mt-0.5">
                Query: &ldquo;{userPrompt || dataset.defaultPrompt}&rdquo;
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#fbeee8] text-[#b24316] border border-[#f2cdbc] font-ui">
              InSAR Multimodal
            </span>
          </div>

          {/* Metric Summary Flat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-ui">
            <div className="p-2 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[9px] text-[#5f5b55] block font-mono">Targets Isolated</span>
              <span className="text-sm font-bold text-[#232220] font-claude">
                {dataset.metrics.totalTargets} Targets
              </span>
            </div>
            <div className="p-2 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[9px] text-[#5f5b55] block font-mono">Mean Clutter</span>
              <span className="text-xs font-semibold text-[#232220] font-mono">
                {dataset.metrics.meanBackscatter}
              </span>
            </div>
            <div className="p-2 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[9px] text-[#5f5b55] block font-mono">Peak Return</span>
              <span className="text-xs font-semibold text-[#b24316] font-mono">
                {dataset.metrics.peakBackscatter}
              </span>
            </div>
            <div className="p-2 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[9px] text-[#5f5b55] block font-mono">Confidence</span>
              <span className="text-sm font-bold text-[#232220] font-mono">
                {dataset.metrics.confidenceScore.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* Detailed Structured Findings in Claude Font */}
          <div className="space-y-2 text-xs leading-relaxed text-[#232220] font-claude">
            <div className="p-3 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[11px] font-bold text-[#b24316] block mb-1 uppercase tracking-wide font-ui">
                • Executive Target Assessment
              </span>
              <p className="text-[#3a3734]">{dataset.analysisFindings.executiveSummary}</p>
            </div>

            <div className="p-3 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[11px] font-bold text-[#232220] block mb-1 uppercase tracking-wide font-ui">
                • Detailed Target Breakdown
              </span>
              <p className="text-[#3a3734]">{dataset.analysisFindings.targetInventory}</p>
            </div>

            <div className="p-3 rounded-sm border border-[#ded6c5] bg-[#fbf9f5]">
              <span className="text-[11px] font-bold text-[#232220] block mb-1 uppercase tracking-wide font-ui">
                • SAR Radar Physics & Backscatter Profile
              </span>
              <p className="text-[#3a3734]">{dataset.analysisFindings.radarPhysics}</p>
            </div>

            <div className="p-3 rounded-sm border border-[#f2cdbc] bg-[#fbeee8]">
              <span className="text-[11px] font-bold text-[#b24316] block mb-1 uppercase tracking-wide font-ui">
                • Tactical Operational Advisory
              </span>
              <p className="text-[#232220] font-medium">{dataset.analysisFindings.tacticalAdvisory}</p>
            </div>
          </div>

          {/* Action Row: Flat Copy Button & THE RUST DOWNLOAD BUTTON */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ded6c5] font-ui">
            <button
              onClick={handleCopyAnalysis}
              className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-[#ded6c5] bg-[#ffffff] hover:bg-[#fbf9f5] hover:border-[#b24316] text-[#232220] text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#b24316]" /> : <Copy className="w-3.5 h-3.5 text-[#5f5b55]" />}
              <span>{copied ? "Copied" : "Copy Briefing"}</span>
            </button>

            {/* THE FLAT RUST DOWNLOAD BUTTON */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[#b24316] hover:bg-[#98350d] text-[#ffffff] font-medium text-xs border border-[#b24316] transition-colors cursor-pointer shadow-xs"
              title="Download official SAR Intelligence Mission Report (PDF/Print)"
            >
              <FileDown className="w-3.5 h-3.5 text-[#ffffff]" />
              <span>Download Intelligence Report (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dataset={dataset}
        userPrompt={userPrompt}
      />
    </div>
  );
};
