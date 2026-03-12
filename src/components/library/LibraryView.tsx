/**
 * Vue bibliothèque — liste, recherche, filtres, création.
 * Composant client avec état local.
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Music2, Plus, Search, Filter, Clock, Tag,
  MoreHorizontal, Trash2, Edit, ExternalLink,
  BookOpen, Zap, CheckCircle2, Lightbulb
} from "lucide-react";
import type { Song, SongStatus } from "@/types";

interface SongWithMeta extends Partial<Song> {
  id: string;
  title: string;
  status: SongStatus;
  updatedAt: string;
  _count?: { blocks: number };
  tags?: { tag: { id: string; name: string; color: string } }[];
}

interface LibraryViewProps {
  initialSongs: SongWithMeta[];
}

const STATUS_CONFIG: Record<SongStatus, { label: string; icon: React.ReactNode; color: string }> = {
  idea: { label: "Idée", icon: <Lightbulb size={12} />, color: "text-amber-400 bg-amber-400/10" },
  drafting: { label: "En cours", icon: <Edit size={12} />, color: "text-blue-400 bg-blue-400/10" },
  generated: { label: "Généré", icon: <Zap size={12} />, color: "text-violet-400 bg-violet-400/10" },
  published: { label: "Publié", icon: <CheckCircle2 size={12} />, color: "text-emerald-400 bg-emerald-400/10" },
};

export default function LibraryView({ initialSongs }: LibraryViewProps) {
  const router = useRouter();
  const [songs, setSongs] = useState<SongWithMeta[]>(initialSongs);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<SongStatus | "all">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filtered = songs.filter((s) => {
    const matchSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const createSong = useCallback(async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.song) {
        router.push(`/song/${data.song.id}`);
      }
    } catch (err) {
      console.error("Erreur création chanson:", err);
    }
  }, [newTitle, router]);

  const deleteSong = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette chanson ?")) return;
    await fetch(`/api/songs/${id}`, { method: "DELETE" });
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-studio-border px-6 py-4 flex items-center justify-between sticky top-0 bg-studio-bg/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-studio-accent/20 flex items-center justify-center">
            <Music2 size={18} className="text-studio-accent" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-studio-text leading-none">
              Suno Lyrics Studio
            </h1>
            <p className="text-xs text-studio-muted">Bibliothèque</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-studio-accent hover:bg-studio-accent-dim rounded-lg text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nouvelle chanson
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        {/* Create form */}
        {isCreating && (
          <div className="bg-studio-panel border border-studio-border rounded-xl p-4 animate-fade-in">
            <p className="text-sm text-studio-muted mb-3">Titre de la nouvelle chanson</p>
            <div className="flex gap-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createSong();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                placeholder="ex: Novembre dans mes veines..."
                className="flex-1 bg-studio-surface border border-studio-border rounded-lg px-3 py-2 text-studio-text placeholder:text-studio-muted text-sm focus:outline-none focus:border-studio-accent"
              />
              <button
                onClick={createSong}
                disabled={!newTitle.trim()}
                className="px-4 py-2 bg-studio-accent hover:bg-studio-accent-dim disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Créer
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 text-studio-muted hover:text-studio-text rounded-lg text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une chanson..."
              className="w-full bg-studio-panel border border-studio-border rounded-lg pl-9 pr-4 py-2 text-studio-text placeholder:text-studio-muted text-sm focus:outline-none focus:border-studio-accent"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "idea", "drafting", "generated", "published"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-studio-accent text-white"
                    : "bg-studio-panel text-studio-muted hover:text-studio-text border border-studio-border"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["idea", "drafting", "generated", "published"] as SongStatus[]).map((status) => {
            const count = songs.filter((s) => s.status === status).length;
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} className="bg-studio-panel border border-studio-border rounded-xl p-3">
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${cfg.color} px-2 py-0.5 rounded-full w-fit`}>
                  {cfg.icon}
                  {cfg.label}
                </div>
                <p className="text-2xl font-mono font-bold text-studio-text">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Song list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-studio-muted">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {songs.length === 0 ? "Aucune chanson" : "Aucun résultat"}
            </p>
            <p className="text-sm mt-1">
              {songs.length === 0
                ? "Créez votre première chanson pour commencer"
                : "Essayez un autre terme de recherche"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((song) => {
              const cfg = STATUS_CONFIG[song.status];
              return (
                <div
                  key={song.id}
                  onClick={() => router.push(`/song/${song.id}`)}
                  className="group bg-studio-panel border border-studio-border hover:border-studio-accent/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-studio-accent/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        {song.style && (
                          <span className="text-xs text-studio-muted bg-studio-surface px-2 py-0.5 rounded-full">
                            {song.style}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-studio-text font-semibold truncate group-hover:text-studio-accent transition-colors">
                        {song.title}
                      </h3>
                      {song.description && (
                        <p className="text-xs text-studio-muted mt-1 truncate">{song.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {song._count && (
                          <span className="text-xs text-studio-muted flex items-center gap-1">
                            <Music2 size={11} />
                            {song._count.blocks} bloc{song._count.blocks !== 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="text-xs text-studio-muted flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(song.updatedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {song.tags && song.tags.length > 0 && (
                          <div className="flex gap-1">
                            {song.tags.slice(0, 3).map(({ tag }) => (
                              <span
                                key={tag.id}
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{ background: tag.color + "22", color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/song/${song.id}`);
                        }}
                        className="p-2 hover:bg-studio-hover rounded-lg text-studio-muted hover:text-studio-text transition-colors"
                        aria-label="Ouvrir"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={(e) => deleteSong(song.id, e)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-studio-muted hover:text-red-400 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
