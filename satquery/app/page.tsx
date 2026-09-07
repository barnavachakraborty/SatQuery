"use client";

import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { MiddlePanel } from "./components/MiddlePanel";
import { RightPanel } from "./components/RightPanel";
import { SAR_DATASETS, INITIAL_CHAT_SESSIONS } from "./sarData";
import { SarDataset, ChatSession } from "./types";

export default function Home() {
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
    // Pick the next dataset or default
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

  // Handle selecting a dataset from the middle panel (Preloaded GeoTIFF carousel)
  const handleSelectDataset = (dataset: SarDataset) => {
    setActiveDatasetId(dataset.id);
    setCurrentPrompt(dataset.defaultPrompt);

    // Update active session's dataset link
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

  // Handle custom image upload from computer (e.g. from E:\projects\SatQuery Ai\GeoTIFF_TIFF_Images)
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

    // Add as new chat session
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
      // Mark active session as executed
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, customPrompt: currentPrompt, hasExecuted: true }
            : s
        )
      );
    }, 900);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f4ee] text-[#232220] font-claude antialiased">
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

      {/* 3. Rightmost Panel: Interactive Zoomable Map & Answer with Rust-Colored Download Button */}
      <div className="flex-1 h-full min-w-0">
        <RightPanel
          dataset={currentDataset}
          userPrompt={currentPrompt}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </div>
  );
}
