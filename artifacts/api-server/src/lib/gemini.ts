import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

// Applies to each attempt. The SDK does not retry unless retryOptions is set;
// generation does its own single retry so malformed JSON is retried too.
const REQUEST_TIMEOUT_MS = 45_000;

export const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  httpOptions: { timeout: REQUEST_TIMEOUT_MS },
});
