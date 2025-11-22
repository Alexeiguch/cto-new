import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeDocumentText(
  documentText: string,
  analysisType: "summary" | "extraction" | "classification" = "summary"
): Promise<string> {
  const prompts = {
    summary: `Please provide a concise summary of the following document:\n\n${documentText}`,
    extraction: `Extract key information and entities from the following document:\n\n${documentText}`,
    classification: `Classify the following document and provide its type:\n\n${documentText}`,
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompts[analysisType],
        },
      ],
      max_tokens: 1024,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document with OpenAI");
  }
}

export async function extractRealEstateInfo(
  documentText: string
): Promise<Record<string, unknown>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Extract real estate-specific information from this document. Return as JSON with fields like: propertyAddress, price, bedrooms, bathrooms, squareFeet, etc.\n\nDocument:\n${documentText}`,
        },
      ],
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content || "{}";
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  } catch (error) {
    console.error("Error extracting real estate info:", error);
    throw new Error("Failed to extract real estate information");
  }
}
