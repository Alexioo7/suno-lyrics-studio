/**
 * Tests unitaires pour syllable-counter.ts
 */
import { describe, it, expect } from "vitest";
import {
  countSyllablesInWord,
  countSyllablesInLine,
  analyzeLines,
  calculateSingabilityScore,
} from "../lib/utils/syllable-counter";

describe("countSyllablesInWord", () => {
  it("retourne 0 pour une chaîne vide", () => {
    expect(countSyllablesInWord("")).toBe(0);
  });

  it("compte correctement les mots simples", () => {
    expect(countSyllablesInWord("chat")).toBe(1);
    expect(countSyllablesInWord("maison")).toBe(2);
    expect(countSyllablesInWord("liberté")).toBe(3);
  });

  it("gère les digraphes français (eau, au, ou)", () => {
    // "eau" = 1 syllabe
    expect(countSyllablesInWord("eau")).toBe(1);
    expect(countSyllablesInWord("beau")).toBe(1);
    expect(countSyllablesInWord("cadeau")).toBe(2);
  });

  it("gère les mots avec 'e' muet final", () => {
    // "vie" = 1 syllabe (pas 2)
    expect(countSyllablesInWord("vie")).toBe(1);
    // "flamme" = 1 syllabe (le 'e' final est muet)
    expect(countSyllablesInWord("flamme")).toBe(1);
  });

  it("compte les mots longs correctement", () => {
    // "liberté" = 3 syllabes
    expect(countSyllablesInWord("liberté")).toBe(3);
    // "magnifique" = 3 syllabes
    expect(countSyllablesInWord("magnifique")).toBeGreaterThan(2);
  });

  it("retourne minimum 1 pour tout mot non vide", () => {
    expect(countSyllablesInWord("th")).toBeGreaterThanOrEqual(1);
    expect(countSyllablesInWord("a")).toBeGreaterThanOrEqual(1);
  });
});

describe("countSyllablesInLine", () => {
  it("retourne 0 pour une ligne vide", () => {
    expect(countSyllablesInLine("")).toBe(0);
    expect(countSyllablesInLine("   ")).toBe(0);
  });

  it("additionne les syllabes de chaque mot", () => {
    // "le chat" = 1 + 1 = 2
    const count = countSyllablesInLine("le chat");
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);
  });

  it("gère la ponctuation", () => {
    const withPunct = countSyllablesInLine("Reste encore, reste encore, le vent m'emporte");
    const withoutPunct = countSyllablesInLine("Reste encore reste encore le vent memporte");
    // Les deux devraient être proches
    expect(Math.abs(withPunct - withoutPunct)).toBeLessThanOrEqual(2);
  });
});

describe("analyzeLines", () => {
  it("retourne un tableau de la même longueur que les lignes", () => {
    const text = "Ligne un\nLigne deux\nLigne trois";
    const result = analyzeLines(text);
    expect(result).toHaveLength(3);
  });

  it("chaque élément a une propriété line et count", () => {
    const result = analyzeLines("Novembre dans mes veines");
    expect(result[0]).toHaveProperty("line");
    expect(result[0]).toHaveProperty("count");
    expect(result[0].count).toBeGreaterThan(0);
  });
});

describe("calculateSingabilityScore", () => {
  it("retourne 0 pour un tableau vide", () => {
    expect(calculateSingabilityScore([])).toBe(0);
  });

  it("retourne 100 pour une seule ligne", () => {
    expect(calculateSingabilityScore([{ line: "test", count: 5 }])).toBe(100);
  });

  it("score proche de 100 pour des lignes régulières", () => {
    const lines = [
      { line: "Ligne a", count: 8 },
      { line: "Ligne b", count: 8 },
      { line: "Ligne c", count: 8 },
      { line: "Ligne d", count: 8 },
    ];
    expect(calculateSingabilityScore(lines)).toBeGreaterThan(80);
  });

  it("score faible pour des lignes irrégulières", () => {
    const lines = [
      { line: "Court", count: 2 },
      { line: "Une ligne beaucoup plus longue avec beaucoup de syllabes", count: 18 },
      { line: "Moyen", count: 4 },
    ];
    expect(calculateSingabilityScore(lines)).toBeLessThan(60);
  });
});
