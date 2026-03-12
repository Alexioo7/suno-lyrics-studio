import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, theme, style, text, mode } = await req.json();

    let prompt = "";

    if (type === "hooks") {
      prompt = `Tu es un parolier expert en musique française. Génère 10 hooks/punchlines percutants pour une chanson sur le thème "${theme}" dans un style "${style}". Chaque hook doit être une phrase courte et mémorable. Réponds avec exactement 10 lignes, une par hook, sans numérotation ni tiret.`;
    } else if (type === "titles") {
      prompt = `Tu es un parolier expert en musique française. Génère 10 titres de chansons originaux sur le thème "${theme}" dans un style "${style}". Titres courts (2-5 mots), évocateurs. Réponds avec 10 lignes, un titre par ligne, sans numérotation ni tiret.`;
    } else if (type === "ideas20") {
      prompt = `Tu es un parolier expert en musique française. Génère 20 idées de chansons sur le thème "${theme}" dans un style "${style}". Format exact : Titre — Hook. Sans numérotation, une idée par ligne.`;
    } else if (type === "rewrite") {
      const modes: Record<string, string> = {
        poetique: "plus poétique avec des métaphores",
        sombre: "plus sombre et mélancolique",
        simple: "plus simple et direct",
        intense: "plus intense et émotionnel",
      };
      prompt = `Tu es un parolier expert. Réécris ce texte en version ${modes[mode] ?? mode}. Réponds UNIQUEMENT avec le texte réécrit.\n\nTexte original :\n${text}`;
    }

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return NextResponse.json({ error: "Pas de réponse" }, { status: 500 });
    }

    const lines = content
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    return NextResponse.json({ results: lines, raw: content });

  } catch (error) {
    console.error("Erreur generate-ideas:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}