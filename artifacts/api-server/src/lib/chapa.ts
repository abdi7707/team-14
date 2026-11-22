import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "./httpError";

const CHAPA_INITIALIZE = "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_VERIFY = "https://api.chapa.co/v1/transaction/verify";

/** Loan Request Letter price. The client cannot choose a different amount. */
export const LOAN_LETTER_AMOUNT_ETB = 149;

export type ChapaCheckout = {
  txRef: string;
  checkoutUrl: string;
};

export type ChapaOutcome = "CONFIRMED" | "PENDING" | "REJECTED";

export type ChapaClient = {
  secretKey: string;
  callbackUrl?: string;
  returnUrl?: string;
};

type InitializeInput = {
  txRef: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export async function initializeChapaPayment(client: ChapaClient, input: InitializeInput): Promise<ChapaCheckout> {
  const body: Record<string, unknown> = {
    amount: String(LOAN_LETTER_AMOUNT_ETB),
    currency: "ETB",
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    tx_ref: input.txRef,
    customization: {
      title: "SENED",
      description: "Loan Request Letter draft",
    },
    meta: {
      payment_reason: "Loan Request Letter draft. This does not promise loan approval.",
    },
  };
  if (input.phone) body.phone_number = input.phone;
  if (client.callbackUrl) body.callback_url = client.callbackUrl;
  if (client.returnUrl) body.return_url = client.returnUrl;

  let payload = await chapaJson(client.secretKey, CHAPA_INITIALIZE, { method: "POST", body });
  const message = record(payload.message);
  if (payload.status === "failed" && message && "email" in message) {
    delete body.email;
    payload = await chapaJson(client.secretKey, CHAPA_INITIALIZE, { method: "POST", body });
  }
  const data = record(payload.data);
  const checkoutUrl = typeof data?.checkout_url === "string" ? data.checkout_url : "";
  if (payload.status !== "success" || !checkoutUrl.startsWith("https://")) {
    throw new HttpError(502, "INTERNAL_ERROR", "Chapa could not start the payment. Try again.");
  }
  return { txRef: input.txRef, checkoutUrl };
}

/**
 * Confirms a payment only when Chapa reports success for this reference,
 * in ETB, for the letter price. A missing payment stays pending.
 */
export async function verifyChapaPayment(client: ChapaClient, txRef: string): Promise<ChapaOutcome> {
  const payload = await chapaJson(client.secretKey, `${CHAPA_VERIFY}/${encodeURIComponent(txRef)}`, { method: "GET" });
  const data = record(payload.data);
  if (!data) return "PENDING";
  if (data.tx_ref !== txRef || data.currency !== "ETB") return "REJECTED";
  const amount = typeof data.amount === "number" ? data.amount : Number(data.amount);
  if (!Number.isFinite(amount) || Math.abs(amount - LOAN_LETTER_AMOUNT_ETB) > 0.001) return "REJECTED";
  const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
  if (status === "success") return "CONFIRMED";
  if (status === "failed" || status === "cancelled" || status === "failed/cancelled" || status === "reversed") {
    return "REJECTED";
  }
  return "PENDING";
}

/** True when either Chapa signature header matches. */
export function chapaSignatureMatches(
  webhookSecret: string | undefined,
  payload: unknown,
  headers: { chapa?: string; body?: string },
): boolean {
  const secret = webhookSecret;
  if (!secret) return false;
  const payloadHash = hmac(secret, JSON.stringify(payload));
  const keyHash = hmac(secret, secret);
  return safeEqual(headers.body, payloadHash) || safeEqual(headers.chapa, keyHash) || safeEqual(headers.chapa, payloadHash);
}

async function chapaJson(
  secretKey: string,
  url: string,
  options: { method: "GET" | "POST"; body?: unknown },
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new HttpError(502, "INTERNAL_ERROR", "Chapa could not be reached. Try again.");
  }

  const text = await response.text();
  const payload = text ? parseJson(text) : {};
  if (response.status === 401 || response.status === 403) {
    throw new HttpError(502, "INTERNAL_ERROR", "Chapa rejected the server key.");
  }
  if (!response.ok && response.status !== 400 && !payload.data) {
    throw new HttpError(502, "INTERNAL_ERROR", "Chapa could not complete that request. Try again.");
  }
  return payload;
}

function parseJson(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    return record(parsed) ?? {};
  } catch {
    throw new HttpError(502, "INTERNAL_ERROR", "Chapa returned an unexpected response.");
  }
}

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function hmac(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(received: string | undefined, expected: string): boolean {
  if (!received) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
