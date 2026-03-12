/**
 * API /api/songs/[id] — CRUD d'une chanson spécifique
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const song = await prisma.song.findUnique({
      where: { id: params.id },
      include: {
        blocks: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        versions: { orderBy: { createdAt: "desc" } },
        promptHistory: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!song) {
      return NextResponse.json({ error: "Chanson introuvable" }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error("GET /api/songs/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, description, status, style, mood, tempo, voice, durationEstimate, artist } = body;

    const song = await prisma.song.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(style !== undefined ? { style } : {}),
        ...(mood !== undefined ? { mood } : {}),
        ...(tempo !== undefined ? { tempo } : {}),
        ...(voice !== undefined ? { voice } : {}),
        ...(durationEstimate !== undefined ? { durationEstimate } : {}),
	...(artist !== undefined ? { artist } : {}),
      },
    });

    return NextResponse.json({ song });
  } catch (error) {
    console.error("PATCH /api/songs/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.song.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/songs/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
