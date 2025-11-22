import { z } from "zod";
import { LENGTH_OPTIONS, SUPPORTED_PLATFORMS, TONE_OPTIONS } from "./constants.js";

const imageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url().optional(),
  caption: z.string().optional()
});

const audioNoteSchema = z.object({
  id: z.string().min(1),
  transcript: z.string().min(3)
});

const mediaSchema = z.object({
  images: z.array(imageSchema).default([]),
  audioNotes: z.array(audioNoteSchema).default([])
});

const propertySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(20),
  location: z.string().min(2),
  price: z.union([z.number(), z.string().min(1)]),
  amenities: z.array(z.string().min(2)).default([])
});

const lengthEnum = z.enum(Object.keys(LENGTH_OPTIONS));
const toneEnum = z.enum(TONE_OPTIONS);
const platformEnum = z.enum([...SUPPORTED_PLATFORMS]);

const preferenceBase = z.object({
  tone: toneEnum.default("informative"),
  length: lengthEnum.default("medium"),
  callToAction: z.string().max(180).optional(),
  audience: z.string().max(180).optional(),
  customInstructions: z.string().max(420).optional()
});

const socialPreferences = preferenceBase.extend({
  platforms: z.array(platformEnum).min(1).max(SUPPORTED_PLATFORMS.length).optional()
});

const videoPreferences = preferenceBase;

const socialRequestSchema = z.object({
  property: propertySchema,
  media: mediaSchema,
  preferences: socialPreferences
});

const videoRequestSchema = z.object({
  property: propertySchema,
  media: mediaSchema,
  preferences: videoPreferences
});

const contentPlanSchema = z.object({
  propertyId: z.string().min(1),
  planType: z.enum(["social", "video"]),
  payload: z.record(z.any()),
  title: z.string().min(3).max(120),
  promptSummary: z.string().max(300).optional()
});

export const validateSocialRequest = (payload) => socialRequestSchema.parse(payload);
export const validateVideoRequest = (payload) => videoRequestSchema.parse(payload);
export const validateContentPlanInput = (payload) => contentPlanSchema.parse(payload);
