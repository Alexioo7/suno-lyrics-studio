/**
 * Store Zustand pour l'état global de l'éditeur.
 * Centralize la gestion des blocs, mode flow, et sauvegarde.
 */
"use client";

import { create } from "zustand";
import type { Block, Song } from "@/types";

interface EditorState {
  currentSong: Song | null;
  blocks: Block[];
  isFlowMode: boolean;
  isSaving: boolean;
  selectedBlockId: string | null;
  lastSaved: Date | null;

  // Actions
  setCurrentSong: (song: Song) => void;
  setBlocks: (blocks: Block[]) => void;
  toggleFlowMode: () => void;
  setIsSaving: (v: boolean) => void;
  setSelectedBlockId: (id: string | null) => void;
  updateBlockContent: (id: string, content: string) => void;
  reorderBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  setLastSaved: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentSong: null,
  blocks: [],
  isFlowMode: false,
  isSaving: false,
  selectedBlockId: null,
  lastSaved: null,

  setCurrentSong: (song) => set({ currentSong: song }),
  setBlocks: (blocks) => set({ blocks }),
  toggleFlowMode: () => set((state) => ({ isFlowMode: !state.isFlowMode })),
  setIsSaving: (v) => set({ isSaving: v }),
  setSelectedBlockId: (id) => set({ selectedBlockId: id }),

  updateBlockContent: (id, content) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
    })),

  reorderBlocks: (blocks) => set({ blocks }),

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block].sort((a, b) => a.order - b.order),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
    })),

  setLastSaved: () => set({ lastSaved: new Date() }),
}));
