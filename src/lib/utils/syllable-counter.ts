/**
 * Compteur de syllabes pour le français (heuristique).
 * Algorithme basé sur les voyelles et digraphes français courants.
 * Utilisé en temps réel dans l'éditeur pour visualiser le flow.
 */

// Voyelles de base (incluant nasales)
const VOWELS = /[aeiouyàâäéèêëîïôöùûüœæ]/gi;

// Digraphes qui ne comptent que pour une syllabe (ex: "eau" = 1 syllabe)
const DIGRAPH_REDUCTIONS = [
  /eau/gi,    // beau, gâteau
  /ai/gi,     // maison
  /ei/gi,     // peine
  /oi/gi,     // voix
  /ou/gi,     // jour
  /eu/gi,     // feu
  /au/gi,     // faux
  /ae/gi,     // nae (rare)
  /oe/gi,     // cœur (prétraité)
  /ui/gi,     // nuit
  /ue/gi,     // vue (soft)
  /ie/gi,     // pied (attention : variable)
  /oeu/gi,   // cœur
];

/**
 * Compte le nombre de syllabes dans un mot français.
 * @param word - Le mot à analyser
 * @returns Nombre de syllabes estimé (minimum 1)
 */
export function countSyllablesInWord(word: string): number {
  if (!word || word.trim() === "") return 0;

  // Nettoyer : enlever ponctuation, mettre en minuscule
  let cleaned = word.toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüœæ]/gi, "");
  if (cleaned.length === 0) return 0;

  // Remplacer les digraphes connus par un seul caractère marqueur
  // pour éviter de les compter deux fois
  let processed = cleaned;

  // Cas spéciaux : "tion" = 1 syllabe dans bcp de cas
  processed = processed.replace(/tion/gi, "X");
  // "œu" / "eu" / "eau"
  processed = processed.replace(/eau/gi, "A");
  processed = processed.replace(/oeu/gi, "A");
  processed = processed.replace(/[ae]u/gi, "A");
  processed = processed.replace(/[oe]i/gi, "A");
  processed = processed.replace(/[ao]u/gi, "A");
  processed = processed.replace(/ui/gi, "I");
  processed = processed.replace(/ie/gi, "I");

  // Compter les voyelles restantes
  const matches = processed.match(VOWELS);
  let count = matches ? matches.length : 1;

  // Le "e" muet final ne compte généralement pas en chanson
  // (sauf si c'est le seul e du mot)
  if (count > 1 && cleaned.endsWith("e") && !cleaned.endsWith("ée")) {
    count -= 1;
  }
  // "es" final muet
  if (count > 1 && cleaned.endsWith("es")) {
    count -= 1;
  }

  return Math.max(1, count);
}

/**
 * Compte les syllabes dans une ligne complète.
 * @param line - Une ligne de paroles
 * @returns Nombre de syllabes total
 */
export function countSyllablesInLine(line: string): number {
  if (!line || line.trim() === "") return 0;

  const words = line.trim().split(/\s+/);
  return words.reduce((total, word) => total + countSyllablesInWord(word), 0);
}

/**
 * Analyse plusieurs lignes et retourne les comptes par ligne.
 * @param text - Texte multi-lignes
 * @returns Tableau de { line, count }
 */
export function analyzeLines(text: string): { line: string; count: number }[] {
  const lines = text.split("\n");
  return lines.map((line) => ({
    line,
    count: countSyllablesInLine(line),
  }));
}

/**
 * Calcule le score de chantabilité basé sur la régularité rythmique.
 * Score 0-100 : 100 = toutes les lignes ont le même nombre de syllabes.
 */
export function calculateSingabilityScore(lines: { line: string; count: number }[]): number {
  const nonEmpty = lines.filter((l) => l.count > 0);
  if (nonEmpty.length === 0) return 0;
  if (nonEmpty.length === 1) return 100;

  const counts = nonEmpty.map((l) => l.count);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);

  // Score inversement proportionnel à l'écart-type normalisé
  const normalizedDev = stdDev / avg;
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - normalizedDev * 2))));
  return score;
}
