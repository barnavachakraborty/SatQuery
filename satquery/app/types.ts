export interface DetectionItem {
  id: string;
  label: string;
  category: "vessel" | "aircraft" | "infrastructure" | "water" | "anomaly" | "terrain";
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  details: string;
  metrics?: {
    length?: string;
    beam?: string;
    backscatterDb?: number;
    rcs?: string;
  };
}

export interface SarDataset {
  id: string;
  title: string;
  location: string;
  country: string;
  coordinates: {
    lat: string;
    lon: string;
  };
  filename: string;
  imageSrc: string;
  fileSize: string;
  sensor: string;
  mode: string;
  polarization: string;
  resolution: string;
  frequency: string;
  acquisitionDate: string;
  defaultPrompt: string;
  suggestedPrompts: string[];
  summary: string;
  detections: DetectionItem[];
  metrics: {
    totalTargets: number;
    meanBackscatter: string;
    peakBackscatter: string;
    surfaceArea: string;
    confidenceScore: string;
  };
  analysisFindings: {
    executiveSummary: string;
    targetInventory: string;
    radarPhysics: string;
    tacticalAdvisory: string;
  };
}

export interface ChatSession {
  id: string;
  heading: string;
  category: "Maritime" | "Aviation" | "Hydrology" | "Mining" | "Critical Infra" | "Geohazards";
  date: string;
  datasetId: string;
  customPrompt?: string;
  hasExecuted: boolean;
}

export type SarViewMode = "raw" | "pseudocolor" | "detections";
