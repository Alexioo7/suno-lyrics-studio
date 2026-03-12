/**
 * Analyseur d'émotions pour les paroles.
 * Basé sur un lexique de polarité français (heuristique, sans API externe).
 */

// Lexique de mots positifs / négatifs en français
const POSITIVE_WORDS = new Set([
  "amour", "bonheur", "joie", "lumière", "espoir", "rire", "sourire", "beau", "belle",
  "libre", "liberté", "vie", "vivre", "chanter", "danser", "rêve", "rêver", "soleil",
  "doux", "douce", "tendresse", "paix", "calme", "fort", "courage", "victoire", "bien",
  "magnifique", "splendide", "merveilleux", "fier", "fière", "heureux", "heureuse",
  "éternel", "infini", "ardeur", "grâce", "gloire", "triomphe", "force",
]);

const NEGATIVE_WORDS = new Set([
  "mort", "mourir", "douleur", "larmes", "pleurer", "seul", "solitude", "sombre", "noir",
  "nuit", "peur", "peine", "tristesse", "souffrir", "souffrance", "froid", "adieu",
  "partir", "quitter", "perdre", "perdu", "vide", "silence", "briser", "brisé", "brisée",
  "tomber", "chuter", "crier", "sang", "blessure", "plaie", "cicatrice", "honte",
  "colère", "rage", "haine", "détruire", "destruction", "chaos", "enfer", "maudit",
  "maudite", "désespoir", "abandon", "trahison", "mensonge", "trahi", "trahie",
  "ombre", "gris", "fumer", "brûler", "oubli", "oublier", "jamais", "plus rien",
]);

// Intensificateurs : doublent l'impact du mot suivant
const INTENSIFIERS = new Set(["très", "trop", "vraiment", "tellement", "si", "extrêmement"]);

// Négations : inversent la polarité
const NEGATIONS = new Set(["ne", "n'", "pas", "plus", "jamais", "rien"]);

export interface EmotionScore {
  positive: number;   // 0-1
  negative: number;   // 0-1
  neutral: number;    // 0-1
  dominant: "positive" | "negative" | "neutral";
  intensity: number;  // 0-100
}

/**
 * Analyse la distribution émotionnelle des paroles.
 */
export function analyzeEmotion(lyrics: string): EmotionScore {
  const words = lyrics
    .toLowerCase()
    .replace(/[.,!?;:'"""«»\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let posCount = 0;
  let negCount = 0;
  let total = 0;
  let negated = false;
  let intensified = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (NEGATIONS.has(word)) {
      negated = true;
      continue;
    }
    if (INTENSIFIERS.has(word)) {
      intensified = true;
      continue;
    }

    const multiplier = intensified ? 2 : 1;

    if (POSITIVE_WORDS.has(word)) {
      if (negated) negCount += multiplier;
      else posCount += multiplier;
      total += multiplier;
      negated = false;
      intensified = false;
    } else if (NEGATIVE_WORDS.has(word)) {
      if (negated) posCount += multiplier;
      else negCount += multiplier;
      total += multiplier;
      negated = false;
      intensified = false;
    } else {
      // Réinitialiser la négation après un mot neutre
      if (!NEGATIONS.has(words[i + 1] ?? "")) {
        negated = false;
      }
      intensified = false;
    }
  }

  if (total === 0) {
    return { positive: 0, negative: 0, neutral: 1, dominant: "neutral", intensity: 0 };
  }

  const posRatio = posCount / total;
  const negRatio = negCount / total;
  const neutRatio = Math.max(0, 1 - posRatio - negRatio);

  let dominant: EmotionScore["dominant"] = "neutral";
  if (posRatio > negRatio && posRatio > 0.3) dominant = "positive";
  else if (negRatio > posRatio && negRatio > 0.3) dominant = "negative";

  // Intensité : % de mots émotionnels / total de mots
  const emotionalDensity = total / words.length;
  const intensity = Math.round(Math.min(100, emotionalDensity * 200));

  return {
    positive: Math.round(posRatio * 100) / 100,
    negative: Math.round(negRatio * 100) / 100,
    neutral: Math.round(neutRatio * 100) / 100,
    dominant,
    intensity,
  };
}

/**
 * Trouve les N-grammes les plus fréquents (répétitions).
 * Utile pour détecter les hooks et les patterns.
 */
export function findNgrams(
  text: string,
  n: number = 2,
  topK: number = 10
): { ngram: string; count: number }[] {
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:'"«»\-\n]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2); // ignorer les mots courts

  const freq: Record<string, number> = {};

  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(" ");
    freq[ngram] = (freq[ngram] || 0) + 1;
  }

  return Object.entries(freq)
    .filter(([, count]) => count > 1) // uniquement les répétitions
    .sort(([, a], [, b]) => b - a)
    .slice(0, topK)
    .map(([ngram, count]) => ({ ngram, count }));
}

/**
 * Calcule la fréquence des mots (pour détecter les répétitions obsessionnelles).
 */
export function topWords(
  text: string,
  topK: number = 10
): { word: string; count: number }[] {
  // Mots vides français à ignorer
  const stopWords = new Set([
    "le", "la", "les", "de", "du", "des", "un", "une", "et", "en", "à", "au", "aux",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "me", "te", "se",
    "mon", "ton", "son", "ma", "ta", "sa", "notre", "votre", "leur", "leurs",
    "ce", "cet", "cette", "ces", "que", "qui", "quoi", "dont", "où",
    "dans", "sur", "sous", "par", "pour", "avec", "sans", "vers", "comme",
    "mais", "ou", "et", "donc", "or", "ni", "car",
    "pas", "plus", "ne", "n", "y", "en",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[.,!?;:'"«»\-\n]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topK)
    .map(([word, count]) => ({ word, count }));
}
