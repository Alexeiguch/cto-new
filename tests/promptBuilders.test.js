import { describe, expect, it } from "vitest";
import { buildSocialPrompt, buildVideoPrompt } from "../src/lib/promptBuilders.js";
import { LENGTH_OPTIONS } from "../src/lib/constants.js";

const mockProperty = {
  id: "test-property",
  title: "Skyline Loft",
  description: "Expansive loft with industrial textures, restored bricks, and skyline terrace moments for effortless entertaining.",
  location: "Chicago, IL",
  price: "$975,000",
  amenities: ["10' windows", "Restored brick", "Skyline terrace"]
};

const mockMedia = {
  images: [{ id: "img1", caption: "Golden hour over the skyline terrace" }],
  audioNotes: [{ id: "note1", transcript: "Mention the restored freight elevator conversion story" }]
};

const basePreferences = {
  tone: "informative",
  length: "medium",
  audience: "Design-forward buyers",
  callToAction: "Book a private tour",
  customInstructions: "Lead with heritage narrative"
};

describe("prompt builders", () => {
  it("builds a social prompt with platform guidance", () => {
    const preferences = { ...basePreferences, platforms: ["instagram", "tiktok"] };
    const prompt = buildSocialPrompt({ property: mockProperty, media: mockMedia, preferences });

    expect(prompt).toContain("Create upbeat social media copy for 2 platforms");
    expect(prompt).toContain(`Property: ${mockProperty.title}`);
    expect(prompt).toContain(`Tone: ${preferences.tone}`);
    expect(prompt).toContain(preferences.customInstructions);
    expect(prompt).toContain(mockMedia.images[0].caption);
    expect(prompt).toContain(LENGTH_OPTIONS[preferences.length].sentences.toString());
  });

  it("builds a video prompt with beat guidance", () => {
    const prompt = buildVideoPrompt({ property: mockProperty, media: mockMedia, preferences: basePreferences });

    expect(prompt).toContain("scene-by-scene real estate video script");
    expect(prompt).toContain(mockProperty.location);
    expect(prompt).toContain(mockMedia.audioNotes[0].transcript.slice(0, 40));
    expect(prompt).toContain(LENGTH_OPTIONS[basePreferences.length].scriptBeats.toString());
  });
});
