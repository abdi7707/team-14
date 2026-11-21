import * as Print from 'expo-print';

import type { SavePdfInput } from '@/lib/save-pdf';

/** Phone save. Opens the system print dialog, where Save as PDF is available. */
export async function savePdf(input: SavePdfInput): Promise<void> {
  if (!input.html) throw new Error('Nothing to save.');
  try {
    await Print.printAsync({ html: input.html });
  } catch (error) {
    if (dismissed(error)) return;
    const message = error instanceof Error ? error.message : '';
    if (message && !message.includes('Requiring unknown module')) {
      throw new Error(message);
    }
    throw new Error('Could not open the PDF. Close the app fully, open it again, then try Save as PDF.');
  }
}

function dismissed(error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  return /cancel|did not complete/i.test(message);
}
