"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Music2, History, Settings, RotateCcw, Save } from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import type { Song } from "@/types";

interface LeftPanelProps {
  song: Song & {
    versions?: Array<{ id: string; label: string; createdAt: string }>;
  };
}

const STYLES = ["pop","rap","chanson française","UK drill","R&B","rock","hyperpop","reggaeton","afrobeat","folk","electro","jazz","soul","country","metal"];
const MOODS = ["happy","sad","melancholic","dark","energetic","romantic","angry","hopeful","nostalgic","dreamy","intense","chill"];
const VOICES = [
  { value: "male", label: "Masculine" },
  { value: "female", label: "Féminine" },
  { value: "androgynous", label: "Androgyne" },
];

export default function LeftPanel({ song }: LeftPanelProps) {
  const router = useRouter();
  const { setCurrentSong, currentSong } = useEditorStore();
  const [activeTab, setActiveTab] = useState<"versions" | "meta">("meta");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fields, setFields] = useState({
    artist: (song as any).artist ?? "",
    title: song.title ?? "",
    description: song.description ?? "",
    style: song.style ?? "",
    mood: song.mood ?? "",
    tempo: song.tempo?.toString() ?? "",
    voice: song.voice ?? "",
    durationEstimate: song.durationEstimate?.toString() ?? "",
  });

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist: fields.artist || null,
          title: fields.title,
          description: fields.description || null,
          style: fields.style || null,
          mood: fields.mood || null,
          tempo: fields.tempo ? parseInt(fields.tempo) : null,
          voice: fields.voice || null,
          durationEstimate: fields.durationEstimate ? parseInt(fields.durationEstimate) : null,
        }),
      });
      setCurrentSong({ ...song, ...fields, tempo: fields.tempo ? parseInt(fields.tempo) : null } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    } finally {
      setIsSaving(false);
    }
  }, [fields, song, setCurrentSong]);

  return (
    <div className="h-full flex flex-col bg-studio-surface/50">
      <div className="flex border-b border-studio-border">
        {[
          { key: "meta" as const, label: "Paramètres", icon: <Settings size={14} /> },
          { key: "versions" as const, label: "Versions", icon: <History size={14} /> },
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

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === "meta" ? (
          <>
            <Field label="Artiste" value={fields.artist} onChange={(v) => handleChange("artist", v)} placeholder="Nom de l'artiste..." />
            <Field label="Titre" value={fields.title} onChange={(v) => handleChange("title", v)} placeholder="Titre de la chanson..." />
            <Field label="Description" value={fields.description} onChange={(v) => handleChange("description", v)} placeholder="Description..." textarea />

            <div>
              <p className="text-xs text-studio-muted mb-1">Style musical</p>
              <select
                value={fields.style}
                onChange={(e) => handleChange("style", e.target.value)}
                className="w-full bg-studio-panel border border-studio-border rounded-lg px-2 py-1.5 text-xs text-studio-text focus:outline-none focus:border-studio-accent"
              >
                <option value="">— Choisir —</option>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <p className="text-xs text-studio-muted mb-1">Mood</p>
              <select
                value={fields.mood}
                onChange={(e) => handleChange("mood", e.target.value)}
                className="w-full bg-studio-panel border border-studio-border rounded-lg px-2 py-1.5 text-xs text-studio-text focus:outline-none focus:border-studio-accent"
              >
                <option value="">— Choisir —</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <p className="text-xs text-studio-muted mb-1">Voix</p>
              <select
                value={fields.voice}
                onChange={(e) => handleChange("voice", e.target.value)}
                className="w-full bg-studio-panel border border-studio-border rounded-lg px-2 py-1.5 text-xs text-studio-text focus:outline-none focus:border-studio-accent"
              >
                <option value="">— Choisir —</option>
                {VOICES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>

            <Field label="Tempo (BPM)" value={fields.tempo} onChange={(v) => handleChange("tempo", v)} placeholder="ex: 120" type="number" />
            <Field label="Durée estimée (secondes)" value={fields.durationEstimate} onChange={(v) => handleChange("durationEstimate", v)} placeholder="ex: 210" type="number" />

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-studio-accent hover:bg-studio-accent-dim text-white"
              }`}
            >
              <Save size={14} />
              {saved ? "✓ Sauvegardé !" : isSaving ? "..." : "Sauvegarder"}
            </button>
          </>
        ) : (
          <VersionsList versions={song.versions ?? []} />
        )}
      </div>

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

function Field({ label, value, onChange, placeholder, textarea, type }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <p className="text-xs text-studio-muted mb-1">{label}</p>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-studio-panel border border-studio-border rounded-lg px-2 py-1.5 text-xs text-studio-text placeholder:text-studio-muted focus:outline-none focus:border-studio-accent resize-none"
        />
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-studio-panel border border-studio-border rounded-lg px-2 py-1.5 text-xs text-studio-text placeholder:text-studio-muted focus:outline-none focus:border-studio-accent"
        />
      )}
    </div>
  );
}

function VersionsList({ versions }: { versions: Array<{ id: string; label: string; createdAt: string }> }) {
  return (
    <div>
      <p className="text-xs font-medium text-studio-muted uppercase tracking-wider mb-2 px-1">Historique</p>
      {versions.length === 0 ? (
        <p className="text-xs text-studio-muted text-center py-4">Aucune version sauvegardée.</p>
      ) : (
        <div className="space-y-1">
          {versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-studio-hover group cursor-pointer">
              <div>
                <p className="text-xs text-studio-text">{v.label}</p>
                <p className="text-xs text-studio-muted">{new Date(v.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-studio-panel rounded text-studio-muted transition-all" title="Restaurer">
                <RotateCcw size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}