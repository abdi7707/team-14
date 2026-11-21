import { z } from "zod";

export const LANGUAGES = ["EN", "AM", "OM"] as const;
export const Language = z.enum(LANGUAGES);
export type Language = z.infer<typeof Language>;
