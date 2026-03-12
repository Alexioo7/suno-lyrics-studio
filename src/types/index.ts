/**
 * Types TypeScript partagés dans l'ensemble de l'application.
 * Synchronisés avec le schéma Prisma.
 */

// ─── Modèles de base ─────────────────────────────────────────────────────────

export type BlockType = "verse" | "chorus" | "bridge" | "intro" | "outro" | "other";

export type SongStatus = "idea" | "drafting" | "generated" | "published";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  content: string; // JSON TipTap stringifié
  color?: string | null;
  songId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Version {
  id: string;
  label: string;
  snapshot: string; // JSON stringifié
  createdAt: string;
  songId: string;
}

export interface PromptHistory {
  id: string;
  prompt: string;
  metadata?: string | null;
  createdAt: string;
  songId: string;
  userId: string;
}

export interface Song {
  id: string;
  title: string;
  description?: string | null;
  status: SongStatus;
  style?: string | null;
  mood?: string | null;
  tempo?: number | null;
  voice?: string | null;
  durationEstimate?: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  blocks?: Block[];
  tags?: { tag: Tag }[];
  versions?: Version[];
}

// ─── Payloads API ─────────────────────────────────────────────────────────────

export interface GenerateSunoPromptInput {
  songId?: string;
  rawLyrics?: string;
  metadata?: {
    style?: string;
    mood?: string;
    tempo?: number;
    voice?: string;
    durationEstimate?: number;
    title?: string;
  };
}

export interface GenerateSunoPromptOutput {
  prompt: string;
  metadata: {
    estimatedBPM: number;
    estimatedDuration: string;
    voice: string;
    style: string;
    mood: string;
  };
}

export interface AnalyzeLyricsInput {
  lyrics: string;
}

export interface AnalyzeLyricsOutput {
  scoreChantabilite: number; // 0-100
  scoreEmotion: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topWords: { word: string; count: number }[];
  repetitions: { ngram: string; count: number }[];
  syllablesPerLine: { line: string; count: number }[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface EditorStore {
  currentSong: Song | null;
  blocks: Block[];
  isFlowMode: boolean;
  isSaving: boolean;
  selectedBlockId: string | null;
  setCurrentSong: (song: Song) => void;
  setBlocks: (blocks: Block[]) => void;
  setFlowMode: (v: boolean) => void;
  setIsSaving: (v: boolean) => void;
  setSelectedBlockId: (id: string | null) => void;
  updateBlock: (id: string, content: string) => void;
}

export interface RhymeResult {
  word: string;
  type: "perfect" | "approximate" | "multisyllabic";
}
