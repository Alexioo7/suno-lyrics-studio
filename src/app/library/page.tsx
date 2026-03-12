import { Suspense } from "react";
import prisma from "@/lib/utils/prisma";
import LibraryView from "@/components/library/LibraryView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getSongs() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return [];

    return await prisma.song.findMany({
      where: { userId: user.id },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { blocks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function LibraryPage() {
  const songs = await getSongs();

  return (
    <div className="min-h-screen bg-studio-bg">
      <Suspense fallback={<div className="p-8 text-studio-muted">Chargement...</div>}>
        <LibraryView initialSongs={songs as Parameters<typeof LibraryView>[0]["initialSongs"]} />
      </Suspense>
    </div>
  );
}