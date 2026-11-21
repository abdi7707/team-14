/**
 * MVP Business Passport. Money uses StructuredAmount so every figure records
 * where it came from. This is the passport object a later generate call can send.
 */

export type AmountPeriod = 'monthly' | 'one-time' | 'total';
export type AmountSourceType = 'owner_entered';
export type AmountConfidence = 'low' | 'medium' | 'high';

export type StructuredAmount = {
  value: number;
  currency: 'ETB';
  period: AmountPeriod;
  sourceType: AmountSourceType;
  confidence: AmountConfidence;
  verified: boolean;
  updatedAt: string;
};

export type IdentitySection = {
  businessName: string;
  sector: string;
  businessType: string;
  yearStarted: string;
};

export type LocationSection = {
  region: string;
  city: string;
};

export type LegalSection = {
  tin: string;
  tradeLicenseNumber: string;
  licenseExpiry: string;
};

export type OperationsSection = {
  productsServices: string;
  employeeCount: string;
};

export type FinancialSection = {
  monthlyRevenue: StructuredAmount | null;
  monthlyExpenses: StructuredAmount | null;
  assets: StructuredAmount | null;
};

export type FinancingSection = {
  amountNeeded: StructuredAmount | null;
  purpose: string;
  preferredTerm: string;
  collateral: string;
};

export type BusinessPassport = {
  identity: IdentitySection;
  location: LocationSection;
  legal: LegalSection;
  operations: OperationsSection;
  financial: FinancialSection;
  financing: FinancingSection;
};

export type PassportSectionId = keyof BusinessPassport;

export type BusinessRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  passport: BusinessPassport;
};
