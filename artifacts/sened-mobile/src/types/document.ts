import type { Language } from '@/lib/contracts';
import type { BusinessPassport } from '@/types/passport';

/** Task 2 document contract. CamelCase JSON. One copy, to move into lib/api-zod. */
export type DocType = 'LOAN_REQUEST_LETTER';
export type DocumentStatus = 'GENERATING' | 'READY' | 'FAILED';

export type DocumentSection = {
  heading: string;
  body: string;
};

export type DocumentContent = {
  title: string;
  sections: DocumentSection[];
};

export type GenerateDocumentBody = {
  docType: DocType;
  language: Language;
  businessId: string;
  passport: BusinessPassport;
};

export type GeneratedDocument = {
  id: string;
  docType: DocType;
  language: Language;
  status: DocumentStatus;
  content: DocumentContent;
};

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

/** A Chapa payment for this draft. The phone cannot confirm it. */
export type DocumentPayment = {
  transactionId: string;
  status: PaymentStatus;
  submittedAt: string;
  rejectionReason?: string;
};

export type SavedDocument = GeneratedDocument & {
  businessId: string;
  createdAt: string;
  source: 'practice' | 'api';
  /** The full draft can be downloaded only after payment is confirmed. */
  paid?: boolean;
  /** Chapa checkout. Pending and rejected payments keep the draft locked. */
  payment?: DocumentPayment;
  /** Which SENED reading to show. Regenerate advances it so the highlight changes. */
  highlightVariant?: number;
};

/** Confirmed payments unlock the draft. A pending or rejected payment stays locked. */
export function isPaymentConfirmed(document: { paid?: boolean; payment?: DocumentPayment }): boolean {
  if (document.payment?.status === 'PENDING' || document.payment?.status === 'REJECTED') return false;
  if (document.payment?.status === 'CONFIRMED') return true;
  return document.paid === true;
}

/** Loan Request Letter price from the product catalog. */
export const LOAN_LETTER_PRICE_ETB = 149;

export const DOCUMENT_CHOICES: { id: DocType; title: string; description: string }[] = [
  {
    id: 'LOAN_REQUEST_LETTER',
    title: 'Loan Request Letter',
    description: 'A draft letter prepared from your Business Passport.',
  },
];

export const LANGUAGE_CHOICES: { id: Language; label: string }[] = [
  { id: 'EN', label: 'English' },
  { id: 'AM', label: 'አማርኛ' },
  { id: 'OM', label: 'Afaan Oromoo' },
];

export function languageLabel(language: Language): string {
  return LANGUAGE_CHOICES.find((choice) => choice.id === language)?.label ?? language;
}
