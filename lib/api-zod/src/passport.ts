import { z } from "zod";

// Owner-entered free text. Missing fields default to "" so a passport saved by
// an older app build still validates; the prompt writes them as "[to be confirmed]".
const Text = z.string().max(1000).default("");

export const StructuredAmount = z.object({
  value: z.number().min(0),
  currency: z.literal("ETB"),
  period: z.enum(["monthly", "one-time", "total"]),
  sourceType: z.literal("owner_entered"),
  confidence: z.enum(["low", "medium", "high"]),
  verified: z.boolean(),
  updatedAt: z.string(),
});
export type StructuredAmount = z.infer<typeof StructuredAmount>;

const Amount = StructuredAmount.nullable().default(null);

export const BusinessPassport = z.object({
  identity: z.object({
    businessName: Text,
    sector: Text,
    businessType: Text,
    yearStarted: Text,
  }),
  location: z.object({
    region: Text,
    city: Text,
  }),
  legal: z.object({
    tin: Text,
    tradeLicenseNumber: Text,
    licenseExpiry: Text,
  }),
  operations: z.object({
    productsServices: Text,
    employeeCount: Text,
  }),
  financial: z.object({
    monthlyRevenue: Amount,
    monthlyExpenses: Amount,
    assets: Amount,
  }),
  financing: z.object({
    amountNeeded: Amount,
    purpose: Text,
    preferredTerm: Text,
    collateral: Text,
  }),
});
export type BusinessPassport = z.infer<typeof BusinessPassport>;
