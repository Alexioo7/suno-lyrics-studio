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

    const cleanWord = word.trim().toLowerCase();

    // Utiliser Mistral AI pour les rimes françaises
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "user",
              content: `Donne-moi exactement ${limit} mots français qui riment avec "${cleanWord}". 
              Réponds UNIQUEMENT avec les mots séparés par des virgules, sans explication, sans numérotation.
              Exemple de format attendu : mot1, mot2, mot3`
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      if (content) {
        const rhymes = content
          .split(",")
          .map((w: string) => w.trim().toLowerCase())
          .filter((w: string) => w.length > 0 && w !== cleanWord)
          .slice(0, limit)
          .map((w: string) => ({ word: w, type: "perfect" as const }));

        if (rhymes.length > 0) {
          return NextResponse.json({ word: cleanWord, rhymes });
        }
      }
    } catch { /* fallback */ }

    // Fallback dictionnaire local
    const rhymes = findRhymes(cleanWord, limit);
    return NextResponse.json({ word: cleanWord, rhymes });

  } catch (error) {
    console.error("GET /api/rhymes error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}