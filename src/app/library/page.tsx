/**
 * Page bibliothèque — liste de toutes les chansons de l'utilisateur.
 */
import { Suspense } from "react";
import prisma from "@/lib/utils/prisma";
import LibraryView from "@/components/library/LibraryView";

// Récupérer les chansons côté serveur
async function getSongs() {
  try {
    // En mode demo : récupérer le premier utilisateur
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
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryView initialSongs={songs as Parameters<typeof LibraryView>[0]["initialSongs"]} />
      </Suspense>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="p-8 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl shimmer" />
      ))}
    </div>
  );
}
