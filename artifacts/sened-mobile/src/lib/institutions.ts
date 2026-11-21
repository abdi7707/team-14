import type { InstitutionRegistry, Requirement, RequirementField } from '@/types/financing';
import type { PassportSectionId } from '@/types/passport';

const SOURCE = 'Hackathon sample, pending the lender research table. Confirm with the institution.';

const BASE_FIELDS: { field: RequirementField; label: string; section: PassportSectionId }[] = [
  { field: 'businessName', label: 'Business name', section: 'identity' },
  { field: 'sector', label: 'Sector', section: 'identity' },
  { field: 'region', label: 'Region', section: 'location' },
  { field: 'tin', label: 'TIN', section: 'legal' },
  { field: 'tradeLicense', label: 'Trade license number', section: 'legal' },
  { field: 'revenue', label: 'Monthly revenue', section: 'financial' },
  { field: 'amount', label: 'Amount needed', section: 'financing' },
];

function requirement(field: RequirementField, label: string, section: PassportSectionId): Requirement {
  return {
    id: field,
    label,
    field,
    section,
    source: SOURCE,
    reliability: 'MEDIUM',
    researchTag: 'MANUAL_RESEARCH',
  };
}

const baseRequirements = BASE_FIELDS.map((item) => requirement(item.field, item.label, item.section));

function withExtra(
  extras: { field: RequirementField; label: string; section: PassportSectionId }[],
): Requirement[] {
  return [...baseRequirements, ...extras.map((item) => requirement(item.field, item.label, item.section))];
}

/** Six sample institutions. Replace with Abdisa's lender table when it arrives. */
export const SAMPLE_REGISTRY: InstitutionRegistry = {
  institutions: [
    { id: 'cbe', name: 'Commercial Bank of Ethiopia', shortName: 'CBE', kind: 'bank' },
    { id: 'dbe', name: 'Development Bank of Ethiopia', shortName: 'DBE', kind: 'bank' },
    { id: 'dashen', name: 'Dashen Bank', shortName: 'Dashen', kind: 'bank' },
    { id: 'awash', name: 'Awash Bank', shortName: 'Awash', kind: 'bank' },
    { id: 'cooporo', name: 'Cooperative Bank of Oromia', shortName: 'CoopOro', kind: 'bank' },
    { id: 'acsi', name: 'Amhara Credit and Savings Institution', shortName: 'ACSI', kind: 'microfinance' },
  ],
  products: [
    {
      id: 'cbe-sme',
      institutionId: 'cbe',
      name: 'SME Working Capital',
      summary: 'Sample working-capital range for a commercial bank.',
      minAmount: 50_000,
      maxAmount: 5_000_000,
      sectors: [],
      regions: [],
      minYears: 1,
      requirements: baseRequirements,
    },
    {
      id: 'dbe-project',
      institutionId: 'dbe',
      name: 'SME Project Finance',
      summary: 'Sample project range aimed at agriculture and manufacturing.',
      minAmount: 500_000,
      maxAmount: 20_000_000,
      sectors: ['agriculture', 'manufacturing', 'agro-processing', 'coffee'],
      regions: [],
      minYears: 2,
      requirements: withExtra([
        { field: 'purpose', label: 'Purpose', section: 'financing' },
        { field: 'collateral', label: 'Collateral', section: 'financing' },
      ]),
    },
    {
      id: 'dashen-sme',
      institutionId: 'dashen',
      name: 'SME Loan',
      summary: 'Sample private-bank range for an established business.',
      minAmount: 100_000,
      maxAmount: 10_000_000,
      sectors: [],
      regions: [],
      minYears: 1,
      requirements: withExtra([{ field: 'collateral', label: 'Collateral', section: 'financing' }]),
    },
    {
      id: 'awash-business',
      institutionId: 'awash',
      name: 'Business Loan',
      summary: 'Sample business-loan range with no sector limit in this demo.',
      minAmount: 50_000,
      maxAmount: 5_000_000,
      sectors: [],
      regions: [],
      minYears: 1,
      requirements: baseRequirements,
    },
    {
      id: 'cooporo-sme',
      institutionId: 'cooporo',
      name: 'SME Loan',
      summary: 'Sample range with an Oromia focus in this demo.',
      minAmount: 50_000,
      maxAmount: 3_000_000,
      sectors: [],
      regions: ['oromia', 'oromiya'],
      minYears: 1,
      requirements: baseRequirements,
    },
    {
      id: 'acsi-mse',
      institutionId: 'acsi',
      name: 'Micro and Small Enterprise Loan',
      summary: 'Sample microfinance range with an Amhara focus and a lower ceiling.',
      minAmount: 5_000,
      maxAmount: 500_000,
      sectors: ['trade', 'service', 'agriculture', 'coffee'],
      regions: ['amhara'],
      minYears: 0,
      requirements: withExtra([{ field: 'employees', label: 'Employees', section: 'operations' }]),
    },
  ],
};

export const RESEARCH_NOTE = 'Based on manual research. Confirm with the institution.';
