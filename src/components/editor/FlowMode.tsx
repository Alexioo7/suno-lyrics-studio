/**
 * Mode Flow — plein écran épuré pour l'écriture.
 * Masque tout sauf l'éditeur et les blocs.
 */
"use client";

import { useEffect } from "react";
import { X, Minimize2 } from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import BlockEditor from "./BlockEditor";
import type { Song } from "@/types";

interface FlowModeProps {
  song: Song;
}

export default function FlowMode({ song }: FlowModeProps) {
  const { blocks, toggleFlowMode } = useEditorStore();

  // Escape pour quitter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleFlowMode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFlowMode]);

  return (
    <div className="flow-mode">
      {/* Contrôles */}
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={toggleFlowMode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-studio-panel/80 backdrop-blur border border-studio-border rounded-full text-studio-muted hover:text-studio-text text-xs transition-colors"
          aria-label="Quitter le mode Flow"
        >
          <Minimize2 size={13} />
          Quitter (Esc)
        </button>
      </div>

      <div className="flow-content">
        {/* Titre */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-studio-text opacity-20 hover:opacity-60 transition-opacity">
            {song.title}
          </h1>
        </div>

        {/* Blocs */}
        <div className="space-y-8">
          {blocks.map((block) => (
            <div key={block.id} className="space-y-2">
              <p
                className="text-xs uppercase tracking-[0.2em] font-medium"
                style={{ color: getBlockColor(block.type) }}
              >
                {block.type}
              </p>
              <div className="border-l-2 pl-4" style={{ borderColor: getBlockColor(block.type) + "40" }}>
                <BlockEditor block={block} songId={song.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getBlockColor(type: string): string {
  const colors: Record<string, string> = {
    verse: "#1d4ed8",
    chorus: "#4f46e5",
    bridge: "#7c3aed",
    intro: "#0891b2",
    outro: "#475569",
    other: "#6b6b8a",
  };
  return colors[type] ?? colors.other;
}
