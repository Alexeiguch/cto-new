const SAMPLE_PROPERTIES = [
  {
    id: "marina-vista",
    title: "Marina Vista Haven",
    description:
      "Waterfront three-bedroom home with double-height great room, glass walls framing Biscayne Bay, and spa-level primary suite that floats above the marina.",
    location: "Miami, FL",
    price: "$2,450,000",
    amenities: ["Rooftop deck", "Glass curtain walls", "Smart lighting", "Resort pool"],
    media: {
      images: [
        { id: "img_marina_1", caption: "Sunset skyline framing the infinity edge pool." },
        { id: "img_marina_2", caption: "Great room with double-height ceilings and bay views." }
      ],
      audioNotes: [
        { id: "note_marina_1", transcript: "Lead with the cinematic sunrise that floods the main living level." },
        { id: "note_marina_2", transcript: "Mention the marina slips that come with ownership." }
      ]
    }
  },
  {
    id: "canyon-ridge",
    title: "Canyon Ridge Retreat",
    description:
      "Modern mountain escape carved into red rock featuring cantilevered terraces, radiant-heated floors, and a wellness wing with cedar sauna and plunge pool.",
    location: "Sedona, AZ",
    price: "$3,180,000",
    amenities: ["Cantilevered terraces", "Radiant floors", "Wellness wing", "Cedar sauna"],
    media: {
      images: [
        { id: "img_canyon_1", caption: "Terrace floating over the canyon floor at golden hour." },
        { id: "img_canyon_2", caption: "Wellness wing with cedar sauna and plunge pool." }
      ],
      audioNotes: [
        { id: "note_canyon_1", transcript: "Highlight the seamless indoor-outdoor transitions using frameless glass." }
      ]
    }
  }
];

const TONES = [
  { value: "informative", label: "Informative" },
  { value: "luxury", label: "Luxury" },
  { value: "playful", label: "Playful" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" }
];

const LENGTHS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" }
];

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "youtubeShorts", "twitter"];

const state = {
  lastResult: null,
  lastProperty: SAMPLE_PROPERTIES[0]
};

const qs = (selector) => document.querySelector(selector);

const propertySelect = () => qs("#propertySelect");
const toneSelect = () => qs("#toneSelect");
const lengthSelect = () => qs("#lengthSelect");
const instructionsInput = () => qs("#instructionsInput");
const audienceInput = () => qs("#audienceInput");
const ctaInput = () => qs("#ctaInput");
const platformContainer = () => qs("#platformOptions");
const resultContainer = () => qs("#resultContainer");
const feedbackEl = () => qs("#feedback");
const saveBtn = () => qs("#savePlanBtn");
const plansList = () => qs("#plansList");

const initSelectors = () => {
  const propertyOptions = SAMPLE_PROPERTIES.map((property) => `<option value="${property.id}">${property.title}</option>`).join("\n");
  propertySelect().innerHTML = propertyOptions;

  toneSelect().innerHTML = TONES.map((tone) => `<option value="${tone.value}">${tone.label}</option>`).join("\n");
  lengthSelect().innerHTML = LENGTHS.map((length) => `<option value="${length.value}">${length.label}</option>`).join("\n");
  toneSelect().value = TONES[0].value;
  lengthSelect().value = "medium";

  platformContainer().innerHTML = PLATFORMS.map(
    (platform, index) => `
        <label>
          <input type="checkbox" name="platform" value="${platform}" ${index < 3 ? "checked" : ""}/>
          ${platform}
        </label>
      `
  ).join("\n");
};

const setFeedback = (message, variant = "error") => {
  if (!message) {
    feedbackEl().textContent = "";
    return;
  }
  feedbackEl().textContent = message;
  feedbackEl().style.color = variant === "error" ? "#d14343" : "#137333";
};

const getSelectedProperty = () => {
  const propertyId = propertySelect().value;
  const property = SAMPLE_PROPERTIES.find((item) => item.id === propertyId) || SAMPLE_PROPERTIES[0];
  state.lastProperty = property;
  return property;
};

const gatherPreferences = () => {
  const selectedPlatforms = Array.from(platformContainer().querySelectorAll("input[name='platform']:checked"))
    .map((input) => input.value)
    .filter(Boolean);

  return {
    tone: toneSelect().value,
    length: lengthSelect().value,
    customInstructions: instructionsInput().value.trim() || undefined,
    audience: audienceInput().value.trim() || undefined,
    callToAction: ctaInput().value.trim() || undefined,
    platforms: selectedPlatforms.length ? selectedPlatforms : undefined
  };
};

const buildPayload = () => {
  const property = getSelectedProperty();
  const { media, ...propertyFields } = property;
  return {
    property: propertyFields,
    media,
    preferences: gatherPreferences()
  };
};

