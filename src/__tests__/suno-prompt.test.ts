/**
 * Tests pour le générateur de prompt Suno.
 */
import { describe, it, expect } from "vitest";
import { buildSunoPrompt, extractText } from "../lib/utils/suno-prompt-builder";

describe("buildSunoPrompt", () => {
  const baseOptions = {
    title: "Novembre dans mes veines",
    lyrics: "[VERSE]\nLes feuilles tombent sans bruit\n\n[CHORUS]\nReste encore",
    style: "chanson française",
    mood: "melancholic",
    tempo: 72,
    voice: "male",
    durationEstimate: 210,
  };

  it("retourne une chaîne non vide", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("contient le titre de la chanson", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(prompt).toContain("Novembre dans mes veines");
  });

  it("contient le style musical", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(prompt).toContain("chanson française");
  });

  it("contient le BPM", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(prompt).toContain("72");
  });

  it("contient des instructions de voix", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(prompt).toMatch(/voix|voice/i);
  });

  it("contient des informations sur la structure", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(prompt).toMatch(/STRUCTURE|INTRO|VERSE|CHORUS/i);
  });

  it("contient les paroles", () => {
    const prompt = buildSunoPrompt(baseOptions);
    expect(prompt).toContain("Reste encore");
  });

  it("gère les options manquantes avec des valeurs par défaut", () => {
    const minimalPrompt = buildSunoPrompt({
      title: "Test",
      lyrics: "Quelques paroles de test",
    });
    expect(typeof minimalPrompt).toBe("string");
    expect(minimalPrompt.length).toBeGreaterThan(50);
  });

  it("adapte la description de voix selon le genre", () => {
    const femalePrompt = buildSunoPrompt({ ...baseOptions, voice: "female" });
    expect(femalePrompt).toMatch(/féminin|female/i);
  });

  it("contient des blocs Suno si blocks fournis", () => {
    const withBlocks = buildSunoPrompt({
      ...baseOptions,
      blocks: [
        { id: "1", type: "verse", order: 0, content: '{"type":"doc"}', songId: "s1", createdAt: "", updatedAt: "" },
        { id: "2", type: "chorus", order: 1, content: '{"type":"doc"}', songId: "s1", createdAt: "", updatedAt: "" },
      ],
    });
    expect(withBlocks).toMatch(/VERSE.*CHORUS/i);
  });
});

describe("extractText", () => {
  it("extrait le texte d'un document TipTap simple", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    };
    const text = extractText(doc);
    expect(text).toContain("Hello world");
  });

  it("retourne une chaîne vide pour null", () => {
    expect(extractText(null)).toBe("");
    expect(extractText(undefined)).toBe("");
  });

  it("gère les documents imbriqués", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Ligne 1" },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Ligne 2" },
          ],
        },
      ],
    };
    const text = extractText(doc);
    expect(text).toContain("Ligne 1");
    expect(text).toContain("Ligne 2");
  });
});
