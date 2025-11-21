import { LENGTH_OPTIONS, SUPPORTED_PLATFORMS } from "./constants.js";

const formatAmenities = (amenities = []) => (amenities.length ? amenities.join(", ") : "None specified");

const formatMediaReferences = (media) => {
  const imageSummary = (media.images || [])
    .map((img, index) => `Image ${index + 1}: ${img.caption || "Uncaptioned"}`)
    .join(" | ");
  const audioSummary = (media.audioNotes || [])
    .map((note, index) => `Audio ${index + 1}: ${note.transcript.slice(0, 80)}`)
    .join(" | ");

  return [imageSummary, audioSummary].filter(Boolean).join(" || ") || "No media references supplied.";
};

export const buildSocialPrompt = ({ property, media, preferences }) => {
  const platforms = preferences.platforms?.length ? preferences.platforms : SUPPORTED_PLATFORMS;
  const lengthMeta = LENGTH_OPTIONS[preferences.length || "medium"];

  return [
    `Create upbeat social media copy for ${platforms.length} platforms.`,
    `Property: ${property.title} located in ${property.location}.`,
    `Price point: ${property.price}.`,
    `Amenities: ${formatAmenities(property.amenities)}.`,
    `Description: ${property.description}.`,
    `Media inspiration: ${formatMediaReferences(media)}.`,
    `Tone: ${preferences.tone}.`,
    `Audience: ${preferences.audience || "prospective buyers"}.`,
    `Call to action: ${preferences.callToAction || "Book a private tour today."}.`,
    `Keep each platform body to roughly ${lengthMeta.sentences} sentences.`,
    preferences.customInstructions ? `Honor user instructions: ${preferences.customInstructions}.` : null
  ]
    .filter(Boolean)
    .join("\n");
};

export const buildVideoPrompt = ({ property, media, preferences }) => {
  const lengthMeta = LENGTH_OPTIONS[preferences.length || "medium"];

  return [
    `Write a scene-by-scene real estate video script with ${lengthMeta.scriptBeats} beats.`,
    `Property focus: ${property.title} in ${property.location}.`,
    `Key story: ${property.description}.`,
    `Amenities to highlight: ${formatAmenities(property.amenities)}.`,
    `Incorporate supplied visuals or audio notes when helpful: ${formatMediaReferences(media)}.`,
    `Desired tone: ${preferences.tone}.`,
    `Audience: ${preferences.audience || "buyers seeking modern comfort"}.`,
    `Call to action: ${preferences.callToAction || "Schedule an on-site visit."}.`,
    preferences.customInstructions ? `Custom narration guidance: ${preferences.customInstructions}.` : null
  ]
    .filter(Boolean)
    .join("\n");
};
