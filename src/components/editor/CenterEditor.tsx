/**
 * Colonne centrale : éditeur de blocs structurés.
 * Chaque bloc (verse/chorus/bridge) est une instance TipTap indépendante.
 */
"use client";

import { useState, useCallback } from "react";
import { Plus, GripVertical, Copy, Trash2, ChevronDown } from "lucide-react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import BlockEditor from "./BlockEditor";
import SongTimeline from "./SongTimeline";
import type { Block, BlockType, Song } from "@/types";

const BLOCK_TYPES: { type: BlockType; label: string; color: string }[] = [
  { type: "intro", label: "Intro", color: "#0891b2" },
  { type: "verse", label: "Verse", color: "#1d4ed8" },
  { type: "chorus", label: "Chorus", color: "#4f46e5" },
  { type: "bridge", label: "Bridge", color: "#7c3aed" },
  { type: "outro", label: "Outro", color: "#475569" },
  { type: "other", label: "Autre", color: "#6b6b8a" },
];

interface CenterEditorProps {
  song: Song;
}

export default function CenterEditor({ song }: CenterEditorProps) {
  const { blocks, addBlock, removeBlock, reorderBlocks } = useEditorStore();
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Ajouter un nouveau bloc
  const handleAddBlock = useCallback(
    async (type: BlockType) => {
      setIsAddingBlock(false);
      try {
        const res = await fetch(`/api/songs/${song.id}/blocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, order: blocks.length }),
        });
        const data = await res.json();
        if (data.block) {
          addBlock(data.block);
        }
      } catch (err) {
        console.error("Erreur ajout bloc:", err);
      }
    },
    [song.id, blocks.length, addBlock]
  );

  // Supprimer un bloc
  const handleDeleteBlock = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer ce bloc ?")) return;
      try {
        await fetch(`/api/songs/${song.id}/blocks?blockId=${id}`, { method: "DELETE" });
        removeBlock(id);
      } catch (err) {
        console.error("Erreur suppression bloc:", err);
      }
    },
    [song.id, removeBlock]
  );

  // Dupliquer un bloc
  const handleDuplicateBlock = useCallback(
    async (block: Block) => {
      try {
        const res = await fetch(`/api/songs/${song.id}/blocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: block.type,
            content: block.content,
            order: block.order + 0.5,
          }),
        });
        const data = await res.json();
        if (data.block) {
          addBlock(data.block);
        }
      } catch (err) {
        console.error("Erreur duplication bloc:", err);
      }
    },
    [song.id, addBlock]
  );

  // Drag and drop
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = useCallback(
    async (targetId: string) => {
      if (!draggedId || draggedId === targetId) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }

      const newBlocks = [...blocks];
      const fromIdx = newBlocks.findIndex((b) => b.id === draggedId);
      const toIdx = newBlocks.findIndex((b) => b.id === targetId);

      if (fromIdx < 0 || toIdx < 0) return;

      const [moved] = newBlocks.splice(fromIdx, 1);
      newBlocks.splice(toIdx, 0, moved);

      // Renuméroter
      const reordered = newBlocks.map((b, i) => ({ ...b, order: i }));
      reorderBlocks(reordered);

      // Persister
      try {
        await fetch(`/api/songs/${song.id}/blocks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: reordered.map((b) => b.id) }),
        });
      } catch (err) {
        console.error("Erreur réordonnancement:", err);
      }

      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId, blocks, reorderBlocks, song.id]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Timeline */}
      <div className="px-6 pt-4 pb-2 border-b border-studio-border">
        <SongTimeline blocks={blocks} />
      </div>

      {/* Header chanson */}
      <div className="px-6 py-4">
        <h2 className="font-display text-2xl font-bold text-studio-text">{song.title}</h2>
        {song.description && (
          <p className="text-sm text-studio-muted mt-1">{song.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {song.style && (
            <span className="text-xs bg-studio-panel border border-studio-border rounded-full px-2 py-0.5 text-studio-muted">
              {song.style}
            </span>
          )}
          {song.mood && (
            <span className="text-xs bg-studio-panel border border-studio-border rounded-full px-2 py-0.5 text-studio-muted">
              {song.mood}
            </span>
          )}
          {song.tempo && (
            <span className="text-xs font-mono text-studio-muted">{song.tempo} BPM</span>
          )}
        </div>
      </div>

      {/* Blocs */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-studio-muted">
            <p className="text-lg mb-2">Commencez à écrire</p>
            <p className="text-sm opacity-60">Ajoutez un premier bloc ci-dessous</p>
          </div>
        ) : (
          blocks.map((block) => {
            const typeConfig = BLOCK_TYPES.find((t) => t.type === block.type) ?? BLOCK_TYPES[1];
            const isDragging = draggedId === block.id;
            const isDragOver = dragOverId === block.id;

            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => handleDragStart(block.id)}
                onDragOver={(e) => handleDragOver(e, block.id)}
                onDrop={() => handleDrop(block.id)}
                onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                className={`group relative rounded-xl border transition-all duration-200 ${
                  isDragging ? "opacity-40 scale-[0.98]" : ""
                } ${
                  isDragOver ? "border-studio-accent/70 shadow-lg shadow-studio-accent/10" : "border-studio-border"
                }`}
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: block.color ?? typeConfig.color,
                }}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-studio-panel/50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <GripVertical
                      size={14}
                      className="text-studio-muted opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                    />
                    <BlockTypeSelector
                      currentType={block.type as BlockType}
                      blockId={block.id}
                      songId={song.id}
                      color={typeConfig.color}
                    />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicateBlock(block)}
                      className="p-1 hover:bg-studio-hover rounded text-studio-muted hover:text-studio-text transition-colors"
                      aria-label="Dupliquer le bloc"
                      title="Dupliquer"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1 hover:bg-red-500/10 rounded text-studio-muted hover:text-red-400 transition-colors"
                      aria-label="Supprimer le bloc"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* TipTap Editor */}
                <div className="bg-studio-panel rounded-b-xl">
                  <BlockEditor block={block} songId={song.id} />
                </div>
              </div>
            );
          })
        )}

        {/* Add Block */}
        {isAddingBlock ? (
          <div className="bg-studio-panel border border-studio-border rounded-xl p-3 animate-fade-in">
            <p className="text-xs text-studio-muted mb-2">Type de bloc</p>
            <div className="grid grid-cols-3 gap-2">
              {BLOCK_TYPES.map(({ type, label, color }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-studio-border hover:border-studio-accent/50 text-xs text-studio-text hover:text-studio-accent transition-colors"
                  style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsAddingBlock(false)}
              className="mt-2 text-xs text-studio-muted hover:text-studio-text w-full text-center py-1"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingBlock(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-studio-border hover:border-studio-accent/50 rounded-xl text-studio-muted hover:text-studio-accent text-sm transition-colors"
          >
            <Plus size={16} />
            Ajouter un bloc
          </button>
        )}
      </div>
    </div>
  );
}

// Sélecteur de type de bloc inline
function BlockTypeSelector({
  currentType,
  blockId,
  songId,
  color,
}: {
  currentType: BlockType;
  blockId: string;
  songId: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  const changeType = async (type: BlockType) => {
    setOpen(false);
    try {
      await fetch(`/api/songs/${songId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: [{ id: blockId, content: undefined, type }] }),
      });
    } catch (err) {
      console.error("Erreur changement type:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-studio-text"
        style={{ color }}
      >
        {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-studio-panel border border-studio-border rounded-lg py-1 z-10 shadow-xl min-w-[100px]">
          {BLOCK_TYPES.map(({ type, label, color: c }) => (
            <button
              key={type}
              onClick={() => changeType(type)}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-studio-hover text-studio-text transition-colors"
              style={{ borderLeftColor: c }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
