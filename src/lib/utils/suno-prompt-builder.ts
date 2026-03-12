/**
 * Générateur de prompts optimisés pour Suno AI.
 * Prend les métadonnées et les paroles pour construire un prompt structuré.
 */

import type { Block, Song } from "@/types";

export interface PromptBuilderOptions {
  title: string;
  lyrics: string;
  blocks?: Block[];
  style?: string;
  mood?: string;
  tempo?: number;
  voice?: string;
  durationEstimate?: number;
}

const MOOD_DESCRIPTORS: Record<string, string> = {
  melancholic: "mélancolique, nostalgique, introspectif",
  dark: "sombre, menaçant, atmosphérique",
  happy: "joyeux, énergique, lumineux",
  energetic: "dynamique, percutant, intense",
  romantic: "romantique, doux, passionné",
  angry: "agressif, raw, tendu",
  hopeful: "optimiste, montant, inspirant",
};

const VOICE_DESCRIPTORS: Record<string, string> = {
  male: "voix masculine, profonde, émotionnelle",
  female: "voix féminine, claire, expressive",
  androgynous: "voix androgyne, neutre, moderne",
};

const STYLE_ARRANGEMENTS: Record<string, string> = {
  "chanson française": "guitare acoustique, cordes légères, accordéon subtil, production épurée",
  "UK drill": "808 slidants, hi-hats off-beat, synthés froids, basses lourdes, sample drill",
  hyperpop: "production distordue, auto-tune extrême, drums trap accélérés, synthés saturés",
  pop: "production moderne, drums mid-tempo, synthés polished, guitare légère",
  rap: "boom bap ou trap, sample flipper, 808 secs, hi-hats rapides",
  rnb: "production soul, basses rondes, guitare funky, voix harmonisées",
  rock: "guitares électriques, batterie live, basse groovy, mix saturé",
};

/**
 * Construit un prompt Suno AI complet et optimisé.
 */
export function buildSunoPrompt(options: PromptBuilderOptions): string {
  const {
    title,
    lyrics,
    blocks = [],
    style = "pop",
    mood = "neutral",
    tempo,
    voice = "female",
    durationEstimate,
  } = options;

  const moodDesc = MOOD_DESCRIPTORS[mood] ?? mood;
  const voiceDesc = VOICE_DESCRIPTORS[voice] ?? voice;
  const arrangement = STYLE_ARRANGEMENTS[style] ?? style;
  const estimatedBPM = tempo ?? estimateBPM(style, mood);
  const durationStr = durationEstimate
    ? formatDuration(durationEstimate)
    : "3 min 30";

  // Construire la structure basée sur les blocs
  const structure = buildStructureFromBlocks(blocks, lyrics);

  const prompt = `[Suno AI Prompt — "${title}"]

== STYLE & PRODUCTION ==
Genre: ${style}
Arrangement: ${arrangement}
Tempo: ${estimatedBPM} BPM
Durée estimée: ${durationStr}
Mood: ${moodDesc}

== VOIX ==
${voiceDesc}
Dynamique: chuchoter sur les verses, intensifier sur le chorus, lâcher tout sur le bridge
Pas de parlé-rap sauf indication contraire

== STRUCTURE ==
${structure}

== PAROLES ==
${lyrics}

== INSTRUCTIONS SUNO ==
- Intro instrumentale de 4-8 mesures avant le premier verse
- Transition marquée entre verse et chorus (montée en puissance)
- Bridge: rupture harmonique, atmosphère différente
- Outro: fade out instrumental ou reprise du hook à voix nue
- Variations subtiles entre chorus 1 et chorus 2 (add harmonies, layer)
- Ne pas déformer les paroles, les respecter telles quelles

[/Suno AI Prompt]`;

  return prompt;
}

function buildStructureFromBlocks(blocks: Block[], rawLyrics: string): string {
  if (blocks.length > 0) {
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const parts = sorted.map((b) => {
      const label = b.type.toUpperCase();
      return `[${label}]`;
    });
    return parts.join(" → ");
  }

  // Fallback : détecter la structure dans les paroles brutes
  const hasChorus = rawLyrics.toLowerCase().includes("[chorus]") ||
    rawLyrics.toLowerCase().includes("[refrain]");
  const hasBridge = rawLyrics.toLowerCase().includes("[bridge]");

  if (hasChorus) {
    return "[INTRO] → [VERSE 1] → [CHORUS] → [VERSE 2] → [CHORUS] → " +
      (hasBridge ? "[BRIDGE] → " : "") + "[CHORUS x2] → [OUTRO]";
  }
  return "[INTRO] → [VERSE 1] → [VERSE 2] → [VERSE 3] → [OUTRO]";
}

function estimateBPM(style: string, mood: string): number {
  const styleBPM: Record<string, number> = {
    "UK drill": 140,
    "hyperpop": 128,
    "chanson française": 72,
    "pop": 110,
    "rap": 95,
    "rnb": 85,
    "rock": 120,
  };

  const moodModifier: Record<string, number> = {
    melancholic: -10,
    dark: -5,
    happy: +10,
    energetic: +15,
    angry: +10,
  };

  const base = styleBPM[style] ?? 100;
  const mod = moodModifier[mood] ?? 0;
  return Math.round(base + mod);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${s.toString().padStart(2, "0")}`;
}

/**
 * Extrait le texte brut des blocs TipTap JSON.
 */
export function extractLyricsFromBlocks(blocks: Block[]): string {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return sorted
    .map((block) => {
      let blockText = "";
      try {
        const doc = JSON.parse(block.content);
        blockText = extractTextFromTipTap(doc);
      } catch {
        blockText = block.content;
      }
      return `[${block.type.toUpperCase()}]\n${blockText}`;
    })
    .join("\n\n");
}

function extractTextFromTipTap(doc: Record<string, unknown>): string {
  if (!doc || typeof doc !== "object") return "";

  const content = doc.content as Array<Record<string, unknown>> | undefined;
  if (!content) return "";

  return content
    .map((node) => {
      if (node.type === "text") return (node.text as string) ?? "";
      if (node.content) return extractTextFromTipTap(node);
      return "";
    })
    .join(node => (node === "paragraph" ? "\n" : ""))
    // En fait, relier les paragraphes par \n
    .replace(/\n+/g, "\n");
}

// Correction de la fonction extractTextFromTipTap
export function extractText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const d = doc as Record<string, unknown>;
  if (d.type === "text") return String(d.text ?? "");
  const content = d.content as Array<unknown> | undefined;
  if (!content) return "";
  return content
    .map((node) => {
      const n = node as Record<string, unknown>;
      if (n.type === "text") return String(n.text ?? "");
      if (n.type === "paragraph") return extractText(n) + "\n";
      return extractText(n);
    })
    .join("");
}
