/**
 * Page éditeur de chanson — layout 3 colonnes.
 */
import { notFound } from "next/navigation";
import prisma from "@/lib/utils/prisma";
import SongEditorLayout from "@/components/editor/SongEditorLayout";

async function getSong(id: string) {
  try {
    return await prisma.song.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        versions: { orderBy: { createdAt: "desc" }, take: 10 },
        promptHistory: { orderBy: { createdAt: "desc" }, take: 5 },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function SongPage({ params }: { params: { id: string } }) {
  const song = await getSong(params.id);

  if (!song) {
    notFound();
  }

  return (
    <SongEditorLayout
      song={song as Parameters<typeof SongEditorLayout>[0]["song"]}
    />
  );
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const song = await getSong(params.id);
  return {
    title: song ? `${song.title} — Suno Lyrics Studio` : "Éditeur — Suno Lyrics Studio",
  };
}
