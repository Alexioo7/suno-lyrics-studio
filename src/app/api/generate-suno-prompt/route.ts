/**
 * API /api/generate-suno-prompt
 * Génère un prompt optimisé pour Suno AI à partir d'une chanson ou de paroles brutes.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";
import { buildSunoPrompt, extractLyricsFromBlocks } from "@/lib/utils/suno-prompt-builder";
import type { GenerateSunoPromptInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateSunoPromptInput = await req.json();
    const { songId, rawLyrics, metadata } = body;

    let lyrics = rawLyrics ?? "";
    let title = metadata?.title ?? "Sans titre";
    let style = metadata?.style ?? "pop";
    let mood = metadata?.mood ?? "neutral";
    let tempo = metadata?.tempo;
    let voice = metadata?.voice ?? "female";
    let durationEstimate = metadata?.durationEstimate;
    let blocks: Awaited<ReturnType<typeof prisma.block.findMany>> = [];

    // Si un songId est fourni, charger depuis la DB
    if (songId) {
      const song = await prisma.song.findUnique({
        where: { id: songId },
        include: { blocks: { orderBy: { order: "asc" } } },
      });

      if (!song) {
        return NextResponse.json({ error: "Chanson introuvable" }, { status: 404 });
      }

      title = song.title;
      style = song.style ?? style;
      mood = song.mood ?? mood;
      tempo = song.tempo ?? tempo;
      voice = song.voice ?? voice;
      durationEstimate = song.durationEstimate ?? durationEstimate;
      blocks = song.blocks;

      // Extraire le texte des blocs TipTap
      lyrics = extractLyricsFromBlocks(song.blocks as Parameters<typeof extractLyricsFromBlocks>[0]);
    }

    if (!lyrics && blocks.length === 0) {
      return NextResponse.json({ error: "Paroles ou songId requis" }, { status: 400 });
    }

    // Construire le prompt
    const prompt = buildSunoPrompt({
      title,
      lyrics,
      blocks: blocks as Parameters<typeof buildSunoPrompt>[0]["blocks"],
      style,
      mood,
      tempo,
      voice,
      durationEstimate,
    });

    // Sauvegarder dans l'historique si songId fourni
    if (songId) {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.promptHistory.create({
          data: {
            prompt,
            metadata: JSON.stringify({ style, mood, tempo, voice }),
            songId,
            userId: user.id,
          },
        });
      }
    }

    return NextResponse.json({
      prompt,
      metadata: {
        estimatedBPM: tempo ?? 100,
        estimatedDuration: durationEstimate ? `${Math.floor(durationEstimate / 60)}:${String(durationEstimate % 60).padStart(2, "0")}` : "3:30",
        voice,
        style,
        mood,
      },
    });
  } catch (error) {
    console.error("POST /api/generate-suno-prompt error:", error);
    return NextResponse.json({ error: "Erreur génération prompt" }, { status: 500 });
  }
}
