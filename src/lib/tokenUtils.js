import { TOKEN_LIMIT } from "./constants.js";
import { TokenLimitError } from "./errors.js";

export const estimateTokensFromText = (text = "") => {
  if (!text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  const punctuation = (text.match(/[,.!?;:]/g) || []).length;
  return Math.ceil(words * 0.9 + punctuation * 0.2 + text.length * 0.01);
};

export const estimateRequestTokens = ({ property, media, preferences }) => {
  const propertyText = [property.title, property.description, property.location, property.price]
    .filter(Boolean)
    .join(" ");

  const amenityText = property.amenities?.join(" ") ?? "";
  const imageCaptions = (media.images || []).map((img) => img.caption || "").join(" ");
  const audioNotes = (media.audioNotes || []).map((note) => note.transcript || "").join(" ");
  const preferenceNotes = [preferences.customInstructions, preferences.callToAction, preferences.audience]
    .filter(Boolean)
    .join(" ");

  return estimateTokensFromText(
    `${propertyText} ${amenityText} ${imageCaptions} ${audioNotes} ${preferenceNotes}`.trim()
  );
};

export const enforceTokenBudget = (payload, limit = TOKEN_LIMIT) => {
  const estimate = estimateRequestTokens(payload);
  if (estimate > limit) {
    throw new TokenLimitError(limit, estimate);
  }
  return estimate;
};
