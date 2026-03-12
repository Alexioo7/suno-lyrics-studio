/**
 * Moteur de rimes pour le français.
 * Algorithme basé sur la phonétique approximée + lexique de terminaisons.
 * Pas d'API externe requise.
 */

import type { RhymeResult } from "@/types";

// Lexique de mots français groupés par terminaison phonétique
// Structure : { terminaison: string[] }
const RHYME_DICTIONARY: Record<string, string[]> = {
  // Terminaison "ain" / "in"
  ain: ["main", "demain", "chemin", "destin", "matin", "jardin", "chagrin", "lapin", "cousin", "satin", "festin"],
  // Terminaison "eur"
  eur: ["cœur", "peur", "fleur", "douleur", "couleur", "bonheur", "malheur", "erreur", "valeur", "chaleur", "frayeur", "ardeur"],
  // Terminaison "oir"
  oir: ["voir", "pouvoir", "savoir", "avoir", "soir", "espoir", "vouloir", "boire", "mémoire", "gloire", "victoire", "histoire"],
  // Terminaison "amour"
  amour: ["toujours", "détours", "discours", "parcours", "retours", "velours", "tambours", "secours"],
  // Terminaison "ie"
  ie: ["vie", "pluie", "envie", "folie", "mélodie", "sortie", "partie", "partie", "magie", "bougie", "rougie"],
  // Terminaison "ombre"
  ombre: ["sombre", "nombre", "timbre", "chambre", "décombre", "encombre"],
  // Terminaison "ite"
  ite: ["nuit", "fuite", "suite", "conduite", "poursuite", "fruit", "bruit", "gratuit", "vide", "ride", "guide"],
  // Terminaison "ère"
  ere: ["lumière", "rivière", "frontière", "manière", "sincère", "espère", "terre", "guerre", "pierre", "prière"],
  // Terminaison "ant"
  ant: ["chant", "sang", "temps", "vent", "enfant", "pendant", "vivant", "mourant", "brillant", "manquant", "parlant"],
  // Terminaison "ance"
  ance: ["chance", "danse", "enfance", "souffrance", "espérance", "alliance", "balance", "distance", "romance", "silence"],
  // Terminaison "age"
  age: ["visage", "passage", "village", "message", "voyage", "rivage", "nuage", "courage", "partage", "mirage", "hommage"],
  // Terminaison "oir" (noir)
  noir: ["soir", "voir", "croire", "noir", "armoire", "couloir"],
  // Terminaison "ieu"
  ieu: ["dieu", "vieux", "mieux", "cieux", "yeux", "jeux", "enjeux", "feux", "aveux"],
  // Terminaison "ort"
  ort: ["mort", "sort", "fort", "port", "nord", "accord", "bord", "record", "effort", "confort", "réconfort"],
};

/**
 * Extrait la terminaison phonétique d'un mot (2-4 derniers caractères pertinents).
 */
function getPhoneticEnding(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= 2) return w;
  // Supprime les consonnes finales muettes (t, s, d, x, z)
  const stripped = w.replace(/[tsdxz]$/, "");
  // Retourne les 3-4 derniers caractères
  return stripped.slice(-4);
}

/**
 * Trouve des rimes pour un mot donné.
 * @param word - Le mot cible
 * @param limit - Nombre maximum de rimes à retourner
 * @returns Tableau de résultats de rimes
 */
export function findRhymes(word: string, limit = 15): RhymeResult[] {
  const target = word.toLowerCase().trim();
  if (!target) return [];

  const results: RhymeResult[] = [];
  const targetEnding = getPhoneticEnding(target);
  const seen = new Set<string>();

  // 1. Recherche dans le dictionnaire par terminaison
  for (const [key, words] of Object.entries(RHYME_DICTIONARY)) {
    for (const w of words) {
      if (w === target || seen.has(w)) continue;
      const wEnding = getPhoneticEnding(w);
      if (wEnding === targetEnding || key === targetEnding.slice(-key.length)) {
        results.push({ word: w, type: "perfect" });
        seen.add(w);
      }
    }
  }

  // 2. Rimes approximatives : même terminaison 2 chars
  if (results.length < limit) {
    const short = target.slice(-2);
    for (const words of Object.values(RHYME_DICTIONARY)) {
      for (const w of words) {
        if (w === target || seen.has(w)) continue;
        if (w.endsWith(short)) {
          results.push({ word: w, type: "approximate" });
          seen.add(w);
        }
      }
    }
  }

  // 3. Rimes multisyllabiques : même 2 dernières syllabes (heuristique simple)
  const multiWords = [
    "éternité", "liberté", "réalité", "vérité", "beauté", "fidélité", "clarté", "intimité",
    "solitude", "habitude", "certitude", "platitude", "inquiétude", "gratitude", "multitude",
    "amour perdu", "cœur brisé", "âme damnée", "nuit tombée", "vie passée", "rêve effacé",
  ];
  for (const mw of multiWords) {
    if (seen.has(mw) || mw === target) continue;
    const mwEnd = getPhoneticEnding(mw.split(" ").pop() || mw);
    if (mwEnd.slice(-2) === targetEnding.slice(-2)) {
      results.push({ word: mw, type: "multisyllabic" });
      seen.add(mw);
    }
  }

  return results.slice(0, limit);
}

