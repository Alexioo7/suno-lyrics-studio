/**
 * Layout 3 colonnes de l'éditeur de chanson.
 * Gestion du mode Flow (plein écran) via store Zustand.
 */
"use client";

import { useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import LeftPanel from "./LeftPanel";
import CenterEditor from "./CenterEditor";
import RightPanel from "@/components/tools/RightPanel";
import FlowMode from "./FlowMode";
import TopBar from "./TopBar";
import type { Song, Block } from "@/types";

interface SongEditorLayoutProps {
  song: Song & {
    blocks: Block[];
    user?: { id: string; name?: string | null; email: string };
    versions?: Array<{ id: string; label: string; createdAt: string }>;
    promptHistory?: Array<{ id: string; prompt: string; createdAt: string }>;
  };
}

export default function SongEditorLayout({ song }: SongEditorLayoutProps) {
  const { setCurrentSong, setBlocks, isFlowMode } = useEditorStore();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialiser le store avec les données de la chanson
  useEffect(() => {
    setCurrentSong(song);
    setBlocks(song.blocks || []);
  }, [song, setCurrentSong, setBlocks]);

  // Hotkey handler global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "k") {
        e.preventDefault();
        // TODO: ouvrir la palette de commandes
        console.log("Quick search");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isFlowMode) {
    return <FlowMode song={song} />;
  }

  return (
    <div className="h-screen flex flex-col bg-studio-bg overflow-hidden">
      {/* Barre supérieure */}
      <TopBar song={song} />

      {/* Layout 3 colonnes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Colonne gauche : bibliothèque / versions */}
        <aside className="w-64 xl:w-72 border-r border-studio-border flex-shrink-0 overflow-y-auto hidden md:block">
          <LeftPanel song={song} />
        </aside>

        {/* Colonne centrale : éditeur */}
        <main className="flex-1 overflow-y-auto">
          <CenterEditor song={song} />
        </main>

        {/* Colonne droite : outils IA */}
        <aside className="w-72 xl:w-80 border-l border-studio-border flex-shrink-0 overflow-y-auto hidden lg:block">
          <RightPanel song={song} />
        </aside>
      </div>
    </div>
  );
}
