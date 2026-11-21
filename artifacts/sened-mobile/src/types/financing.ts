import type { PassportSectionId } from '@/types/passport';

/** Sample research until the lender table arrives. Not an official product list. */
export type ResearchTag = 'MANUAL_RESEARCH';
export type Reliability = 'MEDIUM';

export type RequirementField =
  | 'businessName'
  | 'sector'
  | 'region'
  | 'tin'
  | 'tradeLicense'
  | 'revenue'
  | 'amount'
  | 'purpose'
  | 'collateral'
  | 'employees';

export type Requirement = {
  id: string;
  label: string;
  field: RequirementField;
  section: PassportSectionId;
  source: string;
  reliability: Reliability;
  researchTag: ResearchTag;
};

export type Institution = {
  id: string;
  name: string;
  shortName: string;
  kind: 'bank' | 'microfinance';
};

export type Product = {
  id: string;
  institutionId: string;
  name: string;
  summary: string;
  minAmount: number;
  maxAmount: number;
  /** Lowercase keywords. Empty means the sample product is not limited by sector. */
  sectors: readonly string[];
  /** Lowercase keywords. Empty means the sample product is not limited by region. */
  regions: readonly string[];
  minYears: number;
  requirements: readonly Requirement[];
};

export type InstitutionRegistry = {
  institutions: readonly Institution[];
  products: readonly Product[];
};

export type FitStrength = 'closer' | 'possible' | 'lower';

export type FitResult = {
  score: number;
  strength: FitStrength;
  reasons: string[];
};

export type RequirementCheck = Requirement & { met: boolean };

export type RequirementReport = {
  met: RequirementCheck[];
  missing: RequirementCheck[];
};

export type PotentialMatch = {
  institution: Institution;
  product: Product;
  fit: FitResult;
  readiness: number;
  requirements: RequirementReport;
};
