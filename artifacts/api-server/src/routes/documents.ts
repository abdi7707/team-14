import {
  GenerateDocumentBody,
  type DocumentSummary,
  type GeneratedDocument,
} from "@workspace/api-zod";
import { desc, eq, generatedDocuments } from "@workspace/db";
import { Router } from "express";
import { db } from "../lib/db";
import { GenerationError, writeDocument } from "../lib/docGeneration";
import { findReadyDocument } from "../lib/documentStore";
import { HttpError } from "../lib/httpError";
import { renderDocumentPdf } from "../lib/pdf";
import { parseBody } from "../lib/validation";
import { requireAuth } from "../middlewares/auth";

export const documentsRouter = Router();

documentsRouter.post("/documents/generate", requireAuth, async (req, res) => {
  const body = parseBody(GenerateDocumentBody, req.body);

  const [row] = await db
    .insert(generatedDocuments)
    .values({
      userId: req.user!.id,
      businessId: body.businessId,
      docType: body.docType,
      language: body.language,
    })
    .returning();

  // Ids and timings only: document content and passport data never go to the logs.
  const logFields = { documentId: row.id, docType: body.docType, language: body.language };
  const started = Date.now();

  try {
    const { content, replacedFigures } = await writeDocument(body);
    await db
      .update(generatedDocuments)
      .set({ status: "READY", content })
      .where(eq(generatedDocuments.id, row.id));

    req.log.info({ ...logFields, durationMs: Date.now() - started, replacedFigures }, "document generated");
    const response: GeneratedDocument = {
      id: row.id,
      docType: row.docType,
      language: row.language,
      status: "READY",
      content,
    };
    res.status(201).json(response);
  } catch (error) {
    const reason = error instanceof GenerationError ? error.reason : "Unexpected error";
    await db
      .update(generatedDocuments)
      .set({ status: "FAILED", errorMessage: reason })
      .where(eq(generatedDocuments.id, row.id));
    req.log.warn({ ...logFields, durationMs: Date.now() - started, reason }, "document generation failed");

    if (!(error instanceof GenerationError)) throw error;
    throw new HttpError(
      502,
      "GENERATION_FAILED",
      "The AI could not prepare your document. Please try again.",
    );
  }
});

documentsRouter.get("/documents/mine", requireAuth, async (req, res) => {
  const rows = await db
    .select({
      id: generatedDocuments.id,
      docType: generatedDocuments.docType,
      language: generatedDocuments.language,
      status: generatedDocuments.status,
      businessId: generatedDocuments.businessId,
      createdAt: generatedDocuments.createdAt,
    })
    .from(generatedDocuments)
    .where(eq(generatedDocuments.userId, req.user!.id))
    .orderBy(desc(generatedDocuments.createdAt))
    .limit(100);

  const response: DocumentSummary[] = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
  res.json(response);
});

documentsRouter.get<{ id: string }>("/documents/:id/pdf", requireAuth, async (req, res) => {
  const row = await findReadyDocument(req.user!.id, req.params.id);
  const pdf = await renderDocumentPdf(row.content);
  const fileName = `sened-${row.docType.toLowerCase().replaceAll("_", "-")}-${row.language.toLowerCase()}.pdf`;

  res.set("Cache-Control", "private, no-store").type("application/pdf").attachment(fileName).send(pdf);
});

documentsRouter.get<{ id: string }>("/documents/:id", requireAuth, async (req, res) => {
  const row = await findReadyDocument(req.user!.id, req.params.id);
  const response: GeneratedDocument = {
    id: row.id,
    docType: row.docType,
    language: row.language,
    status: row.status,
    content: row.content,
  };
  res.json(response);
});
