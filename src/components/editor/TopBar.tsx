"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Zap, Maximize2, Music2, CheckCircle2 } from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import { extractText } from "@/lib/utils/suno-prompt-builder";
import type { Song, SongStatus } from "@/types";

const STATUS_OPTIONS: { value: SongStatus; label: string; color: string }[] = [
  { value: "idea", label: "Idée", color: "text-amber-400" },
  { value: "drafting", label: "En cours", color: "text-blue-400" },
  { value: "generated", label: "Généré", color: "text-violet-400" },
  { value: "published", label: "Publié", color: "text-emerald-400" },
];

interface TopBarProps {
  song: Song;
}

export default function TopBar({ song }: TopBarProps) {
  const router = useRouter();
  const { isSaving, setIsSaving, toggleFlowMode, lastSaved, currentSong, blocks } = useEditorStore();
  const [status, setStatus] = useState<SongStatus>(song.status as SongStatus);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(false);

  // Construire les paroles formatées pour Suno
  const buildSunoLyrics = useCallback(() => {
    if (blocks.length === 0) return "";
    return blocks
      .sort((a, b) => a.order - b.order)
      .map((block) => {
        let text = "";
        try { text = extractText(JSON.parse(block.content)); }
        catch { text = block.content; }
        const label = block.type === "verse" ? "verse" :
                      block.type === "chorus" ? "chorus" :
                      block.type === "bridge" ? "bridge" :
                      block.type === "intro" ? "intro" :
                      block.type === "outro" ? "outro" : "verse";
        return `[${label}]\n${text.trim()}`;
      })
      .filter((b) => b.split("\n").slice(1).join("").trim() !== "")
      .join("\n\n");
  }, [blocks]);

  // Construire le style court pour Suno
  const buildSunoStyle = useCallback(() => {
    const parts = [];
    if (song.style) parts.push(song.style);
    if (song.mood) parts.push(song.mood);
    if (song.tempo) parts.push(`${song.tempo} BPM`);
    if (song.voice) {
      const voiceMap: Record<string, string> = {
        male: "voix masculine",
        female: "voix féminine",
        androgynous: "voix androgyne",
      };
      parts.push(voiceMap[song.voice] ?? song.voice);
    }
    if (song.durationEstimate) {
      parts.push(`${Math.floor(song.durationEstimate / 60)} min`);
    }
    return parts.join(", ");
  }, [song]);

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
    setCopiedLyrics(false);
    setCopiedStyle(false);
  }, []);

  const handleCopyLyrics = useCallback(async () => {
    await navigator.clipboard.writeText(buildSunoLyrics());
    setCopiedLyrics(true);
    setTimeout(() => setCopiedLyrics(false), 2000);
  }, [buildSunoLyrics]);

  const handleCopyStyle = useCallback(async () => {
    await navigator.clipboard.writeText(buildSunoStyle());
    setCopiedStyle(true);
    setTimeout(() => setCopiedStyle(false), 2000);
  }, [buildSunoStyle]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      useEditorStore.getState().setLastSaved();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    } finally {
      setIsSaving(false);
    }
  }, [song.id, status, setIsSaving]);

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <>
      <header className="h-14 border-b border-studio-border flex items-center px-4 gap-3 bg-studio-bg/80 backdrop-blur-sm shrink-0">
        <button
          onClick={() => router.push("/library")}
          className="p-1.5 hover:bg-studio-hover rounded-lg text-studio-muted hover:text-studio-text transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="w-px h-5 bg-studio-border" />
        <Music2 size={16} className="text-studio-accent shrink-0" />

        <h1 className="font-display font-semibold text-studio-text truncate max-w-xs">
          {currentSong?.title ?? song.title}
        </h1>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SongStatus)}
          className={`text-xs bg-transparent border border-studio-border rounded-full px-2 py-1 focus:outline-none focus:border-studio-accent cursor-pointer ${currentStatus?.color}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-studio-panel text-studio-text">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        {lastSaved && (
          <span className="text-xs text-studio-muted hidden sm:flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Sauvegardé {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-studio-border hover:border-studio-accent/50 rounded-lg text-studio-muted hover:text-studio-text transition-all"
          >
            <Save size={13} />
            {isSaving ? "..." : "Sauv."}
          </button>

          <button
            onClick={toggleFlowMode}
            className="p-1.5 hover:bg-studio-hover rounded-lg text-studio-muted hover:text-studio-text transition-colors"
            title="Mode Flow"
          >
            <Maximize2 size={16} />
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-studio-accent hover:bg-studio-accent-dim rounded-lg text-white text-xs font-medium transition-colors"
          >
            <Zap size={13} />
            COPY FOR SUNO
          </button>
        </div>
      </header>

      {/* Modale export Suno */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-2xl flex flex-col gap-4 p-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-studio-accent" />
                <h2 className="font-semibold text-studio-text">Export pour Suno AI</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-studio-muted hover:text-studio-text text-lg">✕</button>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-studio-text">1. Style of Music</p>
                  <p className="text-xs text-studio-muted">Colle ça dans le champ "Style of Music" de Suno</p>
                </div>
                <button
                  onClick={handleCopyStyle}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    copiedStyle
                      ? "bg-emerald-500 text-white"
                      : "bg-studio-accent hover:bg-studio-accent-dim text-white"
                  }`}
                >
                  {copiedStyle ? "✓ Copié !" : "📋 Copier"}
                </button>
              </div>
              <div className="bg-studio-surface border border-studio-border rounded-lg p-3 text-sm text-studio-text font-mono">
                {buildSunoStyle() || <span className="text-studio-muted italic">Renseigne le style et le mood de la chanson dans les paramètres</span>}
              </div>
            </div>

            <div className="border-t border-studio-border" />

            {/* Lyrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-studio-text">2. Lyrics</p>
                  <p className="text-xs text-studio-muted">Colle ça dans le champ "Lyrics" de Suno</p>
                </div>
                <button
                  onClick={handleCopyLyrics}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    copiedLyrics
                      ? "bg-emerald-500 text-white"
                      : "bg-studio-accent hover:bg-studio-accent-dim text-white"
                  }`}
                >
                  {copiedLyrics ? "✓ Copié !" : "📋 Copier"}
                </button>
              </div>
              <pre className="bg-studio-surface border border-studio-border rounded-lg p-3 text-xs text-studio-text whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                {buildSunoLyrics() || <span className="text-studio-muted italic">Aucun bloc de paroles trouvé</span>}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}