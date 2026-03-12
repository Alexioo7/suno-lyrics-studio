/**
 * API /api/analyze-lyrics
 * Analyse les paroles : émotions, répétitions, chantabilité, syllabes.
 */
import { NextRequest, NextResponse } from "next/server";
import { analyzeEmotion, findNgrams, topWords } from "@/lib/utils/emotion-analyzer";
import { analyzeLines, calculateSingabilityScore } from "@/lib/utils/syllable-counter";
import type { AnalyzeLyricsInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeLyricsInput = await req.json();
    const { lyrics } = body;

    if (!lyrics || lyrics.trim() === "") {
      return NextResponse.json({ error: "Paroles requises" }, { status: 400 });
    }

    // Analyser les émotions
    const emotionScore = analyzeEmotion(lyrics);

    // Répétitions (bigrammes + trigrammes)
    const bigrams = findNgrams(lyrics, 2, 5);
    const trigrams = findNgrams(lyrics, 3, 5);
    const repetitions = [...bigrams, ...trigrams]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top mots
    const topWordsList = topWords(lyrics, 10);

    // Syllabes par ligne
    const syllablesPerLine = analyzeLines(lyrics);

    // Score de chantabilité
    const scoreChantabilite = calculateSingabilityScore(syllablesPerLine);

    return NextResponse.json({
      scoreChantabilite,
      scoreEmotion: {
        positive: emotionScore.positive,
        negative: emotionScore.negative,
        neutral: emotionScore.neutral,
      },
      emotionDominant: emotionScore.dominant,
      emotionIntensity: emotionScore.intensity,
      topWords: topWordsList,
      repetitions,
      syllablesPerLine: syllablesPerLine.slice(0, 20), // Limiter pour la réponse
    });
  } catch (error) {
    console.error("POST /api/analyze-lyrics error:", error);
    return NextResponse.json({ error: "Erreur analyse" }, { status: 500 });
  }
}
