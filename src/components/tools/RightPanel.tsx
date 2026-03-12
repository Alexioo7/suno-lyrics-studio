/**
 * Panneau droit — Outils IA : rimes, punchlines, analyse, génération.
 * Tabs : Rimes | Génération | Analyse
 */
"use client";

import { useState } from "react";
import { Music, Zap, BarChart2, Lightbulb, Sparkles } from "lucide-react";
import RhymeFinder from "./RhymeFinder";
import GeneratorPanel from "./GeneratorPanel";
import AnalysisPanel from "./AnalysisPanel";
import CoachPanel from "./CoachPanel";
import type { Song } from "@/types";

const TABS = [
  { key: "rhymes", label: "Rimes", icon: <Music size={14} /> },
  { key: "generate", label: "Générer", icon: <Lightbulb size={14} /> },
  { key: "analyze", label: "Analyser", icon: <BarChart2 size={14} /> },
  { key: "coach", label: "Coach", icon: <Sparkles size={14} /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface RightPanelProps {
  song: Song;
}

export default function RightPanel({ song }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("rhymes");

  return (
    <div className="h-full flex flex-col bg-studio-surface/30">
      {/* Tabs */}
      <div className="flex border-b border-studio-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "text-studio-accent border-b-2 border-studio-accent"
                : "text-studio-muted hover:text-studio-text"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "rhymes" && <RhymeFinder />}
        {activeTab === "generate" && <GeneratorPanel song={song} />}
        {activeTab === "analyze" && <AnalysisPanel song={song} />}
	{activeTab === "coach" && <CoachPanel song={song} />}
      </div>
    </div>
  );
}
