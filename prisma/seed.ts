/**
 * Seed Prisma : crée un utilisateur test + 3 chansons d'exemple
 * Exécuter avec : npm run seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...");

  // Utilisateur test
  const user = await prisma.user.upsert({
    where: { email: "test@sunolabs.dev" },
    update: {},
    create: {
      email: "test@sunolabs.dev",
      name: "Auteur Test",
      password: "hashed_password_placeholder",
    },
  });
  console.log("✅ Utilisateur créé:", user.email);

  // Tags
  const tagSad = await prisma.tag.upsert({
    where: { name: "sad" },
    update: {},
    create: { name: "sad", color: "#6366f1" },
  });
  const tagDrill = await prisma.tag.upsert({
    where: { name: "drill" },
    update: {},
    create: { name: "drill", color: "#ef4444" },
  });
  const tagTikTok = await prisma.tag.upsert({
    where: { name: "tiktok" },
    update: {},
    create: { name: "tiktok", color: "#f59e0b" },
  });

  // ─── Chanson 1 : Chanson française triste ───────────────────────────────
  const song1 = await prisma.song.create({
    data: {
      title: "Novembre dans mes veines",
      description: "Une chanson sur la mélancolie automnale et les adieux",
      status: "drafting",
      style: "chanson française",
      mood: "melancholic",
      tempo: 72,
      voice: "male",
      durationEstimate: 210,
      userId: user.id,
      tags: { create: [{ tag: { connect: { id: tagSad.id } } }] },
      blocks: {
        create: [
          {
            type: "verse",
            order: 0,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Les feuilles tombent sans bruit sur le pavé mouillé",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Novembre dans mes veines coule comme un adieu",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "J'ai cherché ton prénom dans chaque rue oubliée",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Mais tu es partie avec l'été dans tes cheveux",
                    },
                  ],
                },
              ],
            }),
          },
          {
            type: "chorus",
            order: 1,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Reste encore, reste encore, le vent m'emporte",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Nos souvenirs s'effacent derrière ta porte",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Novembre dans mes veines, novembre dans ma voix",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Je chante l'hiver qui vient pour ne pas penser à toi",
                    },
                  ],
                },
              ],
            }),
            color: "#4f46e5",
          },
          {
            type: "verse",
            order: 2,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Les cafés se vident, la nuit s'installe trop tôt",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Je lis tes messages comme on lit les épitaphes",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Il reste ton parfum sur le vieux canapé",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Et ces photos de nous que j'ai mis sous le tapis",
                    },
                  ],
                },
              ],
            }),
          },
          {
            type: "bridge",
            order: 3,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Peut-être qu'au printemps je ferai semblant",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Que tout ça c'était juste une saison qui passe",
                    },
                  ],
                },
              ],
            }),
          },
        ],
      },
    },
  });
  console.log("✅ Chanson 1:", song1.title);

  // ─── Chanson 2 : Drill ───────────────────────────────────────────────────
  const song2 = await prisma.song.create({
    data: {
      title: "Zone Grise",
      description: "Drill sombre, ambiance rue, synthés froids",
      status: "generated",
      style: "UK drill",
      mood: "dark",
      tempo: 140,
      voice: "male",
      durationEstimate: 180,
      userId: user.id,
      tags: { create: [{ tag: { connect: { id: tagDrill.id } } }] },
      blocks: {
        create: [
          {
            type: "intro",
            order: 0,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "[Intro - Synthé glacial]" }],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Zone grise, zone morte, personne sort indemne" },
                  ],
                },
              ],
            }),
          },
          {
            type: "verse",
            order: 1,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "J'ai grandi dans le béton, les murs m'ont tout appris" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Serrer les dents la nuit quand les lumières s'éteignent" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Mes frères sont des ombres dans le hall de l'immeuble" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "On attend rien de personne, le monde nous a maudits" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Capuche sur la tête, regard froid comme décembre" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "J'ai pas choisi la rue mais la rue elle m'a choisi" },
                  ],
                },
              ],
            }),
          },
          {
            type: "chorus",
            order: 2,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Zone grise, on survit — c'est tout" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Zone grise, les rêves y meurent partout" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Pas d'issue, pas de ciel, juste le bitume" }],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Et ce froid dans la poitrine qui ne s'allume plus" },
                  ],
                },
              ],
            }),
            color: "#dc2626",
          },
        ],
      },
    },
  });
  console.log("✅ Chanson 2:", song2.title);

  // ─── Chanson 3 : Comptine TikTok ────────────────────────────────────────
  const song3 = await prisma.song.create({
    data: {
      title: "Boba & Vibes ✨",
      description: "Comptine pop TikTok avec hook accrocheur, tempo rapide",
      status: "published",
      style: "hyperpop",
      mood: "happy",
      tempo: 128,
      voice: "female",
      durationEstimate: 90,
      userId: user.id,
      tags: { create: [{ tag: { connect: { id: tagTikTok.id } } }] },
      blocks: {
        create: [
          {
            type: "chorus",
            order: 0,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Boba dans ma main, le soleil dans mes yeux" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Je danse sur le cloud, je vis pour le mieux" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Ding ding ding, mon téléphone sonne" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "C'est la vie qu'on veut, personne nous abandonne" },
                  ],
                },
              ],
            }),
            color: "#f59e0b",
          },
          {
            type: "verse",
            order: 1,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Morning routine, matcha latte et confettis" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "On est les filles du web, on fait nos propres récits" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Cottage core ou Y2K, peu importe le style" },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Ce qui compte c'est de danser, de sourire, d'être utile" },
                  ],
                },
              ],
            }),
          },
          {
            type: "bridge",
            order: 2,
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Ooh ooh ooh — la la la" }],
                },
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Scroll, post, repeat — c'est notre karma" },
                  ],
                },
              ],
            }),
          },
        ],
      },
    },
  });
  console.log("✅ Chanson 3:", song3.title);

  // Exemple de version sauvegardée pour la chanson 1
  await prisma.version.create({
    data: {
      label: "v1 - premier jet",
      snapshot: JSON.stringify({ blocks: [] }), // snapshot simplifié
      songId: song1.id,
    },
  });

  // Exemple de prompt history
  await prisma.promptHistory.create({
    data: {
      prompt: `[Suno AI Prompt - Novembre dans mes veines]\nStyle: chanson française mélancolique, guitare acoustique, cordes légères\nTempo: 72 BPM\nVoix: male, émotionnel, brisé\nStructure: intro → verse → chorus → verse → chorus → bridge → chorus (x2) → outro\nMood: tristesse automnale, nostalgie, deuil amoureux\nInstructions voix: chuchoter sur les verses, monter crescendo sur le chorus\n[verse]\n[chorus: Reste encore...]\n[outro: piano seul, fade out]`,
      metadata: JSON.stringify({ style: "chanson française", mood: "melancholic", tempo: 72 }),
      songId: song1.id,
      userId: user.id,
    },
  });

  console.log("🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
