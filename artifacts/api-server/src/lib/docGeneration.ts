import { ApiError } from "@google/genai";
import {
  DISCLAIMER_HEADINGS,
  DOCUMENT_TITLES,
  DRAFT_DISCLAIMER,
  type DocumentContent,
  type GenerateDocumentBody,
} from "@workspace/api-zod";
import { z } from "zod";
import { buildPrompt, passportFacts } from "./docPrompt";
import { env } from "./env";
import { allowedFigures, redactUnknownFigures } from "./figureCheck";
import { gemini } from "./gemini";

const MAX_ATTEMPTS = 2;

const DraftSchema = z.object({
  sections: z
    .array(
      z.object({
        heading: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(6000),
      }),
    )
    .min(3)
    .max(12),
});

// DraftSchema as JSON Schema, so Gemini constrains its output to the same shape.
const DRAFT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
        },
        required: ["heading", "body"],
      },
    },
  },
  required: ["sections"],
};

/** Generation failed after every attempt. `reason` is for logs, never for clients. */
export class GenerationError extends Error {
  constructor(readonly reason: string) {
    super(reason);
    this.name = "GenerationError";
  }
}

// Reasons never include the model's output or the passport.
function describeFailure(error: unknown): string {
  if (error instanceof SyntaxError) return "AI response was not valid JSON";
  if (error instanceof z.ZodError) return "AI response did not match the document shape";
  if (error instanceof ApiError) return `Gemini API error ${error.status}: ${error.message.slice(0, 300)}`;
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return "AI request timed out";
  }
  return "AI request failed";
}

async function requestDraft(prompt: { system: string; user: string }) {
  let reason = "AI request failed";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt.user,
        config: {
          systemInstruction: prompt.system,
          temperature: 0.3,
          responseMimeType: "application/json",
          responseJsonSchema: DRAFT_RESPONSE_SCHEMA,
        },
      });
      return DraftSchema.parse(JSON.parse(response.text ?? ""));
    } catch (error) {
      reason = describeFailure(error);
    }
  }
  throw new GenerationError(`${reason} (after ${MAX_ATTEMPTS} attempts)`);
}

/** Writes the document with Gemini, removes figures that are not in the passport, and appends the disclaimer. */
export async function writeDocument(input: GenerateDocumentBody) {
  const facts = passportFacts(input.passport);
  const draft = await requestDraft(buildPrompt(input.docType, input.language, facts));

  const allowed = allowedFigures(facts);
  let replacedFigures = 0;
  const clean = (value: string) => {
    const result = redactUnknownFigures(value, allowed);
    replacedFigures += result.replaced;
    return result.text;
  };

  const content: DocumentContent = {
    title: DOCUMENT_TITLES[input.docType][input.language],
    sections: [
      ...draft.sections.map((section) => ({
        heading: clean(section.heading),
        body: clean(section.body),
      })),
      { heading: DISCLAIMER_HEADINGS[input.language], body: DRAFT_DISCLAIMER },
    ],
  };
  return { content, replacedFigures };
}
