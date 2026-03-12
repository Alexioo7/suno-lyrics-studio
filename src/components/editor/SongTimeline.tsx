/**
 * Visualisation timeline horizontale de la structure de la chanson.
 * Chaque bloc est représenté par une bande colorée proportionnelle au contenu.
 */
"use client";

import type { Block } from "@/types";

const BLOCK_COLORS: Record<string, string> = {
  intro: "#0891b2",
  verse: "#1d4ed8",
  chorus: "#4f46e5",
  bridge: "#7c3aed",
  outro: "#475569",
  other: "#6b6b8a",
};

const BLOCK_LABELS: Record<string, string> = {
  intro: "I",
  verse: "V",
  chorus: "C",
  bridge: "B",
  outro: "O",
  other: "?",
};

interface SongTimelineProps {
  blocks: Block[];
}

export default function SongTimeline({ blocks }: SongTimelineProps) {
  if (blocks.length === 0) {
    return (
      <div className="h-6 bg-studio-surface rounded-full opacity-40" />
    );
  }

  // Calculer la longueur relative de chaque bloc (basé sur le contenu)
  const blockLengths = blocks.map((b) => {
    try {
      const doc = JSON.parse(b.content);
      // Compter les paragraphes comme proxy de longueur
      const paragraphs = doc?.content?.length ?? 1;
      return Math.max(1, paragraphs);
    } catch {
      return 2;
    }
  });

  const total = blockLengths.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-1">
      <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
        {blocks.map((block, i) => {
          const pct = (blockLengths[i] / total) * 100;
          const color = block.color ?? BLOCK_COLORS[block.type] ?? BLOCK_COLORS.other;
          return (
            <div
              key={block.id}
              className="flex items-center justify-center text-white text-[9px] font-bold transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: color,
                minWidth: "16px",
              }}
              title={`${block.type} (${Math.round(pct)}%)`}
            >
              {pct > 8 ? BLOCK_LABELS[block.type] ?? "?" : ""}
            </div>
          );
        })}
      </div>
      {/* Légende */}
      <div className="flex items-center gap-3 flex-wrap">
        {Array.from(new Set(blocks.map((b) => b.type))).map((type) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ background: BLOCK_COLORS[type] ?? BLOCK_COLORS.other }}
            />
            <span className="text-xs text-studio-muted capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
