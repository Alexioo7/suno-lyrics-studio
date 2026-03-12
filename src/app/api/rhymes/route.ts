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
              content: `Tu es un expert en poésie et versification française.
Trouve ${limit} mots français qui riment VRAIMENT avec "${cleanWord}".

Règles strictes :
- Une vraie rime = même son final (ex: "fantastique" rime avec "mystique", "plastique", "magique")
- Privilégie les rimes riches (2+ sons en commun à la fin)
- Mots courants utilisables dans une chanson ou un poème
- PAS de mots inventés
- PAS de répétition du mot original

Réponds UNIQUEMENT avec les mots séparés par des virgules, rien d'autre.`
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