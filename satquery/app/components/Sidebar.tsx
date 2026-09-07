"use client";

import React, { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Satellite,
  Compass,
  Ship,
  Plane,
  Waves,
  Pickaxe,
  Building2,
  Mountain,
  Radio,
} from "lucide-react";
import { ChatSession } from "../types";
import { MiniGlobeWidget } from "./MiniGlobeWidget";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getCategoryIcon = (category: ChatSession["category"]) => {
    switch (category) {
      case "Maritime":
        return <Ship className="w-3.5 h-3.5 text-[#b24316]" />;
      case "Aviation":
        return <Plane className="w-3.5 h-3.5 text-[#b24316]" />;
      case "Hydrology":
        return <Waves className="w-3.5 h-3.5 text-[#b24316]" />;
      case "Mining":
        return <Pickaxe className="w-3.5 h-3.5 text-[#b24316]" />;
      case "Critical Infra":
        return <Building2 className="w-3.5 h-3.5 text-[#b24316]" />;
      case "Geohazards":
        return <Mountain className="w-3.5 h-3.5 text-[#b24316]" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-[#b24316]" />;
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.heading.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#ede7dc] border-r border-[#ded6c5] transition-all duration-200 select-none z-30 ${
        isCollapsed ? "w-14" : "w-72 lg:w-80"
      }`}
    >
      {/* Top Header & Collapse Button */}
      <div className="flex items-center justify-between p-3 border-b border-[#ded6c5] bg-[#ede7dc]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center w-7 h-7 bg-[#b24316] text-[#ffffff] rounded-sm">
              <Satellite className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-wide text-[#232220] font-claude">
                SatQuery <span className="text-[#b24316]">AI</span>
              </span>
              <span className="text-[10px] text-[#5f5b55] font-ui truncate">
                SAR Geospatial Intelligence
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex items-center justify-center w-7 h-7 rounded-sm border border-[#ded6c5] text-[#5f5b55] hover:text-[#232220] hover:border-[#b24316] hover:bg-[#e4ddcf] transition-colors ${
            isCollapsed ? "mx-auto bg-[#e4ddcf]" : "bg-[#f5f1ea]"
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#b24316]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* New Query Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 py-2 rounded-sm bg-[#b24316] hover:bg-[#98350d] text-[#ffffff] font-ui font-medium text-xs transition-colors border border-[#b24316] ${
            isCollapsed ? "justify-center px-0" : "px-3"
          }`}
          title="New SAR Query"
        >
          <Plus className="w-4 h-4 text-[#ffffff]" />
          {!isCollapsed && <span>New Query</span>}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#8c867c]" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs font-ui bg-[#ffffff] border border-[#ded6c5] rounded-sm text-[#232220] placeholder-[#8c867c] focus:outline-none focus:border-[#b24316]"
            />
          </div>
        </div>
      )}

      {/* Section Header */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[10px] font-semibold tracking-wider text-[#5f5b55] font-ui uppercase">
          <span>Chat Sessions</span>
          <span className="text-[#8c867c] font-mono">
            {filteredSessions.length}
          </span>
        </div>
      )}

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              title={session.heading}
              className={`w-full text-left rounded-sm transition-colors flex items-center gap-2.5 ${
                isCollapsed ? "p-2 justify-center" : "p-2.5"
              } ${
                isActive
                  ? "bg-[#ffffff] border-l-2 border-[#b24316] text-[#232220] shadow-sm"
                  : "text-[#5f5b55] hover:text-[#232220] hover:bg-[#e4ddcf] border-l-2 border-transparent"
              }`}
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-sm ${
                  isActive
                    ? "bg-[#fbeee8] text-[#b24316]"
                    : "bg-[#e4ddcf] text-[#5f5b55]"
                }`}
              >
                {getCategoryIcon(session.category)}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate font-claude ${
                        isActive ? "text-[#232220] font-bold" : "text-[#474440]"
                      }`}
                    >
                      {session.heading}
                    </p>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b24316] flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8c867c] font-ui mt-0.5">
                    <span>{session.date}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-sm text-[9px] uppercase font-mono ${
                        isActive
                          ? "bg-[#fbeee8] text-[#b24316] border border-[#f2cdbc]"
                          : "bg-[#e4ddcf] text-[#5f5b55] border border-[#ded6c5]"
                      }`}
                    >
                      {session.category}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini 3D Sub-Satellite Nadir Widget */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <MiniGlobeWidget lat="26°10'N" lon="91°44'E" />
        </div>
      )}

      {/* Bottom Status */}
      <div className="p-3 border-t border-[#ded6c5] bg-[#ede7dc]">
        {isCollapsed ? (
          <div className="flex justify-center" title="Umbra X-SAR Online">
            <Radio className="w-4 h-4 text-[#b24316]" />
          </div>
        ) : (
          <div className="space-y-1 font-ui text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#5f5b55] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b24316] inline-block" />
                Umbra X-Band SAR
              </span>
              <span className="text-[#b24316] font-mono font-medium">9.6 GHz LIVE</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-[#8c867c] font-mono bg-[#ffffff] px-2 py-1 rounded-sm border border-[#ded6c5]">
              <span>Spotlight-06</span>
              <span>0.50m GSD</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
