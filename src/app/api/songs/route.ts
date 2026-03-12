import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";

const BLOCK_COLORS: Record<string, string> = {
  verse: "#1d4ed8", chorus: "#4f46e5", bridge: "#7c3aed",
  intro: "#0891b2", outro: "#475569", other: "#6b6b8a",
};

const STRUCTURES: Record<string, string[]> = {
  CVCVCB:  ["chorus","verse","chorus","verse","chorus","bridge"],
  VCVC:    ["verse","chorus","verse","chorus"],
  VVCVC:   ["verse","verse","chorus","verse","chorus"],
  CVVCVC:  ["chorus","verse","verse","chorus","verse","chorus"],
  VCVCBC:  ["verse","chorus","verse","chorus","bridge","chorus"],
  VVVC:    ["verse","verse","verse","chorus"],
  VCPCPC:  ["verse","chorus","verse","chorus","bridge","chorus"],
  VVV:     ["verse","verse","verse"],
};

async function getFirstUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst();
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const targetUserId = userId ?? (await getFirstUserId());
    if (!targetUserId) {
      return NextResponse.json({ songs: [] });
    }

    const songs = await prisma.song.findMany({
      where: {
        userId: targetUserId,
        ...(status ? { status } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        } : {}),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, style, mood, tempo, voice, durationEstimate, userId, structure } = body;

    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const targetUserId = userId ?? (await getFirstUserId());
    if (!targetUserId) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const blockTypes = structure ? (STRUCTURES[structure] ?? []) : [];
    const emptyContent = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

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
        blocks: blockTypes.length > 0 ? {
          create: blockTypes.map((type, order) => ({
            type,
            order,
            content: emptyContent,
            color: BLOCK_COLORS[type],
          }))
        } : undefined,
      },
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error("POST /api/songs error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}