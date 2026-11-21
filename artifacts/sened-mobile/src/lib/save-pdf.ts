export type SavePdfInput = {
  filename: string;
  bytes?: ArrayBuffer;
  html?: string;
};

/** Web save. Metro uses save-pdf.native.ts on iOS and Android. */
export async function savePdf(input: SavePdfInput): Promise<void> {
  if (input.bytes) {
    downloadBytes(input.bytes, input.filename);
    return;
  }
  if (!input.html) throw new Error('Nothing to save.');
  printHtml(input.html);
}

function downloadBytes(bytes: ArrayBuffer, filename: string) {
  const doc = globalThis.document;
  if (!doc) throw new Error('Saving a PDF is not available here.');
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function printHtml(html: string) {
  const doc = globalThis.document;
  if (!doc?.body) throw new Error('Saving a PDF is not available here.');
  const frame = doc.createElement('iframe');
  frame.title = 'SENED draft';
  frame.style.position = 'fixed';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  doc.body.appendChild(frame);
  const frameDoc = frame.contentDocument;
  const frameWindow = frame.contentWindow;
  if (!frameDoc || !frameWindow) {
    frame.remove();
    throw new Error('Could not open the print view.');
  }
  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();
  frameWindow.focus();
  frameWindow.print();
  globalThis.setTimeout(() => frame.remove(), 1000);
}
