import { CTA_LIBRARY, LENGTH_OPTIONS, SUPPORTED_PLATFORMS } from "./constants.js";
import { buildSocialPrompt, buildVideoPrompt } from "./promptBuilders.js";
import { enforceTokenBudget, estimateTokensFromText } from "./tokenUtils.js";

const PLATFORM_ANGLES = {
  instagram: "Lifestyle snapshot",
  facebook: "Community-focused update",
  tiktok: "Fast, energetic hook",
  linkedin: "Professional market insight",
  youtubeShorts: "Hero highlight reel",
  twitter: "Punchy market stat"
};

const normalize = (value = "") => value.toString().toLowerCase().replace(/[^a-z0-9]+/gi, "").trim();

const buildHashtags = (property, platform) => {
  const base = [property.location, property.title]
    .filter(Boolean)
    .map((item) => `#${normalize(item)}`)
    .filter(Boolean);

  const amenityTags = (property.amenities || [])
    .slice(0, 2)
    .map((amenity) => `#${normalize(amenity)}`)
    .filter(Boolean);

  const platformTag = `#${platform}`;

  return Array.from(new Set([...base, ...amenityTags, platformTag])).slice(0, 4);
};

const clampSentences = (text, count) => {
  if (!text) return "";
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences.slice(0, count).join(" ");
};

const getSentence = (text = "", index = 0, fallback = "") => {
  if (!text) return fallback;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences[index] || fallback;
};

const referenceMedia = (media = { images: [], audioNotes: [] }, index) => {
  const references = [];
  const images = media.images || [];
  const audio = media.audioNotes || [];

  if (images.length) {
    const image = images[index % images.length];
    references.push({ type: "image", id: image.id, caption: image.caption || "" });
  }

  if (audio.length) {
    const note = audio[index % audio.length];
    references.push({ type: "audio", id: note.id, snippet: note.transcript.slice(0, 120) });
  }

  return references;
};

const selectCTA = (preferences) => {
  if (preferences.callToAction) return preferences.callToAction;
  return CTA_LIBRARY[preferences.tone] || CTA_LIBRARY.informative;
};

const buildSceneBlueprints = (property) => [
  {
    title: "Street-side arrival",
    visualTemplate: () => `Exterior sweep capturing ${property.location}.`,
    narrationTemplate: (cta) =>
      `Imagine arriving at ${property.title}, where ${getSentence(property.description, 0, "style meets comfort")}.`
  },
  {
    title: "Gathering hub",
    visualTemplate: () =>
      `Wide lens through the main living area highlighting ${property.amenities?.[0] || "open concept design"}.`,
    narrationTemplate: () =>
      `Step inside to find ${getSentence(property.description, 1, "sunlit rooms and thoughtful finishes")}.`
  },
  {
    title: "Lifestyle moment",
    visualTemplate: () => `Cutaways of ${property.amenities?.slice(0, 2).join(" and ") || "versatile spaces"}.`,
    narrationTemplate: () => `Every corner supports ${property.amenities?.[1] || "relaxed living"}.`
  },
  {
    title: "Outdoor escape",
    visualTemplate: () => `Showcase exterior moments or balcony scenes.`,
    narrationTemplate: () => `Outdoor areas extend the living space with ${property.amenities?.[2] || "space to recharge"}.`
  },
  {
    title: "Call to action",
    visualTemplate: () => `Return to hero shot with subtle graphics.`,
    narrationTemplate: (cta) => cta
  }
];

const buildSocialVariant = (platform, payload, index) => {
  const { property, media, preferences } = payload;
  const lengthMeta = LENGTH_OPTIONS[preferences.length || "medium"];
  const platformNarrative = PLATFORM_ANGLES[platform] || "Platform spotlight";
  const descriptiveBody = clampSentences(property.description, lengthMeta.sentences) || property.description;
  const cta = selectCTA(preferences);

  return {
    platform,
    headline: `${property.title} • ${platformNarrative}`,
    body: `${platformNarrative}: ${descriptiveBody} ${cta}`.trim(),
    hashtags: buildHashtags(property, platform),
    mediaReferences: referenceMedia(media, index)
  };
};

export const generateSocialContent = (payload) => {
  const budgetUsage = enforceTokenBudget(payload);
  const prompt = buildSocialPrompt(payload);
  const platforms = payload.preferences.platforms?.length
    ? payload.preferences.platforms
    : SUPPORTED_PLATFORMS;

  const variants = platforms.map((platform, index) => buildSocialVariant(platform, payload, index));
  const variantTokens = variants.reduce((sum, variant) => sum + estimateTokensFromText(variant.body), 0);
  const promptTokens = estimateTokensFromText(prompt);

  return {
    type: "social",
    propertyId: payload.property.id,
    tone: payload.preferences.tone || "informative",
    length: payload.preferences.length || "medium",
    prompt,
    variants,
    tokensUsed: budgetUsage + promptTokens + variantTokens
  };
};

export const generateVideoScript = (payload) => {
  const budgetUsage = enforceTokenBudget(payload);
  const prompt = buildVideoPrompt(payload);
  const lengthMeta = LENGTH_OPTIONS[payload.preferences.length || "medium"];
  const beats = lengthMeta.scriptBeats;
  const cta = selectCTA(payload.preferences);
  const blueprints = buildSceneBlueprints(payload.property);

  const script = Array.from({ length: beats }, (_, index) => {
    const blueprint = blueprints[index % blueprints.length];
    const references = referenceMedia(payload.media, index);
    const narration = blueprint.narrationTemplate(cta);

    return {
      scene: index + 1,
      title: blueprint.title,
      visualCue: blueprint.visualTemplate(payload.property, payload.media),
      narration,
      mediaReferences: references
    };
  });

  const scriptTokens = script.reduce((sum, scene) => sum + estimateTokensFromText(scene.narration), 0);
  const promptTokens = estimateTokensFromText(prompt);

  return {
    type: "video",
    propertyId: payload.property.id,
    tone: payload.preferences.tone || "informative",
    length: payload.preferences.length || "medium",
    prompt,
    script,
    tokensUsed: budgetUsage + promptTokens + scriptTokens
  };
};
