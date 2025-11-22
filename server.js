import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { generateSocialContent, generateVideoScript } from "./src/lib/generators.js";
import { validateContentPlanInput, validateSocialRequest, validateVideoRequest } from "./src/lib/validators.js";
import { createContentPlan, listContentPlans } from "./src/db/contentPlanRepository.js";
import { TokenLimitError } from "./src/lib/errors.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post(
  "/api/content/social",
  asyncHandler((req, res) => {
    const payload = validateSocialRequest(req.body || {});
    const result = generateSocialContent(payload);
    res.json({ success: true, data: result });
  })
);

app.post(
  "/api/content/video",
  asyncHandler((req, res) => {
    const payload = validateVideoRequest(req.body || {});
    const result = generateVideoScript(payload);
    res.json({ success: true, data: result });
  })
);

app.post(
  "/api/content/plan",
  asyncHandler((req, res) => {
    const payload = validateContentPlanInput(req.body || {});
    const saved = createContentPlan(payload);
    res.status(201).json({ success: true, data: saved });
  })
);

app.get(
  "/api/content/plans",
  asyncHandler((req, res) => {
    const plans = listContentPlans();
    res.json({ success: true, data: plans });
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof TokenLimitError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({ success: false, message: "Invalid request payload.", issues: err.issues });
  }

  console.error("Unhandled error", err);
  return res.status(500).json({ success: false, message: "Unexpected server error." });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Content generation service running on port ${PORT}`);
  });
}

export default app;
