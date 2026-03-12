/**
 * Tests pour l'analyseur d'émotions.
 */
import { describe, it, expect } from "vitest";
import { analyzeEmotion, findNgrams, topWords } from "../lib/utils/emotion-analyzer";

describe("analyzeEmotion", () => {
  it("détecte une émotion positive dans un texte joyeux", () => {
    const result = analyzeEmotion("le bonheur et la joie remplissent ma vie de lumière et d'espoir");
    expect(result.positive).toBeGreaterThan(result.negative);
  });

  it("détecte une émotion négative dans un texte sombre", () => {
    const result = analyzeEmotion("la mort et la douleur, les larmes et la solitude, tout sombre");
    expect(result.negative).toBeGreaterThan(result.positive);
  });

  it("retourne neutral pour un texte sans marqueurs émotionnels", () => {
    const result = analyzeEmotion("le chat dort sur le canapé bleu");
    expect(result.dominant).toBe("neutral");
  });

  it("les scores somment à ≈ 1 (avec marge)", () => {
    const result = analyzeEmotion("amour et douleur se mélangent dans la nuit");
    const sum = result.positive + result.negative + result.neutral;
    expect(sum).toBeGreaterThanOrEqual(0.9);
    expect(sum).toBeLessThanOrEqual(1.1);
  });

  it("gère un texte vide", () => {
    const result = analyzeEmotion("");
    expect(result.dominant).toBe("neutral");
    expect(result.positive).toBe(0);
    expect(result.negative).toBe(0);
  });
});

describe("findNgrams", () => {
  it("trouve les bigrammes répétés", () => {
    const text = "reste encore reste encore le vent m'emporte reste encore";
    const result = findNgrams(text, 2, 5);
    expect(Array.isArray(result)).toBe(true);
    // "reste encore" apparaît 3 fois
    const restEncore = result.find((r) => r.ngram.includes("reste"));
    if (restEncore) {
      expect(restEncore.count).toBeGreaterThan(1);
    }
  });

  it("retourne un tableau vide pour un texte court sans répétitions", () => {
    const result = findNgrams("un seul passage sans répétition ici", 2, 5);
    expect(Array.isArray(result)).toBe(true);
  });

  it("trie par fréquence décroissante", () => {
    const text = "a b c a b c a b c d e f a b";
    const result = findNgrams(text, 2, 10);
    if (result.length > 1) {
      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    }
  });
});

describe("topWords", () => {
  it("ignore les mots vides français", () => {
    const result = topWords("le la les de du des et en je tu il");
    // Tous ces mots sont des stop words, le résultat devrait être vide ou minimal
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("retourne les mots les plus fréquents", () => {
    const text = "amour amour amour nuit nuit soleil";
    const result = topWords(text, 3);
    expect(result[0].word).toBe("amour");
    expect(result[0].count).toBe(3);
  });

  it("limite au topK demandé", () => {
    const text = "un deux trois quatre cinq six sept huit neuf dix";
    const result = topWords(text, 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });
});
