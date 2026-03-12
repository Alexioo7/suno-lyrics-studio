/**
 * Panneau gauche : navigation bibliothèque, versions, métadonnées.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2, History, Settings, ChevronDown, ChevronRight, RotateCcw, Tag } from "lucide-react";
import type { Song } from "@/types";

interface LeftPanelProps {
  song: Song & {
    versions?: Array<{ id: string; label: string; createdAt: string }>;
  };
}

export default function LeftPanel({ song }: LeftPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"versions" | "meta">("versions");
  const [expandedSections, setExpandedSections] = useState({ versions: true, meta: false });

  const toggle = (key: "versions" | "meta") =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-full flex flex-col bg-studio-surface/50">
      {/* Tabs */}
      <div className="flex border-b border-studio-border">
        {[
          { key: "versions" as const, label: "Versions", icon: <History size={14} /> },
          { key: "meta" as const, label: "Info", icon: <Settings size={14} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "text-studio-accent border-b-2 border-studio-accent"
                : "text-studio-muted hover:text-studio-text"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === "versions" ? (
          <VersionsList versions={song.versions ?? []} />
        ) : (
          <MetaPanel song={song} />
        )}
      </div>

      {/* Footer : lien bibliothèque */}
      <div className="border-t border-studio-border p-3">
        <button
          onClick={() => router.push("/library")}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-studio-muted hover:text-studio-text hover:bg-studio-hover rounded-lg transition-colors"
        >
          <Music2 size={14} />
          Bibliothèque
        </button>
      </div>
    </div>
  );
}

function VersionsList({
  versions,
}: {
  versions: Array<{ id: string; label: string; createdAt: string }>;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-studio-muted uppercase tracking-wider mb-2 px-1">
        Historique
      </p>
      {versions.length === 0 ? (
        <p className="text-xs text-studio-muted text-center py-4">
          Aucune version sauvegardée.<br />
          <span className="opacity-60">Utilisez Ctrl+S régulièrement.</span>
        </p>
      ) : (
        <div className="space-y-1">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-studio-hover group cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-xs text-studio-text truncate">{v.label}</p>
                <p className="text-xs text-studio-muted">
                  {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-studio-panel rounded text-studio-muted hover:text-studio-text transition-all"
                title="Restaurer cette version"
                aria-label="Restaurer"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaPanel({ song }: { song: Song }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-studio-muted uppercase tracking-wider mb-2 px-1">
        Métadonnées
      </p>
      {[
        { label: "Style", value: song.style },
        { label: "Mood", value: song.mood },
        { label: "Tempo", value: song.tempo ? `${song.tempo} BPM` : undefined },
        { label: "Voix", value: song.voice },
        { label: "Durée", value: song.durationEstimate ? `${Math.round(song.durationEstimate / 60)} min` : undefined },
      ].map(({ label, value }) => (
        <div key={label} className="px-1">
          <p className="text-xs text-studio-muted mb-0.5">{label}</p>
          <p className="text-xs text-studio-text font-medium">
            {value ?? <span className="text-studio-muted italic">Non défini</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
