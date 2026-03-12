/**
 * API /api/songs/[id]/blocks — Gestion des blocs d'une chanson
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";

// GET : liste des blocs
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const blocks = await prisma.block.findMany({
      where: { songId: params.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ blocks });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : créer un bloc
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { type, content, order, color } = body;

    // Récupérer le prochain ordre si non fourni
    const maxOrder = await prisma.block.aggregate({
      where: { songId: params.id },
      _max: { order: true },
    });
    const nextOrder = order ?? (maxOrder._max.order ?? -1) + 1;

    const block = await prisma.block.create({
      data: {
        songId: params.id,
        type: type ?? "verse",
        content: content ?? JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
        order: nextOrder,
        color,
      },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT : réordonner les blocs (tableau d'ids dans l'ordre souhaité)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { orderedIds, blocks: updatedBlocks } = body;

    if (orderedIds) {
      // Mise à jour de l'ordre
      await Promise.all(
        orderedIds.map((blockId: string, index: number) =>
          prisma.block.update({
            where: { id: blockId, songId: params.id },
            data: { order: index },
          })
        )
      );
    } else if (updatedBlocks) {
      // Mise à jour complète de plusieurs blocs
      await Promise.all(
        updatedBlocks.map((b: { id: string; content: string; order?: number }) =>
          prisma.block.update({
            where: { id: b.id, songId: params.id },
            data: { content: b.content, ...(b.order !== undefined ? { order: b.order } : {}) },
          })
        )
      );
    }

    const blocks = await prisma.block.findMany({
      where: { songId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ blocks });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : supprimer un bloc
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get("blockId");
    if (!blockId) return NextResponse.json({ error: "blockId requis" }, { status: 400 });

    await prisma.block.delete({ where: { id: blockId, songId: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
