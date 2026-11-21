import {
  DOC_TYPES,
  DOCUMENT_STATUSES,
  LANGUAGES,
  USER_ROLES,
  type DocumentContent,
} from "@workspace/api-zod";
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Stored lowercased; RegisterBody and LoginBody normalise it before it gets here.
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: USER_ROLES }).notNull().default("user"),
  preferredLanguage: text("preferred_language", { enum: LANGUAGES }).notNull().default("EN"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const generatedDocuments = pgTable(
  "generated_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // The business lives on the device for now; this is the app's local id.
    businessId: text("business_id").notNull(),
    docType: text("doc_type", { enum: DOC_TYPES }).notNull(),
    language: text("language", { enum: LANGUAGES }).notNull(),
    status: text("status", { enum: DOCUMENT_STATUSES }).notNull().default("GENERATING"),
    content: jsonb("content").$type<DocumentContent>(),
    // Internal diagnostic for FAILED rows. Never sent to clients.
    errorMessage: text("error_message"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("generated_documents_user_created_idx").on(table.userId, table.createdAt)],
);

export type UserRow = typeof users.$inferSelect;
export type GeneratedDocumentRow = typeof generatedDocuments.$inferSelect;
