import { and, eq, generatedDocuments } from "@workspace/db";
import { db } from "./db";
import { HttpError } from "./httpError";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Loads a READY document that belongs to `userId`. Someone else's document is
 * reported as not found, so ids cannot be probed.
 */
export async function findReadyDocument(userId: string, id: string) {
  const row = UUID_PATTERN.test(id)
    ? await db.query.generatedDocuments.findFirst({
        where: and(eq(generatedDocuments.id, id), eq(generatedDocuments.userId, userId)),
      })
    : undefined;

  if (!row) {
    throw new HttpError(404, "NOT_FOUND", "Document not found.");
  }
  if (row.status !== "READY" || !row.content) {
    throw new HttpError(
      409,
      "DOCUMENT_NOT_READY",
      row.status === "FAILED"
        ? "This document could not be generated. Please generate it again."
        : "This document is still being prepared.",
    );
  }
  return { ...row, content: row.content };
}
