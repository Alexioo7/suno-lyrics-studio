/**
 * API /api/songs — Liste et création de chansons
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";

// GET /api/songs?userId=xxx&status=xxx&search=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Pour la démo : utiliser le premier user si pas de userId
    const targetUserId = userId ?? (await getFirstUserId());
    if (!targetUserId) {
      return NextResponse.json({ songs: [] });
    }

    const songs = await prisma.song.findMany({
      where: {
        userId: targetUserId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { blocks: true, versions: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("GET /api/songs error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/songs — Créer une chanson
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, style, mood, tempo, voice, durationEstimate, userId } = body;

    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const targetUserId = userId ?? (await getFirstUserId());
    if (!targetUserId) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const song = await prisma.song.create({
      data: {
        title,
        description,
        style,
        mood,
        tempo,
        voice,
        durationEstimate,
        status: "idea",
        userId: targetUserId,
      },
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error("POST /api/songs error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function getFirstUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst();
  return user?.id ?? null;
}
