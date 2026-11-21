/** Supporting files a lender usually asks to see. They stay on this device. */

export const UPLOAD_KINDS = ['TRADE_LICENSE', 'TIN_CERTIFICATE', 'BANK_STATEMENT', 'NATIONAL_ID'] as const;

export type UploadKind = (typeof UPLOAD_KINDS)[number];

export type StoredUpload = {
  kind: UploadKind;
  fileName: string;
  mimeType: string;
  size: number;
  addedAt: string;
};
