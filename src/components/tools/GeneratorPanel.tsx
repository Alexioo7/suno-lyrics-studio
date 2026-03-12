"use client";

import { useState, useCallback } from "react";
import { Loader2, Lightbulb, Wand2, List, Type } from "lucide-react";
import type { Song } from "@/types";

interface GeneratorPanelProps {
  song: Song;
}

export default function GeneratorPanel({ song }: GeneratorPanelProps) {
  const [activeGen, setActiveGen] = useState<"hooks" | "ideas20" | "titles" | "rewrite">("hooks");
  const [theme, setTheme] = useState(song.mood ?? "");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!theme.trim() && activeGen !== "rewrite") return;
    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeGen,
          theme,
          style: song.style ?? "pop",
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setIsLoading(false);
    }
  }, [activeGen, theme, song]);

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { key: "hooks" as const, label: "Hooks", icon: <Lightbulb size={12} /> },
          { key: "ideas20" as const, label: "20 Idées", icon: <List size={12} /> },
          { key: "titles" as const, label: "Titres", icon: <Type size={12} /> },
          { key: "rewrite" as const, label: "Réécrire", icon: <Wand2 size={12} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveGen(tab.key); setResults([]); setError(null); }}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeGen === tab.key
                ? "bg-studio-accent text-white"
                : "bg-studio-panel text-studio-muted hover:text-studio-text border border-studio-border"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeGen !== "rewrite" ? (
        <div className="space-y-2">
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder={
              activeGen === "hooks" ? "Thème (amour, rue, liberté...)" :
              activeGen === "ideas20" ? "Thème principal..." :
              "Thème des titres..."
            }
            className="w-full bg-studio-panel border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text placeholder:text-studio-muted focus:outline-none focus:border-studio-accent"
          />
          <button
            onClick={generate}
            disabled={isLoading || !theme.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
          >
            {isLoading ? (
              <><Loader2 size={14} className="animate-spin" /> Génération en cours...</>
            ) : (
              <><Wand2 size={14} /> Générer avec Mistral</>
            )}
          </button>
        </div>
      ) : (
        <RewritePanel style={song.style ?? "pop"} />
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-studio-muted uppercase tracking-wider">
            {results.length} suggestions
          </p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {results.map((result, i) => (
              <div
                key={i}
                onClick={() => copyResult(result)}
                className="p-2.5 bg-studio-panel border border-studio-border hover:border-studio-accent/40 rounded-lg text-xs text-studio-text cursor-pointer hover:bg-studio-hover transition-all group"
              >
                <p>{result}</p>
                <span className="text-studio-muted text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  Cliquer pour copier
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RewritePanel({ style }: { style: string }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"poetique" | "sombre" | "simple" | "intense">("poetique");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewrite = useCallback(async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rewrite", text, mode, style }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.raw ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, [text, mode, style]);

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Collez le texte à réécrire..."
        rows={4}
        className="w-full bg-studio-panel border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text placeholder:text-studio-muted focus:outline-none focus:border-studio-accent resize-none"
      />
      <div className="grid grid-cols-2 gap-1">
        {(["poetique", "sombre", "simple", "intense"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`py-1 rounded text-xs transition-colors ${
              mode === m
                ? "bg-studio-accent text-white"
                : "bg-studio-panel text-studio-muted border border-studio-border hover:text-studio-text"
            }`}
          >
            {m === "poetique" ? "Poétique" : m === "sombre" ? "Sombre" : m === "simple" ? "Simple" : "Intense"}
          </button>
        ))}
      </div>
      <button
        onClick={rewrite}
        disabled={isLoading || !text.trim()}
        className="w-full py-2 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
        Réécrire avec Mistral
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result && (
        <div
          onClick={() => navigator.clipboard.writeText(result)}
          className="p-3 bg-studio-panel border border-studio-accent/30 rounded-lg text-xs text-studio-text cursor-pointer hover:bg-studio-hover transition-colors whitespace-pre-wrap"
        >
          {result}
          <span className="block mt-1 text-[10px] text-studio-muted">Cliquer pour copier</span>
        </div>
      )}
    </div>
  );
}