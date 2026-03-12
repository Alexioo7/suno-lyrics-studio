/**
 * Barre supérieure de l'éditeur.
 * Navigation, titre, statut, actions rapides.
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Zap, Maximize2, Music2,
  Clock, CheckCircle2, Edit, Lightbulb, MoreHorizontal
} from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
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
  const { isSaving, setIsSaving, toggleFlowMode, lastSaved, currentSong } = useEditorStore();
  const [status, setStatus] = useState<SongStatus>(song.status as SongStatus);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);

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

  const handleGeneratePrompt = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-suno-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id }),
      });
      const data = await res.json();
      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
        setShowPromptModal(true);
      }
    } catch (err) {
      console.error("Erreur génération prompt:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [song.id]);

  const handleCopyPrompt = useCallback(async () => {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    // TODO: toast feedback
  }, [generatedPrompt]);

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <>
      <header className="h-14 border-b border-studio-border flex items-center px-4 gap-3 bg-studio-bg/80 backdrop-blur-sm shrink-0">
        {/* Back */}
        <button
          onClick={() => router.push("/library")}
          className="p-1.5 hover:bg-studio-hover rounded-lg text-studio-muted hover:text-studio-text transition-colors"
          aria-label="Retour à la bibliothèque"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="w-px h-5 bg-studio-border" />

        {/* Logo */}
        <Music2 size={16} className="text-studio-accent shrink-0" />

        {/* Title */}
        <h1 className="font-display font-semibold text-studio-text truncate max-w-xs">
          {currentSong?.title ?? song.title}
        </h1>

        {/* Status selector */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SongStatus)}
          className={`text-xs bg-transparent border border-studio-border rounded-full px-2 py-1 focus:outline-none focus:border-studio-accent cursor-pointer ${currentStatus?.color}`}
          aria-label="Statut de la chanson"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-studio-panel text-studio-text">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Last saved indicator */}
        {lastSaved && (
          <span className="text-xs text-studio-muted hidden sm:flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Sauvegardé {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-studio-border hover:border-studio-accent/50 rounded-lg text-studio-muted hover:text-studio-text transition-all"
            aria-label="Sauvegarder (Ctrl+S)"
            title="Sauvegarder (Ctrl+S)"
          >
            <Save size={13} />
            {isSaving ? "..." : "Sauv."}
          </button>

          <button
            onClick={toggleFlowMode}
            className="p-1.5 hover:bg-studio-hover rounded-lg text-studio-muted hover:text-studio-text transition-colors"
            aria-label="Mode Flow (plein écran)"
            title="Mode Flow"
          >
            <Maximize2 size={16} />
          </button>

          <button
            onClick={handleGeneratePrompt}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-60 rounded-lg text-white text-xs font-medium transition-colors"
            aria-label="Générer prompt Suno (Ctrl+Enter)"
            title="Générer prompt Suno (Ctrl+Enter)"
          >
            <Zap size={13} />
            {isGenerating ? "Génération..." : "COPY FOR SUNO"}
          </button>
        </div>
      </header>

      {/* Modal prompt généré */}
      {showPromptModal && generatedPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPromptModal(false)}>
          <div
            className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-studio-border">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-studio-accent" />
                <h2 className="font-semibold text-studio-text">Prompt Suno AI généré</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 bg-studio-accent hover:bg-studio-accent-dim rounded-lg text-white text-sm font-medium transition-colors"
                >
                  📋 Copier
                </button>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="p-1.5 hover:bg-studio-hover rounded-lg text-studio-muted transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-y-auto p-4 text-xs text-studio-text font-mono leading-relaxed whitespace-pre-wrap">
              {generatedPrompt}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
