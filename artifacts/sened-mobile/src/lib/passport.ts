import type { Href } from 'expo-router';

import type {
  AmountPeriod,
  BusinessPassport,
  PassportSectionId,
  StructuredAmount,
} from '@/types/passport';

export const SECTION_ORDER = [
  'identity',
  'location',
  'legal',
  'operations',
  'financial',
  'financing',
] as const satisfies readonly PassportSectionId[];

export type NextAction = {
  title: string;
  message: string;
  buttonTitle: string;
  href: Href;
};

type SectionLink = {
  id: PassportSectionId;
  title: string;
  description: string;
  href: Href;
};

export const PASSPORT_SECTIONS: readonly SectionLink[] = [
  {
    id: 'identity',
    title: 'Identity',
    description: 'Business name, sector, type, and year started',
    href: '/identity',
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Region and city or sub-city',
    href: '/location',
  },
  {
    id: 'legal',
    title: 'Legal',
    description: 'TIN, trade license number, and license expiry',
    href: '/legal',
  },
  {
    id: 'operations',
    title: 'Operations',
    description: 'What you sell and how many people work with you',
    href: '/operations',
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Monthly revenue, monthly expenses, and assets',
    href: '/financial',
  },
  {
    id: 'financing',
    title: 'Financing',
    description: 'Amount needed, purpose, term, and collateral',
    href: '/goal',
  },
];

const NEXT_ACTIONS: Record<PassportSectionId, NextAction> = {
  identity: {
    title: 'Add your business basics',
    message: 'Your business name, sector, and type are the first step toward potential financing matches.',
    buttonTitle: 'Add business basics',
    href: '/business-basics',
  },
  location: {
    title: 'Add your location',
    message: 'Region and city help compare your business with lender requirements.',
    buttonTitle: 'Add location',
    href: '/location',
  },
  legal: {
    title: 'Add your legal details',
    message: 'TIN and trade license details are part of a complete passport.',
    buttonTitle: 'Add legal details',
    href: '/legal',
  },
  operations: {
    title: 'Describe your operations',
    message: 'What you sell, and how many people work with you, belongs in the passport.',
    buttonTitle: 'Describe operations',
    href: '/operations',
  },
  financial: {
    title: 'Add your numbers',
    message: 'Monthly revenue, expenses, and assets are figures you enter. SENED does not verify them.',
    buttonTitle: 'Add numbers',
    href: '/financial',
  },
  financing: {
    title: 'Set your financing goal',
    message: 'Amount, purpose, term, and collateral prepare you to compare potential matches.',
    buttonTitle: 'Set financing goal',
    href: '/goal',
  },
};

const READY_ACTION: NextAction = {
  title: 'Your passport is ready to review',
  message: 'Every section has an answer. You can still edit anything before you prepare a document.',
  buttonTitle: 'Review passport',
  href: '/overview',
};

export function emptyPassport(): BusinessPassport {
  return {
    identity: { businessName: '', sector: '', businessType: '', yearStarted: '' },
    location: { region: '', city: '' },
    legal: { tin: '', tradeLicenseNumber: '', licenseExpiry: '' },
    operations: { productsServices: '', employeeCount: '' },
    financial: { monthlyRevenue: null, monthlyExpenses: null, assets: null },
    financing: { amountNeeded: null, purpose: '', preferredTerm: '', collateral: '' },
  };
}

export function sectionCompleteness(passport: BusinessPassport, section: PassportSectionId): number {
  const fields = sectionFilled(passport, section);
  return percent(fields.filter(Boolean).length, fields.length);
}

export function overallCompleteness(passport: BusinessPassport | null): number {
  if (!passport) return 0;
  const fields = SECTION_ORDER.flatMap((section) => sectionFilled(passport, section));
  return percent(fields.filter(Boolean).length, fields.length);
}

export function completenessLabel(percentComplete: number): 'Not started' | 'In progress' | 'Ready' {
  if (percentComplete >= 100) return 'Ready';
  if (percentComplete <= 0) return 'Not started';
  return 'In progress';
}

export function nextBestAction(passport: BusinessPassport | null): NextAction {
  if (!passport) return NEXT_ACTIONS.identity;
  for (const section of SECTION_ORDER) {
    if (sectionCompleteness(passport, section) < 100) return NEXT_ACTIONS[section];
  }
  return READY_ACTION;
}

export function yearError(value: string): string | null {
  const yearText = value.trim();
  if (!yearText) return null;
  if (!/^\d{4}$/.test(yearText)) return 'Enter a 4-digit year.';
  const year = Number(yearText);
  const max = new Date().getFullYear();
  if (year < 1900 || year > max) return `Enter a year from 1900 to ${max}.`;
  return null;
}

export function countError(value: string): string | null {
  const count = value.trim();
  if (!count) return null;
  if (!/^\d+$/.test(count)) return 'Enter a whole number.';
  return null;
}

export function dateError(value: string): string | null {
  const date = value.trim();
  if (!date) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Use the form YYYY-MM-DD.';
  return null;
}

export function amountError(value: string): string | null {
  return parseAmount(value, 'one-time').error;
}

export function parseAmount(
  value: string,
  period: AmountPeriod,
): { amount: StructuredAmount | null; error: string | null } {
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) return { amount: null, error: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return { amount: null, error: 'Enter a number of 0 or more.' };
  return {
    amount: {
      value: parsed,
      currency: 'ETB',
      period,
      sourceType: 'owner_entered',
      confidence: 'medium',
      verified: false,
      updatedAt: new Date().toISOString(),
    },
    error: null,
  };
}

export function amountToDraft(amount: StructuredAmount | null): string {
  if (!amount) return '';
  return String(amount.value);
}

function sectionFilled(passport: BusinessPassport, section: PassportSectionId): boolean[] {
  switch (section) {
    case 'identity':
      return [
        filledText(passport.identity.businessName),
        filledText(passport.identity.sector),
        filledText(passport.identity.businessType),
        filledText(passport.identity.yearStarted),
      ];
    case 'location':
      return [filledText(passport.location.region), filledText(passport.location.city)];
    case 'legal':
      return [
        filledText(passport.legal.tin),
        filledText(passport.legal.tradeLicenseNumber),
        filledText(passport.legal.licenseExpiry),
      ];
    case 'operations':
      return [filledText(passport.operations.productsServices), filledText(passport.operations.employeeCount)];
    case 'financial':
      return [
        filledAmount(passport.financial.monthlyRevenue),
        filledAmount(passport.financial.monthlyExpenses),
        filledAmount(passport.financial.assets),
      ];
    case 'financing':
      return [
        filledAmount(passport.financing.amountNeeded),
        filledText(passport.financing.purpose),
        filledText(passport.financing.preferredTerm),
        filledText(passport.financing.collateral),
      ];
  }
}

function filledText(value: string): boolean {
  return value.trim().length > 0;
}

function filledAmount(amount: StructuredAmount | null): boolean {
  return amount !== null && Number.isFinite(amount.value) && amount.value >= 0;
}

function percent(filled: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}
