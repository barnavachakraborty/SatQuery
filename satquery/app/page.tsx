"use client";

import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { MiddlePanel } from "./components/MiddlePanel";
import { RightPanel } from "./components/RightPanel";
import { EarthHeroLanding } from "./components/EarthHeroLanding";
import { FallingSnowBackground } from "./components/FallingSnowBackground";
import { SAR_DATASETS, INITIAL_CHAT_SESSIONS } from "./sarData";
import { SarDataset, ChatSession } from "./types";
import { Globe2, Sparkles, SlidersHorizontal } from "lucide-react";

export default function Home() {
  // Page view state: "landing" (3D Earth + Falling Snow) vs "workspace" (Console)
  const [viewState, setViewState] = useState<"landing" | "workspace">("landing");
  const [snowEnabled, setSnowEnabled] = useState<boolean>(true);

  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_CHAT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("chat-1");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [datasets, setDatasets] = useState<SarDataset[]>(SAR_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string>("ship_detection");
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    SAR_DATASETS[0].defaultPrompt
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Active dataset object
  const currentDataset =
    datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  // Handle selecting a chat session from the left sidebar
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveDatasetId(session.datasetId);
      const ds = datasets.find((d) => d.id === session.datasetId);
      if (ds) {
        setCurrentPrompt(session.customPrompt || ds.defaultPrompt);
      }
    }
  };

  // Handle "+ New Query"
  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const defaultDs = datasets[0];
    const newSession: ChatSession = {
      id: newId,
      heading: `SAR Reconnaissance Mission #${sessions.length + 1}`,
      category: "Maritime",
      date: "Just now",
      datasetId: defaultDs.id,
      hasExecuted: false,
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setActiveDatasetId(defaultDs.id);
    setCurrentPrompt(defaultDs.defaultPrompt);
  };

  // Handle selecting a dataset from the middle panel
  const handleSelectDataset = (dataset: SarDataset) => {
    setActiveDatasetId(dataset.id);
    setCurrentPrompt(dataset.defaultPrompt);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              datasetId: dataset.id,
              heading: dataset.title.split("&")[0].split("•")[0],
            }
          : s
      )
    );
  };

  // Handle custom image upload
  const handleCustomImageUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const newCustomDataset: SarDataset = {
      id: `custom-${Date.now()}`,
      title: `Custom SAR: ${file.name.replace(/\.[^/.]+$/, "")}`,
      location: "Custom Survey Corridor",
      country: "Local Tile Upload",
      coordinates: {
        lat: "12°58'23.0\"N",
        lon: "77°35'45.0\"E",
      },
      filename: file.name,
      imageSrc: objectUrl,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      sensor: "Custom Ingested SAR Sensor",
      mode: "Spotlight / Stripmap",
      polarization: "Dual-Pol VV/VH",
      resolution: "0.50 m GSD",
      frequency: "X-Band (9.6 GHz)",
      acquisitionDate: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      defaultPrompt:
        "Perform automated target detection, backscatter intensity profiling, and identify structural or water scatterers across the custom uploaded SAR tile.",
      suggestedPrompts: [
        "Detect high-intensity metallic scatterers and estimate object dimensions.",
        "Delineate water bodies and flood inundation zones using specular contrast.",
        "Segment linear infrastructure networks, roads, and runway corridors.",
      ],
      summary: `Custom user-uploaded SAR tile (${file.name}). Automatic ingestion and radiometric calibration initialized.`,
      metrics: {
        totalTargets: 9,
        meanBackscatter: "-16.4 dBσ₀",
        peakBackscatter: "+23.1 dBσ₀",
        surfaceArea: "3.50 km² Survey",
        confidenceScore: "96.8% InSAR Match",
      },
      detections: [
        {
          id: "cust-det-1",
          label: "Prominent Corner Reflector Target #1",
          category: "infrastructure",
          confidence: 0.96,
          x: 44.0,
          y: 48.0,
          width: 12.0,
          height: 8.0,
          details: "High dielectric return detected from metallic surface target.",
          metrics: { length: "140m", beam: "45m", backscatterDb: 23.1, rcs: "39.4 dBsm" },
        },
        {
          id: "cust-det-2",
          label: "Specular Forward Scattering Zone #2",
          category: "water",
          confidence: 0.98,
          x: 22.0,
          y: 65.0,
          width: 18.0,
          height: 10.0,
          details: "Smooth specular surface characteristic of calm standing water or pavement.",
          metrics: { length: "450m", beam: "200m", backscatterDb: -22.4, rcs: "N/A" },
        },
      ],
      analysisFindings: {
        executiveSummary: `Radiometric calibration completed for user-provided tile "${file.name}". Isolated 9 anomalous scatterers against uniform background.`,
        targetInventory:
          "Target inventory isolates 2 high-RCS point structures and 1 smooth specular absorption zone. No systemic imaging artifacts or range doppler ambiguities noted.",
        radarPhysics:
          "High backscatter peaks (+23.1 dBσ₀) correspond to dihedral double-bounce reflections. Low backscatter regions (-22.4 dBσ₀) match forward specular reflections.",
        tacticalAdvisory:
          "Tile successfully ingested into SatQuery AI processing pipeline. Ready for operational tasking and multi-temporal change detection.",
      },
    };

    setDatasets([newCustomDataset, ...datasets]);
    setActiveDatasetId(newCustomDataset.id);
    setCurrentPrompt(newCustomDataset.defaultPrompt);

    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      heading: `SAR Analysis: ${file.name.slice(0, 24)}...`,
      category: "Critical Infra",
      date: "Just now",
      datasetId: newCustomDataset.id,
      hasExecuted: true,
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  // Handle Execute Query Button
  const handleExecuteQuery = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, customPrompt: currentPrompt, hasExecuted: true }
            : s
        )
      );
    }, 900);
  };

  // 1. RENDER 3D REALISTIC EARTH ROTATE LANDING PAGE
  if (viewState === "landing") {
    return <EarthHeroLanding onEnterApp={() => setViewState("workspace")} />;
  }

  // 2. RENDER UPGRADED WORKSPACE WITH TOP HUD & FALLING SNOW
  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[#f7f4ee] text-[#232220] font-claude antialiased">
      
      {/* Continuous Falling Snow / Cosmic Particles */}
      {snowEnabled && <FallingSnowBackground opacity={0.35} />}

      {/* TOP UPGRADED TELEMETRY & NAVIGATION STRIP */}
      <header className="relative z-30 flex-none px-4 py-2.5 bg-[#ede7dc] border-b border-[#ded6c5] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewState("landing")}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#ffffff] hover:bg-[#ded6c5] border border-[#ded6c5] text-xs font-ui text-[#232220] transition cursor-pointer shadow-sm"
            title="Return to 3D Earth Orbit"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#b24316] animate-spin" style={{ animationDuration: "12s" }} />
            <span className="font-semibold">3D Earth Orbit</span>
          </button>

          <div className="h-4 w-[1px] bg-[#ded6c5] hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-ui">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#b24316] font-bold">
              ISRO // SIH 26167
            </span>
            <span className="text-[#5f5b55] hidden md:inline">·</span>
            <span className="font-semibold text-[#232220] hidden md:inline">SatQuery AI Console</span>
          </div>
        </div>

        {/* Live Mission Orbit Status */}
        <div className="flex items-center gap-4 text-xs font-ui">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-[#5f5b55]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Nadir: <strong>{currentDataset.coordinates.lat}, {currentDataset.coordinates.lon}</strong></span>
            <span>·</span>
            <span>Sensor: <strong>{currentDataset.sensor}</strong></span>
          </div>

          {/* Snow toggle */}
          <button
            onClick={() => setSnowEnabled(!snowEnabled)}
            className={`px-2 py-1 rounded text-[11px] font-ui flex items-center gap-1 border transition ${
              snowEnabled
                ? "bg-[#fbeee8] border-[#f2cdbc] text-[#b24316]"
                : "bg-[#ffffff] border-[#ded6c5] text-[#5f5b55]"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Snow: {snowEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>
      </header>

      {/* 3-PANEL APPLICATION WORKSPACE */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
        {/* 1. Leftside Collapsible Chat Section */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* 2. Middle Section: Image Browse / Ingestion & Multimodal Question/Prompt */}
        <div className="w-[360px] lg:w-[420px] xl:w-[460px] flex-shrink-0 h-full">
          <MiddlePanel
            currentDataset={currentDataset}
            allDatasets={datasets}
            onSelectDataset={handleSelectDataset}
            promptText={currentPrompt}
            onPromptChange={setCurrentPrompt}
            onExecuteQuery={handleExecuteQuery}
            isAnalyzing={isAnalyzing}
            onCustomImageUpload={handleCustomImageUpload}
          />
        </div>

        {/* 3. Rightmost Panel: Interactive Zoomable Map & Answer */}
        <div className="flex-1 h-full min-w-0">
          <RightPanel
            dataset={currentDataset}
            userPrompt={currentPrompt}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
}