const renderSocialResult = (result) => {
  const cards = result.variants
    .map(
      (variant) => `
        <article class="result-card">
          <div>
            <span class="chip">${variant.platform}</span>
            <span class="chip">${result.tone}</span>
          </div>
          <h3>${variant.headline}</h3>
          <p>${variant.body}</p>
          <p><strong>Hashtags:</strong> ${(variant.hashtags || []).join(" ")}</p>
          <p><strong>Media references:</strong> ${(variant.mediaReferences || [])
            .map((ref) => `${ref.type}: ${ref.caption || ref.snippet}`)
            .join(" | ") || "None"}</p>
        </article>
      `
    )
    .join("\n");

  resultContainer().innerHTML = `
    <p class="helper" style="color:#137333">Tokens used: ${result.tokensUsed}</p>
    ${cards}
  `;
};

const renderVideoResult = (result) => {
  const scenes = result.script
    .map(
      (scene) => `
        <article class="result-card">
          <div>
            <span class="chip">Scene ${scene.scene}</span>
            <span class="chip">${result.length}</span>
          </div>
          <h3>${scene.title}</h3>
          <p><strong>Visual:</strong> ${scene.visualCue}</p>
          <p><strong>Narration:</strong> ${scene.narration}</p>
          <p><strong>Media references:</strong> ${(scene.mediaReferences || [])
            .map((ref) => `${ref.type}: ${ref.caption || ref.snippet}`)
            .join(" | ") || "None"}</p>
        </article>
      `
    )
    .join("\n");

  resultContainer().innerHTML = `
    <p class="helper" style="color:#137333">Tokens used: ${result.tokensUsed}</p>
    ${scenes}
  `;
};

const renderResult = (payload) => {
  if (!payload) {
    resultContainer().innerHTML = "";
    return;
  }

  if (payload.type === "social") {
    renderSocialResult(payload);
  } else {
    renderVideoResult(payload);
  }
};

const handleRequest = async (route, payload) => {
  setFeedback("Generating draft...");
  saveBtn().disabled = true;
  saveBtn().setAttribute("aria-busy", "true");

  try {
    const response = await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const message = result.message || "Unable to generate draft.";
      throw new Error(message);
    }

    return result.data;
  } finally {
    saveBtn().removeAttribute("aria-busy");
  }
};

const generateContent = async (type) => {
  try {
    const payload = buildPayload();
    const route = type === "social" ? "/api/content/social" : "/api/content/video";
    const result = await handleRequest(route, payload);
    state.lastResult = result;
    state.lastResult.type = type;
    renderResult({ ...result, type });
    setFeedback("Draft ready. Review before saving.", "success");
    saveBtn().disabled = false;
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "Something went wrong.");
  }
};

const savePlan = async () => {
  if (!state.lastResult) return;
  const property = state.lastProperty;
  const payload = {
    propertyId: property.id,
    planType: state.lastResult.type,
    payload: state.lastResult,
    title: `${property.title} • ${state.lastResult.type === "social" ? "Social" : "Video"} plan`,
    promptSummary: (state.lastResult.prompt || "").slice(0, 200)
  };

  try {
    setFeedback("Saving plan...", "success");
    const response = await fetch("/api/content/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.message || "Unable to save plan");
    }
    setFeedback("Plan saved", "success");
    saveBtn().disabled = true;
    await loadPlans();
  } catch (error) {
    console.error(error);
    setFeedback(error.message || "Unable to save plan");
  }
};

const loadPlans = async () => {
  const response = await fetch("/api/content/plans");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch plans");
  }

  const rows = (data.data || []).map((plan) => ({
    id: plan.id,
    title: plan.title,
    planType: plan.planType,
    createdAt: plan.createdAt,
    propertyId: plan.propertyId
  }));

  renderPlans(rows);
};

const formatDate = (value) => new Date(value).toLocaleString();

const renderPlans = (plans) => {
  if (!plans.length) {
    plansList().innerHTML = "<p>No saved plans yet.</p>";
    return;
  }

  plansList().innerHTML = plans
    .map(
      (plan) => `
        <div class="plan-row">
          <strong>${plan.title}</strong>
          <small>${plan.planType.toUpperCase()} • ${plan.propertyId}</small>
          <small>Saved ${formatDate(plan.createdAt)}</small>
        </div>
      `
    )
    .join("\n");
};

const wireEvents = () => {
  qs("#socialBtn").addEventListener("click", () => generateContent("social"));
  qs("#videoBtn").addEventListener("click", () => generateContent("video"));
  saveBtn().addEventListener("click", savePlan);
  qs("#refreshPlansBtn").addEventListener("click", async () => {
    try {
      await loadPlans();
    } catch (error) {
      setFeedback(error.message);
    }
  });

  propertySelect().addEventListener("change", () => {
    state.lastProperty = getSelectedProperty();
  });
};

const bootstrap = async () => {
  initSelectors();
  wireEvents();
  try {
    await loadPlans();
  } catch (error) {
    console.warn(error);
    setFeedback("Unable to load saved plans yet.");
  }
};

bootstrap();
