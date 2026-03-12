/**
 * Panneau d'analyse des paroles.
 * Scores d'émotion, répétitions, chantabilité, syllabes.
 */
"use client";

import { useState, useCallback } from "react";
import { BarChart2, Loader2, RefreshCw } from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import { extractText } from "@/lib/utils/suno-prompt-builder";
import type { Song, AnalyzeLyricsOutput } from "@/types";

interface AnalysisPanelProps {
  song: Song;
}

export default function AnalysisPanel({ song }: AnalysisPanelProps) {
  const { blocks } = useEditorStore();
  const [analysis, setAnalysis] = useState<AnalyzeLyricsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Extraire les paroles des blocs
      const lyrics = blocks
        .map((b) => {
          try {
            return extractText(JSON.parse(b.content));
          } catch {
            return b.content;
          }
        })
        .join("\n\n");

      if (!lyrics.trim()) {
        setError("Aucun contenu à analyser");
        return;
      }

      const res = await fetch("/api/analyze-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'analyse");
    } finally {
      setIsLoading(false);
    }
  }, [blocks]);

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={analyze}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
      >
        {isLoading ? (
          <><Loader2 size={14} className="animate-spin" /> Analyse en cours...</>
        ) : (
          <><BarChart2 size={14} /> Analyser les paroles</>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Score chantabilité */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-studio-muted">Chantabilité</p>
              <span className="text-sm font-bold font-mono" style={{
                color: analysis.scoreChantabilite > 70 ? "#10b981" :
                       analysis.scoreChantabilite > 40 ? "#f59e0b" : "#ef4444"
              }}>
                {analysis.scoreChantabilite}/100
              </span>
            </div>
            <div className="h-2 bg-studio-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${analysis.scoreChantabilite}%`,
                  background: analysis.scoreChantabilite > 70 ? "#10b981" :
                               analysis.scoreChantabilite > 40 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>

          {/* Émotions */}
          <div>
            <p className="text-xs font-medium text-studio-muted mb-2">Distribution émotionnelle</p>
            <div className="space-y-1.5">
              {[
                { key: "positive", label: "Positif", color: "#10b981" },
                { key: "negative", label: "Négatif", color: "#ef4444" },
                { key: "neutral", label: "Neutre", color: "#6b7280" },
              ].map(({ key, label, color }) => {
                const value = (analysis.scoreEmotion as Record<string, number>)[key] ?? 0;
                const pct = Math.round(value * 100);
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-studio-muted w-14 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-studio-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="text-xs font-mono text-studio-muted w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mots clés */}
          {analysis.topWords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-studio-muted mb-2">
                Mots fréquents
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.topWords.slice(0, 8).map(({ word, count }) => (
                  <span
                    key={word}
                    className="text-xs px-2 py-1 bg-studio-panel border border-studio-border rounded-full text-studio-text"
                    title={`${count} occurrence(s)`}
                  >
                    {word}
                    <span className="ml-1 text-studio-muted font-mono">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Répétitions */}
          {analysis.repetitions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-studio-muted mb-2">
                Patterns répétés
              </p>
              <div className="space-y-1">
                {analysis.repetitions.slice(0, 5).map(({ ngram, count }) => (
                  <div key={ngram} className="flex items-center justify-between text-xs">
                    <span className="text-studio-text italic">"{ngram}"</span>
                    <span className="text-studio-muted font-mono">×{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
