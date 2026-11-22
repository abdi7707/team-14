import type { SavePdfInput } from '@/lib/save-pdf';

/** Phone save. Writes a PDF and opens the system sheet so it can be saved. */
export async function savePdf(input: SavePdfInput): Promise<void> {
  if (!input.html) throw new Error('Nothing to save.');
  try {
    // Loaded only when saving. Importing these at startup crashes Expo Go
    // before the home screen can render.
    const { File, Paths } = require('expo-file-system') as typeof import('expo-file-system');
    const Print = require('expo-print') as typeof import('expo-print');
    const Sharing = require('expo-sharing') as typeof import('expo-sharing');
    const printed = await Print.printToFileAsync({ html: input.html });
    const destination = new File(Paths.cache, input.filename);
    await new File(printed.uri).copy(destination, { overwrite: true });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(destination.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Save the SENED draft',
      });
      return;
    }
    if (await destination.canPreview()) await destination.preview();
  } catch (error) {
    if (dismissed(error)) return;
    const message = error instanceof Error ? error.message : '';
    if (message && !message.includes('Requiring unknown module')) throw new Error(message);
    throw new Error('Could not download the PDF. Close the app fully, open it again, then try Download again.');
  }
}

function dismissed(error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  return /cancel|did not complete/i.test(message);
}
