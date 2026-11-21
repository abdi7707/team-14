export type SavePdfInput = {
  filename: string;
  bytes?: ArrayBuffer;
  html?: string;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const SCALE = 2;
const MARGIN = 48 * SCALE;
const FONT = '"Noto Sans Ethiopic", "Ebrima", "Nyala", "Abyssinica SIL", sans-serif';

type BlockKind = 'title' | 'draft' | 'heading' | 'body';

type Block = { kind: BlockKind; text: string };

type DrawnLine = { text: string; font: string; color: string; size: number; gapBefore: number };

/** Web save. Metro uses save-pdf.native.ts on iOS and Android. */
export async function savePdf(input: SavePdfInput): Promise<void> {
  if (input.bytes) {
    await deliver(input.bytes, input.filename);
    return;
  }
  if (!input.html) throw new Error('Nothing to save.');
  await deliver(renderLetterPdf(input.html), input.filename);
}

async function deliver(bytes: ArrayBuffer | Uint8Array, filename: string): Promise<void> {
  const file = new File([bytesToCopy(bytes)], filename, { type: 'application/pdf' });
  const mobile = /iPhone|iPad|iPod|Android/i.test(globalThis.navigator?.userAgent ?? '');
  if (mobile && globalThis.navigator?.canShare?.({ files: [file] })) {
    try {
      await globalThis.navigator.share({ files: [file], title: 'SENED draft' });
      return;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
  }
  downloadBytes(file, filename);
}

function downloadBytes(file: Blob, filename: string) {
  const doc = globalThis.document;
  if (!doc?.body) throw new Error('Saving a PDF is not available here.');
  const url = URL.createObjectURL(file);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function bytesToCopy(bytes: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (bytes instanceof Uint8Array) {
    const copy = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(copy).set(bytes);
    return copy;
  }
  return bytes;
}

function renderLetterPdf(html: string): Uint8Array {
  const canvas = globalThis.document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Saving a PDF is not available here.');
  const lines = layoutLines(context, blocksFromHtml(html));
  const pages = drawPages(canvas, context, lines);
  return buildPdf(pages);
}

function blocksFromHtml(html: string): Block[] {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const blocks: Block[] = [];
  for (const element of parsed.body.children) {
    if (element.tagName === 'H1') blocks.push({ kind: 'title', text: element.textContent?.trim() ?? '' });
    if (element.tagName === 'DIV') blocks.push({ kind: 'draft', text: element.textContent?.trim() ?? '' });
    if (element.tagName === 'SECTION') {
      const heading = element.querySelector('h2')?.textContent?.trim() ?? '';
      const body = element.querySelector('p')?.textContent ?? '';
      if (heading) blocks.push({ kind: 'heading', text: heading });
      if (body.trim()) blocks.push({ kind: 'body', text: body });
    }
  }
  return blocks.length > 0 ? blocks : [{ kind: 'body', text: 'Draft' }];
}

function layoutLines(context: CanvasRenderingContext2D, blocks: Block[]): DrawnLine[] {
  const maxWidth = PAGE_WIDTH * SCALE - MARGIN * 2;
  const lines: DrawnLine[] = [];
  for (const block of blocks) {
    const style = blockStyle(block.kind);
    context.font = style.font;
    const wrapped = wrapText(context, block.text, maxWidth);
    wrapped.forEach((text, index) => {
      lines.push({
        text,
        font: style.font,
        color: style.color,
        size: style.size,
        gapBefore: index === 0 ? style.gapBefore : 6 * SCALE,
      });
    });
  }
  return lines;
}

function blockStyle(kind: BlockKind): { font: string; color: string; size: number; gapBefore: number } {
  if (kind === 'title') return { font: `700 ${22 * SCALE}px ${FONT}`, color: '#111827', size: 22 * SCALE, gapBefore: 0 };
  if (kind === 'draft') return { font: `700 ${13 * SCALE}px ${FONT}`, color: '#b45309', size: 13 * SCALE, gapBefore: 12 * SCALE };
  if (kind === 'heading') return { font: `700 ${16 * SCALE}px ${FONT}`, color: '#111827', size: 16 * SCALE, gapBefore: 22 * SCALE };
  return { font: `400 ${13 * SCALE}px ${FONT}`, color: '#111827', size: 13 * SCALE, gapBefore: 8 * SCALE };
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.trim().length === 0 ? [''] : paragraph.split(/\s+/);
    let current = '';
    for (const word of words) {
      if (word === '') {
        lines.push('');
        current = '';
        continue;
      }
      const next = current ? `${current} ${word}` : word;
      if (context.measureText(next).width <= maxWidth) {
        current = next;
        continue;
      }
      if (current) lines.push(current);
      current = word;
      while (context.measureText(current).width > maxWidth && current.length > 1) {
        let cut = current.length - 1;
        while (cut > 1 && context.measureText(current.slice(0, cut)).width > maxWidth) cut -= 1;
        lines.push(current.slice(0, cut));
        current = current.slice(cut);
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : [''];
}

function drawPages(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  lines: DrawnLine[],
): { jpeg: Uint8Array; width: number; height: number }[] {
  const pages: DrawnLine[][] = [[]];
  let y = MARGIN;
  for (const line of lines) {
    const next = y + line.gapBefore + line.size;
    if (next > PAGE_HEIGHT * SCALE - MARGIN && pages[pages.length - 1].length > 0) {
      pages.push([]);
      y = MARGIN + line.size;
    } else {
      y = next;
    }
    pages[pages.length - 1].push(line);
  }

  canvas.width = PAGE_WIDTH * SCALE;
  canvas.height = PAGE_HEIGHT * SCALE;
  return pages.map((page) => {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.textBaseline = 'top';
    let top = MARGIN;
    for (const line of page) {
      top += line.gapBefore;
      context.font = line.font;
      context.fillStyle = line.color;
      context.fillText(line.text, MARGIN, top);
      top += line.size;
    }
    return { jpeg: jpegBytes(canvas), width: canvas.width, height: canvas.height };
  });
}

function jpegBytes(canvas: HTMLCanvasElement): Uint8Array {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function buildPdf(pages: { jpeg: Uint8Array; width: number; height: number }[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  let cursor = 0;
  const offsets: number[] = [];
  const encoder = new TextEncoder();
  const append = (data: Uint8Array) => {
    chunks.push(data);
    cursor += data.length;
  };
  const text = (value: string) => append(encoder.encode(value));
  const object = (id: number, dictionary: string, stream?: Uint8Array) => {
    offsets[id] = cursor;
    text(`${id} 0 obj\n${dictionary}`);
    if (stream) {
      text('\nstream\n');
      append(stream);
      text('\nendstream');
    }
    text('\nendobj\n');
  };

  text('%PDF-1.4\n');
  const ids = pages.map((_, index) => 3 + index * 3);
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, `<< /Type /Pages /Kids [${ids.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  pages.forEach((page, index) => {
    const pageId = ids[index];
    const content = encoder.encode('q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n');
    object(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${pageId + 1} 0 R /Resources << /XObject << /Im0 ${pageId + 2} 0 R >> >> >>`,
    );
    object(pageId + 1, `<< /Length ${content.length} >>`, content);
    object(
      pageId + 2,
      `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>`,
      page.jpeg,
    );
  });

  const xref = cursor;
  const total = 3 + pages.length * 3;
  let table = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let id = 1; id < total; id += 1) table += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  text(table);
  text(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);

  const output = new Uint8Array(cursor);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}
