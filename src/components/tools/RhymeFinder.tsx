/**
 * Outil de recherche de rimes.
 * L'utilisateur entre un mot et obtient des rimes classifiées.
 */
"use client";

import { useState, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import type { RhymeResult } from "@/types";

const TYPE_LABELS: Record<RhymeResult["type"], { label: string; color: string }> = {
  perfect: { label: "Parfaite", color: "text-emerald-400 bg-emerald-400/10" },
  approximate: { label: "Approx.", color: "text-amber-400 bg-amber-400/10" },
  multisyllabic: { label: "Multi", color: "text-violet-400 bg-violet-400/10" },
};

export default function RhymeFinder() {
  const [word, setWord] = useState("");
  const [results, setResults] = useState<RhymeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!word.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rhymes?word=${encodeURIComponent(word.trim())}`);
      const data = await res.json();
      if (data.rhymes) {
        setResults(data.rhymes);
      } else {
        setError("Aucune rime trouvée");
      }
    } catch {
      setError("Erreur lors de la recherche");
    } finally {
      setIsLoading(false);
    }
  }, [word]);

  const copyWord = (w: string) => {
    navigator.clipboard.writeText(w);
  };

  const grouped = {
    perfect: results.filter((r) => r.type === "perfect"),
    approximate: results.filter((r) => r.type === "approximate"),
    multisyllabic: results.filter((r) => r.type === "multisyllabic"),
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs font-medium text-studio-muted uppercase tracking-wider mb-2">
          Chercher des rimes
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-studio-muted" />
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="ex: amour, nuit..."
              className="w-full bg-studio-panel border border-studio-border rounded-lg pl-8 pr-3 py-2 text-sm text-studio-text placeholder:text-studio-muted focus:outline-none focus:border-studio-accent"
              aria-label="Mot à rimer"
            />
          </div>
          <button
            onClick={search}
            disabled={isLoading || !word.trim()}
            className="px-3 py-2 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : "→"}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-4">
          {(["perfect", "approximate", "multisyllabic"] as const).map((type) => {
            const group = grouped[type];
            if (group.length === 0) return null;
            const cfg = TYPE_LABELS[type];
            return (
              <div key={type}>
                <p className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-2 ${cfg.color}`}>
                  {cfg.label} ({group.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((r) => (
                    <button
                      key={r.word}
                      onClick={() => copyWord(r.word)}
                      className="px-2.5 py-1 bg-studio-panel border border-studio-border hover:border-studio-accent/50 rounded-lg text-xs text-studio-text hover:text-studio-accent transition-all active:scale-95"
                      title={`Copier "${r.word}"`}
                    >
                      {r.word}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && results.length === 0 && word && (
        <p className="text-xs text-studio-muted text-center py-4">
          Entrez un mot et appuyez sur Entrée
        </p>
      )}
    </div>
  );
}
