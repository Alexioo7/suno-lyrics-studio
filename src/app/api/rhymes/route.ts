import { NextRequest, NextResponse } from "next/server";
import { findRhymes } from "@/lib/utils/rhyme-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get("word");
    const limit = parseInt(searchParams.get("limit") ?? "15");

    if (!word) {
      return NextResponse.json({ error: "Paramètre 'word' requis" }, { status: 400 });
    }

    const cleanWord = word.trim();

    // 1. Essayer Datamuse avec langue française
    try {
      const res1 = await fetch(
        `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(cleanWord)}&max=${limit}&v=fr`,
        { next: { revalidate: 3600 } }
      );
      const data1 = await res1.json();
      if (Array.isArray(data1) && data1.length > 0) {
        return NextResponse.json({
          word: cleanWord,
          source: "datamuse",
          rhymes: data1.map((item: { word: string; score: number }) => ({
            word: item.word,
            type: item.score > 1000 ? "perfect" : "approximate",
          })),
        });
      }
    } catch { /* continue */ }

    // 2. Essayer Datamuse sans langue (capte plus de mots)
    try {
      const res2 = await fetch(
        `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(cleanWord)}&max=${limit}`,
        { next: { revalidate: 3600 } }
      );
      const data2 = await res2.json();
      if (Array.isArray(data2) && data2.length > 0) {
        return NextResponse.json({
          word: cleanWord,
          source: "datamuse",
          rhymes: data2.map((item: { word: string; score: number }) => ({
            word: item.word,
            type: item.score > 1000 ? "perfect" : "approximate",
          })),
        });
      }
    } catch { /* continue */ }

    // 3. Fallback : dictionnaire local
    const rhymes = findRhymes(cleanWord, limit);
    return NextResponse.json({ word: cleanWord, source: "local", rhymes });

  } catch (error) {
    console.error("GET /api/rhymes error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}