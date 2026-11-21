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

export type SavedDocument = GeneratedDocument & {
  businessId: string;
  createdAt: string;
  source: 'practice' | 'api';
};

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
