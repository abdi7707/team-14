import type { SavePdfInput } from '@/lib/save-pdf';

export async function savePdf(input: SavePdfInput): Promise<void> {
  const Sharing = await import('expo-sharing');
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Saving a PDF is not available on this device.');
  }

  let uri: string;
  if (input.bytes) {
    const { File, Paths } = await import('expo-file-system');
    const file = new File(Paths.cache, input.filename);
    file.create({ overwrite: true });
    await file.write(input.bytes);
    uri = file.uri;
  } else if (input.html) {
    const Print = await import('expo-print');
    const result = await Print.printToFileAsync({ html: input.html });
    uri = result.uri;
  } else {
    throw new Error('Nothing to save.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Save PDF',
  });
}
