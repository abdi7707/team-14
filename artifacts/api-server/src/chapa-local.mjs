import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const AMOUNT = "149";
const CHAPA_INITIALIZE = "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_VERIFY = "https://api.chapa.co/v1/transaction/verify";

loadRootEnv();
const secretKey = process.env.CHAPA_SECRET_KEY ?? "";
if (!secretKey.startsWith("CHASECK_TEST-")) {
  console.error("Local Chapa server only starts with a CHASECK_TEST secret key.");
  process.exit(1);
}

const pending = new Map();

const server = createServer(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/api/healthz") {
      send(res, 200, { status: "ok", chapa: "test" });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/payments/chapa/return") {
      const txRef =
        text(url.searchParams.get("tx") ?? "", 80) ||
        text(url.searchParams.get("trx_ref") ?? "", 80) ||
        text(url.searchParams.get("tx_ref") ?? "", 80);
      const record = txRef ? pending.get(txRef) : undefined;
      const next = record?.next || safeAppUrl(url.searchParams.get("next") ?? "");
      if (!next) {
        send(res, 400, { code: "VALIDATION_ERROR", message: "The return address is not valid." });
        return;
      }
      const status = text(url.searchParams.get("status") ?? "", 40).toLowerCase();
      sendHtml(res, returnPage({
        next: record?.next || safeAppUrl(url.searchParams.get("next") ?? ""),
        txRef,
        status,
        draftHtml: record?.draftHtml || "",
        filename: record?.filename || "sened-loan-request.pdf",
      }));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/payments/chapa/initialize") {
      const body = await readJson(req);
      const documentId = text(body.documentId, 120);
      const email = text(body.email, 120);
      const fullName = text(body.fullName, 120);
      if (!documentId || !email.includes("@") || !fullName) {
        send(res, 400, { code: "VALIDATION_ERROR", message: "The payment request is not valid." });
        return;
      }
      const txRef = `sened-${randomUUID()}`;
      const name = splitName(fullName);
      const appReturnUrl = safeAppUrl(text(body.appReturnUrl, 400));
      const draftHtml = longText(body.draftHtml, 80_000);
      const filename = pdfName(body.filename);
      const host = req.headers.host || "127.0.0.1:3000";
      const returnUrl = `http://${host}/api/payments/chapa/return?tx=${encodeURIComponent(txRef)}`;
      const checkoutUrl = await initialize({
        txRef,
        email,
        firstName: name.first,
        lastName: name.last,
        phone: phone(body.phone),
        returnUrl,
      });
      pending.set(txRef, { documentId, next: appReturnUrl, draftHtml, filename });
      send(res, 201, { txRef, checkoutUrl });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/payments/chapa/verify") {
      const body = await readJson(req);
      const txRef = text(body.txRef, 80);
      if (!txRef) {
        send(res, 400, { code: "VALIDATION_ERROR", message: "The payment request is not valid." });
        return;
      }
      const record = pending.get(txRef);
      const status = await verify(txRef);
      send(res, 200, { txRef, documentId: record?.documentId ?? "", status });
      return;
    }
    send(res, 404, { code: "NOT_FOUND", message: "Route not found." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    send(res, 502, { code: "INTERNAL_ERROR", message });
  }
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Chapa test server listening on 3000");
});

async function initialize(input) {
  const payload = {
    amount: AMOUNT,
    currency: "ETB",
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    tx_ref: input.txRef,
    ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
    customization: { title: "SENED", description: "Loan Request Letter draft" },
    meta: { payment_reason: "Loan Request Letter draft. This does not promise loan approval." },
  };
  if (input.phone) payload.phone_number = input.phone;
  let data = await chapa(CHAPA_INITIALIZE, "POST", payload);
  if (data?.status === "failed" && data?.message?.email) {
    delete payload.email;
    data = await chapa(CHAPA_INITIALIZE, "POST", payload);
  }
  const url = data?.data?.checkout_url;
  if (data?.status !== "success" || typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error("Chapa could not start the payment. Try again.");
  }
  return url;
}

async function verify(txRef) {
  const data = await chapa(`${CHAPA_VERIFY}/${encodeURIComponent(txRef)}`, "GET");
  const payment = data?.data;
  if (!payment) return "PENDING";
  const amount = Number(payment.amount);
  const status = String(payment.status ?? "").toLowerCase();
  if (payment.tx_ref !== txRef || payment.currency !== "ETB" || Math.abs(amount - 149) > 0.001) return "REJECTED";
  if (status === "success") return "CONFIRMED";
  if (status === "failed" || status === "cancelled" || status === "failed/cancelled" || status === "reversed") return "REJECTED";
  return "PENDING";
}

