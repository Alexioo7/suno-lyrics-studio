/**
 * Éditeur TipTap pour un bloc individuel.
 * Affiche le compteur de syllabes par ligne + barre de flow.
 */
"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEditorStore } from "@/lib/hooks/use-editor-store";
import { countSyllablesInLine, analyzeLines } from "@/lib/utils/syllable-counter";
import type { Block } from "@/types";

const BLOCK_PLACEHOLDERS: Record<string, string> = {
  verse: "Écrivez ici vos paroles de couplet...",
  chorus: "Le refrain, le cœur de votre chanson...",
  bridge: "Rupture harmonique, moment de suspension...",
  intro: "L'atmosphère du début...",
  outro: "La conclusion, le fade-out...",
  other: "Écrivez ici...",
};

interface BlockEditorProps {
  block: Block;
  songId: string;
}

export default function BlockEditor({ block, songId }: BlockEditorProps) {
  const { updateBlockContent, setSelectedBlockId } = useEditorStore();

  // Parser le contenu initial
  const initialContent = useMemo(() => {
    try {
      return JSON.parse(block.content);
    } catch {
      return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: block.content }] }] };
    }
  }, [block.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactiver les éléments non pertinents pour les paroles
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder: BLOCK_PLACEHOLDERS[block.type] ?? BLOCK_PLACEHOLDERS.other,
      }),
      CharacterCount,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      updateBlockContent(block.id, json);
      // Debounce la sauvegarde
      scheduleBlockSave(block.id, songId, json);
    },
    onFocus: () => {
      setSelectedBlockId(block.id);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
        "aria-label": `Éditeur bloc ${block.type}`,
      },
    },
  });

  // Extraire le texte brut pour les syllabes
  const plainText = editor?.getText() ?? "";
  const lines = analyzeLines(plainText).filter((l) => l.line.trim() !== "");
  const maxSyllables = Math.max(...lines.map((l) => l.count), 1);

  return (
    <div className="p-4">
      {/* Éditeur */}
      <div className="relative">
        <EditorContent editor={editor} className="min-h-[80px]" />
      </div>

      {/* Syllabes + Flow bars */}
      {lines.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-studio-border/50 pt-3">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Barre de flow */}
              <div className="flex-1 h-1.5 bg-studio-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(line.count / maxSyllables) * 100}%`,
                    background: `linear-gradient(90deg, #6c63ff, #a855f7)`,
                  }}
                />
              </div>
              {/* Compteur syllabes */}
              <span className="text-xs font-mono text-studio-muted w-6 text-right shrink-0">
                {line.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats ligne */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-studio-muted">
          {editor?.storage.characterCount?.characters() ?? 0} car.
        </span>
        {lines.length > 0 && (
          <span className="text-xs text-studio-muted">
            {lines.length} ligne{lines.length > 1 ? "s" : ""} · {lines.reduce((a, b) => a + b.count, 0)} syll.
          </span>
        )}
      </div>
    </div>
  );
}

// Sauvegarde différée (debounce 800ms)
const saveTimers: Record<string, NodeJS.Timeout> = {};

function scheduleBlockSave(blockId: string, songId: string, content: string) {
  if (saveTimers[blockId]) clearTimeout(saveTimers[blockId]);
  saveTimers[blockId] = setTimeout(async () => {
    try {
      await fetch(`/api/songs/${songId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: [{ id: blockId, content }] }),
      });
    } catch (err) {
      console.error("Erreur sauvegarde bloc:", err);
    }
  }, 800);
}
