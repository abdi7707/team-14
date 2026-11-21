import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DocumentContent } from "@workspace/api-zod";
import PDFDocument from "pdfkit";

// Works from src/lib and from the bundled dist/ file alike.
function packageRoot() {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  while (!existsSync(path.join(dir, "package.json"))) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error("Could not find the api-server package directory");
    dir = parent;
  }
  return dir;
}

const FONTS_DIR = path.join(packageRoot(), "assets", "fonts");
const FONTS = {
  latin: path.join(FONTS_DIR, "NotoSans-Regular.ttf"),
  latinBold: path.join(FONTS_DIR, "NotoSans-Bold.ttf"),
  ethiopic: path.join(FONTS_DIR, "NotoSansEthiopic-Regular.ttf"),
  ethiopicBold: path.join(FONTS_DIR, "NotoSansEthiopic-Bold.ttf"),
};
type FontName = keyof typeof FONTS;

// Noto Sans has no Ethiopic glyphs and Noto Sans Ethiopic has no Latin letters,
// digits or most punctuation, so mixed text is drawn as runs, one font per script.
const ETHIOPIC = /[\u1200-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\u{1E7E0}-\u{1E7FF}]/u;
const WHITESPACE = /\s/u;

type Run = { text: string; ethiopic: boolean };

function scriptRuns(text: string): Run[] {
  const runs: Run[] = [];
  for (const char of text) {
    const last = runs.at(-1);
    // Spaces stay in the current run, so a sentence is not split at every word.
    if (last && WHITESPACE.test(char)) {
      last.text += char;
      continue;
    }
    const ethiopic = ETHIOPIC.test(char);
    if (last && last.ethiopic === ethiopic) last.text += char;
    else runs.push({ text: char, ethiopic });
  }
  return runs;
}

function fontFor(run: Run, bold: boolean): FontName {
  if (run.ethiopic) return bold ? "ethiopicBold" : "ethiopic";
  return bold ? "latinBold" : "latin";
}

const MARGIN = 64;
const DRAFT_COLOR = "#b45309";
const TEXT_COLOR = "#111827";

// pdfkit drops blank lines and indents the next line when a newline falls inside
// `continued` text, so each line is drawn on its own and blank lines become spacing.
function write(
  doc: PDFKit.PDFDocument,
  text: string,
  style: { size: number; bold?: boolean; color?: string; lineGap?: number },
) {
  doc.fontSize(style.size).fillColor(style.color ?? TEXT_COLOR);
  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      doc.moveDown(0.5);
      continue;
    }
    const runs = scriptRuns(line.trim());
    runs.forEach((run, index) => {
      doc.font(fontFor(run, style.bold ?? false)).text(run.text, {
        lineGap: style.lineGap ?? 2,
        continued: index < runs.length - 1,
      });
    });
  }
}

/** Renders a document as an A4 PDF, with the DRAFT label under the title. */
export function renderDocumentPdf(content: DocumentContent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      info: { Title: content.title, Creator: "SENED AI", Producer: "SENED AI" },
    });
    for (const [name, file] of Object.entries(FONTS)) doc.registerFont(name, file);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      write(doc, content.title, { size: 20, bold: true });
      write(doc, "DRAFT", { size: 10, bold: true, color: DRAFT_COLOR });
      doc.moveDown(1.5);

      for (const section of content.sections) {
        write(doc, section.heading, { size: 13, bold: true });
        doc.moveDown(0.3);
        write(doc, section.body, { size: 11, lineGap: 4 });
        doc.moveDown(1.2);
      }
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
