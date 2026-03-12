"use client";

import { useState, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import { extractText } from "@/lib/utils/suno-prompt-builder";
import type { Song } from "@/types";

interface CoachPanelProps {
  song: Song;
}

export default function CoachPanel({ song }: CoachPanelProps) {
  const { blocks } = useEditorStore();
  const [advice, setAdvice] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = useCallback(async () => {
    setIsLoading(true);
    setAdvice([]);
    setError(null);

    const lyrics = blocks.map((b) => {
      try { return `[${b.type.toUpperCase()}]\n${extractText(JSON.parse(b.content))}`; }
      catch { return `[${b.type.toUpperCase()}]\n${b.content}`; }
    }).join("\n\n");

    if (!lyrics.trim()) {
      setError("Écris d'abord quelques paroles !");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "coach",
          text: lyrics,
          style: song.style ?? "pop",
          theme: song.mood ?? "",
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdvice(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, [blocks, song]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs font-medium text-studio-muted uppercase tracking-wider mb-1">
          Coach IA
        </p>
        <p className="text-xs text-studio-muted">
          Analyse tes paroles et donne des conseils pour les améliorer.
        </p>
      </div>

      <button
        onClick={getAdvice}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
      >
        {isLoading ? (
          <><Loader2 size={14} className="animate-spin" /> Analyse en cours...</>
        ) : (
          <><Sparkles size={14} /> Obtenir des conseils</>
        )}
      </button>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {advice.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {advice.map((tip, i) => (
            <div key={i} className="flex gap-2 p-2.5 bg-studio-panel border border-studio-border rounded-lg">
              <span className="text-studio-accent mt-0.5 shrink-0">💡</span>
              <p className="text-xs text-studio-text leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}