/**
 * Génère des suggestions de punchlines/hooks basées sur un thème.
 */
export function generateHookIdeas(theme: string, style: string, count = 10): string[] {
  const themeTemplates: Record<string, string[]> = {
    amour: [
      "J'ai brûlé {pour toi / pour rien} comme une chandelle au vent",
      "Tu es parti(e) et l'hiver a pris ta place dans mon lit",
      "L'amour c'est un mensonge qu'on répète jusqu'à y croire",
      "Chaque baiser que tu m'as donné était une promesse morte",
      "Je t'ai attendu(e) jusqu'à ce que l'espoir ne sache plus mon nom",
    ],
    rue: [
      "Le béton m'a élevé quand personne n'était là",
      "On a grandi dans l'ombre des tours et la lumière des phares",
      "Ma vie c'est un film noir sans générique de fin",
      "La rue t'apprend en une nuit ce que l'école donne en dix ans",
      "On sourit pas ici, on survit ici",
    ],
    liberté: [
      "Je vole sans ailes depuis que j'ai brûlé mes chaînes",
      "Libre comme le vent qui ne s'excuse d'aucune direction",
      "Ma liberté c'est le seul luxe que j'aie jamais eu",
      "Je cours vers demain sans regarder hier tomber",
    ],
    default: [
      "Le temps ne guérit pas tout, il cache juste mieux",
      "On cherche la lumière dans des pièces sans fenêtres",
      "J'ai mis des mots sur le silence et ça m'a sauvé",
      "Entre ce qu'on dit et ce qu'on vit, y'a un océan",
      "J'écris pour ceux qui n'ont plus de voix",
    ],
  };

  // Sélectionner le template le plus proche du thème
  const themeKey = Object.keys(themeTemplates).find((k) =>
    theme.toLowerCase().includes(k)
  ) || "default";

  const templates = themeTemplates[themeKey];
  // Adapter au style si nécessaire (drill = plus direct, chanson = plus poétique)
  const stylized = templates.map((t) => {
    if (style.includes("drill")) {
      return t.replace(/je/gi, "J'").replace(/tu es/gi, "t'es");
    }
    return t;
  });

  return stylized.slice(0, count);
}

/**
 * Génère 20 idées de chansons à partir d'un thème.
 */
export function generate20SongIdeas(theme: string, style: string): { title: string; hook: string; tags: string[] }[] {
  const ideas = [
    { title: `${theme} au crépuscule`, hook: "Quand le soleil meurt, mes mots prennent vie", tags: ["mélancolie", "nuit"] },
    { title: `Sans ${theme}`, hook: "Je me souviens de ce que j'étais avant", tags: ["introspection"] },
    { title: `${theme} et moi`, hook: "Une histoire qu'on a pas fini d'écrire", tags: ["relation", "intime"] },
    { title: `Lettre à ${theme}`, hook: "Je t'écris depuis l'autre rive du temps", tags: ["nostalgie", "lettre"] },
    { title: `L'hiver de ${theme}`, hook: "La neige couvre tout sauf la vérité", tags: ["froid", "hiver"] },
    { title: `${theme} m'a quitté`, hook: "Et je me suis retrouvé seul avec mes questions", tags: ["rupture"] },
    { title: `Rêver de ${theme}`, hook: "Dans mes rêves tu n'as pas encore disparu", tags: ["rêve", "fuite"] },
    { title: `La dernière fois`, hook: "On savait pas que c'était la dernière fois", tags: ["fin", "regret"] },
    { title: `Chercher ${theme}`, hook: "Depuis des années je cherche dans les mauvais endroits", tags: ["quête"] },
    { title: `${theme} en 3h du matin`, hook: "L'heure où les masques tombent enfin", tags: ["nuit", "vérité"] },
    { title: `Apprendre à ${theme}`, hook: "On naît pas avec, on apprend en tombant", tags: ["croissance"] },
    { title: `${theme} interdit`, hook: "Tout ce qu'on désire le plus est défendu", tags: ["transgression"] },
    { title: `Après ${theme}`, hook: "Le monde après toi ressemble à un film muet", tags: ["absence", "vide"] },
    { title: `${theme} ou rien`, hook: "J'ai choisi le tout ou rien et j'ai tout perdu", tags: ["extremes", "choix"] },
    { title: `Danser avec ${theme}`, hook: "Même dans la tempête on peut trouver le rythme", tags: ["danse", "résilience"] },
    { title: `Contre ${theme}`, hook: "Je me bats contre les vents que j'ai moi-même levés", tags: ["combat", "soi"] },
    { title: `${theme} de nuit`, hook: "La nuit révèle ce que le jour cache", tags: ["mystère", "sombre"] },
    { title: `Au-delà de ${theme}`, hook: "Il y a un monde derrière ce que les yeux voient", tags: ["au-delà", "spirituel"] },
    { title: `${theme} — Remix`, hook: "J'ai pris l'original et j'ai tout réécrit", tags: ["remix", "moderne"] },
    { title: `Adieu ${theme}`, hook: "Certains adieux sont des commencements déguisés", tags: ["adieu", "espoir"] },
  ];

  return ideas;
}
