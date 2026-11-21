import { z } from "zod";
import { Language } from "./language";
import { BusinessPassport } from "./passport";

export const DOC_TYPES = ["LOAN_REQUEST_LETTER"] as const;
export const DocType = z.enum(DOC_TYPES);
export type DocType = z.infer<typeof DocType>;

export const DOCUMENT_STATUSES = ["GENERATING", "READY", "FAILED"] as const;
export const DocumentStatus = z.enum(DOCUMENT_STATUSES);
export type DocumentStatus = z.infer<typeof DocumentStatus>;

export const DocumentSection = z.object({
  heading: z.string(),
  body: z.string(),
});
export type DocumentSection = z.infer<typeof DocumentSection>;

export const DocumentContent = z.object({
  title: z.string(),
  sections: z.array(DocumentSection),
});
export type DocumentContent = z.infer<typeof DocumentContent>;

/** Body of POST /documents/generate. */
export const GenerateDocumentBody = z.object({
  docType: DocType,
  language: Language,
  businessId: z.string().trim().min(1).max(100),
  passport: BusinessPassport,
});
export type GenerateDocumentBody = z.infer<typeof GenerateDocumentBody>;

/** A READY document, as returned by POST /documents/generate and GET /documents/:id. */
export const GeneratedDocument = z.object({
  id: z.string(),
  docType: DocType,
  language: Language,
  status: DocumentStatus,
  content: DocumentContent,
});
export type GeneratedDocument = z.infer<typeof GeneratedDocument>;

/** One entry of GET /documents/mine (newest first). */
export const DocumentSummary = z.object({
  id: z.string(),
  docType: DocType,
  language: Language,
  status: DocumentStatus,
  businessId: z.string(),
  createdAt: z.string(),
});
export type DocumentSummary = z.infer<typeof DocumentSummary>;