async function chapa(url, method, body) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Chapa could not be reached. Try again.");
  }
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403) throw new Error("Chapa rejected the server key.");
  if (!response.ok && response.status !== 400 && !payload.data) throw new Error("Chapa could not complete that request. Try again.");
  return payload;
}

function loadRootEnv() {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
  const file = path.join(dir, ".env");
  if (existsSync(file)) process.loadEnvFile(file);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendHtml(res, html) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function returnPage(input) {
  const failed = input.status === "failed" || input.status === "cancelled" || input.status === "canceled";
  const title = failed ? "Payment not completed" : "Payment receipt";
  const reference = input.txRef ? escapeHtml(input.txRef) : "Shown in SENED after you return";
  const payload = JSON.stringify({
    html: input.draftHtml || "",
    filename: input.filename || "sened-loan-request.pdf",
    homeExp: input.next,
    homeIntent: appIntentUrl(input.next),
  }).replaceAll("<", "\\u003c");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SENED</title>
<style>
  body { font-family: sans-serif; margin: 0; padding: 24px; color: #111827; background: #f8fafc; }
  article { max-width: 420px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  .amount { font-size: 32px; font-weight: 700; margin: 16px 0; }
  p { font-size: 15px; line-height: 1.45; color: #374151; }
  dt { font-size: 12px; color: #6b7280; margin-top: 12px; }
  dd { margin: 4px 0 0; font-size: 14px; word-break: break-all; }
  button { display: block; width: 100%; margin-top: 24px; padding: 16px; background: #1d4ed8; color: #ffffff; font-weight: 700; font-size: 18px; border: 0; border-radius: 12px; }
  button:disabled { background: #93c5fd; }
</style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <p class="amount">149 ETB</p>
    <p>${failed ? "Chapa did not confirm this payment." : "Tap Download PDF. The draft saves on this phone, then SENED opens on Home."}</p>
    <dl>
      <dt>Reference</dt>
      <dd>${reference}</dd>
      <dt>What this is</dt>
      <dd>A draft download. It does not promise loan approval.</dd>
    </dl>
    ${failed ? "" : `<button id="open" type="button">Download PDF</button>`}
  </article>
  ${failed ? "" : `<script>${downloadAndHomeScript(payload)}</script>`}
</body>
</html>`;
}

function downloadAndHomeScript(payload) {
  return `
    const payload = ${payload};
    const open = document.getElementById("open");
    open.addEventListener("click", () => {
      open.disabled = true;
      open.textContent = "Downloading…";
      try { downloadLetter(payload.html, payload.filename); } catch (error) {}
      const home = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? payload.homeExp : payload.homeIntent;
      setTimeout(() => { window.location.href = home; }, 400);
    });

    function downloadLetter(html, filename) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const blocks = [];
      const title = parsed.querySelector("h1")?.textContent?.trim() ?? "";
      const draft = parsed.querySelector(".draft")?.textContent?.trim() ?? "";
      if (title) blocks.push({ kind: "title", text: title });
      if (draft) blocks.push({ kind: "draft", text: draft });
      for (const section of parsed.querySelectorAll("section")) {
        const heading = section.querySelector("h2")?.textContent?.trim() ?? "";
        const body = section.querySelector("p")?.textContent ?? "";
        if (heading) blocks.push({ kind: "heading", text: heading });
        if (body.trim()) blocks.push({ kind: "body", text: body });
      }
      if (blocks.length === 0) blocks.push({ kind: "body", text: "Draft" });
      const file = new Blob([renderPdf(blocks)], { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }

    function renderPdf(blocks) {
      const scale = 2;
      const pageWidth = 595 * scale;
      const pageHeight = 842 * scale;
      const margin = 48 * scale;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      const font = '"Noto Sans Ethiopic", "Ebrima", "Nyala", sans-serif';
      const lines = [];
      for (const block of blocks) {
        const style = block.kind === "title"
          ? { font: "700 " + (22 * scale) + "px " + font, size: 22 * scale, gap: 0, color: "#111827" }
          : block.kind === "draft"
            ? { font: "700 " + (13 * scale) + "px " + font, size: 13 * scale, gap: 12 * scale, color: "#b45309" }
            : block.kind === "heading"
              ? { font: "700 " + (16 * scale) + "px " + font, size: 16 * scale, gap: 22 * scale, color: "#111827" }
              : { font: "400 " + (13 * scale) + "px " + font, size: 13 * scale, gap: 8 * scale, color: "#111827" };
        context.font = style.font;
        const wrapped = wrap(context, block.text, pageWidth - margin * 2);
        wrapped.forEach((text, index) => lines.push({ text, font: style.font, size: style.size, color: style.color, gap: index === 0 ? style.gap : 6 * scale }));
      }
      const pages = [[]];
      let y = margin;
      for (const line of lines) {
        const next = y + line.gap + line.size;
        if (next > pageHeight - margin && pages[pages.length - 1].length > 0) {
          pages.push([]);
          y = margin + line.size;
        } else {
          y = next;
        }
        pages[pages.length - 1].push(line);
      }
      const images = pages.map((page) => {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageWidth, pageHeight);
        context.textBaseline = "top";
        let top = margin;
        for (const line of page) {
          top += line.gap;
          context.font = line.font;
          context.fillStyle = line.color;
          context.fillText(line.text, margin, top);
          top += line.size;
        }
        const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        return bytes;
      });
      return buildPdf(images, pageWidth, pageHeight);
    }

    function wrap(context, text, maxWidth) {
      const lines = [];
      for (const paragraph of text.split("\\n")) {
        const words = paragraph.trim() ? paragraph.split(/\\s+/) : [""];
        let current = "";
        for (const word of words) {
          if (word === "") { lines.push(""); current = ""; continue; }
          const next = current ? current + " " + word : word;
          if (context.measureText(next).width <= maxWidth) { current = next; continue; }
          if (current) lines.push(current);
          current = word;
        }
        if (current) lines.push(current);
      }
      return lines.length ? lines : [""];
    }

    function buildPdf(images, width, height) {
      const chunks = [];
      let cursor = 0;
      const offsets = [];
      const encoder = new TextEncoder();
      const append = (data) => { chunks.push(data); cursor += data.length; };
      const text = (value) => append(encoder.encode(value));
      const object = (id, dictionary, stream) => {
        offsets[id] = cursor;
        text(id + " 0 obj\\n" + dictionary);
        if (stream) { text("\\nstream\\n"); append(stream); text("\\nendstream"); }
        text("\\nendobj\\n");
      };
      text("%PDF-1.4\\n");
      const ids = images.map((_, index) => 3 + index * 3);
      object(1, "<< /Type /Catalog /Pages 2 0 R >>");
      object(2, "<< /Type /Pages /Kids [" + ids.map((id) => id + " 0 R").join(" ") + "] /Count " + images.length + " >>");
      images.forEach((jpeg, index) => {
        const pageId = ids[index];
        const content = encoder.encode("q\\n595 0 0 842 0 0 cm\\n/Im0 Do\\nQ\\n");
        object(pageId, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents " + (pageId + 1) + " 0 R /Resources << /XObject << /Im0 " + (pageId + 2) + " 0 R >> >> >>");
        object(pageId + 1, "<< /Length " + content.length + " >>", content);
        object(pageId + 2, "<< /Type /XObject /Subtype /Image /Width " + width + " /Height " + height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpeg.length + " >>", jpeg);
      });
      const xref = cursor;
      const total = 3 + images.length * 3;
      let table = "xref\\n0 " + total + "\\n0000000000 65535 f \\n";
      for (let id = 1; id < total; id += 1) table += String(offsets[id]).padStart(10, "0") + " 00000 n \\n";
      text(table);
      text("trailer\\n<< /Size " + total + " /Root 1 0 R >>\\nstartxref\\n" + xref + "\\n%%EOF");
      const output = new Uint8Array(cursor);
      let offset = 0;
      for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
      return output;
    }
  `;
}

/** Opens the installed Expo Go app. package= is omitted because that sends the phone to the Play Store. */
function appIntentUrl(next) {
  if (!next.startsWith("exp:") && !next.startsWith("sened:")) return next;
  let url;
  try {
    url = new URL(next);
  } catch {
    return next;
  }
  const scheme = url.protocol.replace(":", "");
  const pathAndQuery = `${url.host}${url.pathname}${url.search}`;
  return `intent://${pathAndQuery}#Intent;scheme=${scheme};end`;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function safeAppUrl(value) {
  if (!value) return "";
  let url;
  try {
    url = new URL(value);
  } catch {
    return "";
  }
  if (url.protocol === "exp:" || url.protocol === "sened:") return url.toString();
  const localHost = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.startsWith("192.168.");
  if ((url.protocol === "http:" || url.protocol === "https:") && localHost) return url.toString();
  return "";
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("The payment request is not valid."));
      }
    });
    req.on("error", reject);
  });
}

function longText(value, max) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function pdfName(value) {
  const name = text(value, 80);
  return /^[A-Za-z0-9._-]+\.pdf$/.test(name) ? name : "sened-loan-request.pdf";
}

function text(value, max) {
  return typeof value === "string" && value.trim() && value.trim().length <= max ? value.trim() : "";
}

function splitName(fullName) {
  const parts = fullName.split(/\s+/);
  return { first: parts[0] || "SENED", last: parts.slice(1).join(" ") || "Customer" };
}

function phone(value) {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/\s+/g, "");
  return /^0[79]\d{8}$/.test(digits) ? digits : undefined;
}
