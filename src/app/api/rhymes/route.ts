/**
 * API /api/rhymes?word=xxx
 * Retourne des rimes pour un mot donné.
 */
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

    const rhymes = findRhymes(word.trim(), limit);
    return NextResponse.json({ word, rhymes });
  } catch (error) {
    console.error("GET /api/rhymes error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
