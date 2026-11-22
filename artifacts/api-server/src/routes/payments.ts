import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { initializeChapaPayment, verifyChapaPayment, chapaSignatureMatches, LOAN_LETTER_AMOUNT_ETB, type ChapaClient } from "../lib/chapa";
import { env } from "../lib/env";
import { HttpError } from "../lib/httpError";
import { parseBody } from "../lib/validation";
import { requireAuth } from "../middlewares/auth";
import { paymentLimiter } from "../middlewares/rateLimits";

const InitializeBody = z.object({
  documentId: z.string().trim().min(1, "Enter the document.").max(120, "That document id is too long."),
  email: z.string().trim().email("Enter a valid email."),
  fullName: z.string().trim().min(1, "Enter your name.").max(120, "That name is too long."),
  phone: z.string().trim().max(20).optional(),
});

const VerifyBody = z.object({
  txRef: z.string().trim().min(8, "Enter the payment reference.").max(80, "That payment reference is too long."),
});

type PendingPayment = {
  txRef: string;
  userId: string;
  documentId: string;
  amount: number;
};

const pendingPayments = new Map<string, PendingPayment>();

export const paymentsRouter = Router();

paymentsRouter.post("/payments/chapa/initialize", requireAuth, paymentLimiter, async (req, res) => {
  const body = parseBody(InitializeBody, req.body);
  const txRef = `sened-${randomUUID()}`;
  const name = splitName(body.fullName);
  const checkout = await initializeChapaPayment(chapaClient(), {
    txRef,
    email: body.email,
    firstName: name.firstName,
    lastName: name.lastName,
    phone: chapaPhone(body.phone),
  });
  pendingPayments.set(txRef, {
    txRef,
    userId: req.user!.id,
    documentId: body.documentId,
    amount: LOAN_LETTER_AMOUNT_ETB,
  });
  res.status(201).json({ txRef: checkout.txRef, checkoutUrl: checkout.checkoutUrl });
});

paymentsRouter.post("/payments/chapa/verify", requireAuth, paymentLimiter, async (req, res) => {
  const body = parseBody(VerifyBody, req.body);
  const pending = pendingPayments.get(body.txRef);
  if (!pending || pending.userId !== req.user!.id) {
    throw new HttpError(404, "NOT_FOUND", "This payment was not started on your account.");
  }
  const status = await verifyChapaPayment(chapaClient(), body.txRef);
  res.json({ txRef: body.txRef, documentId: pending.documentId, status });
});

paymentsRouter.post("/payments/chapa/webhook", async (req, res) => {
  const trusted = chapaSignatureMatches(env.CHAPA_WEBHOOK_SECRET, req.body, {
    chapa: req.get("chapa-signature") ?? undefined,
    body: req.get("x-chapa-signature") ?? undefined,
  });
  if (!trusted) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Webhook signature did not match." });
    return;
  }
  const txRef = typeof req.body?.tx_ref === "string" ? req.body.tx_ref : "";
  if (txRef && pendingPayments.has(txRef)) {
    try {
      await verifyChapaPayment(chapaClient(), txRef);
    } catch {
      req.log.warn({ txRef }, "Chapa webhook could not be verified yet");
    }
  }
  res.sendStatus(200);
});

function chapaClient(): ChapaClient {
  if (!env.CHAPA_SECRET_KEY) {
    throw new HttpError(
      503,
      "INTERNAL_ERROR",
      "Chapa is not configured on the server yet. Add the test secret key and try again.",
    );
  }
  return {
    secretKey: env.CHAPA_SECRET_KEY,
    callbackUrl: env.CHAPA_CALLBACK_URL,
    returnUrl: env.CHAPA_RETURN_URL,
  };
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] || "SENED", lastName: parts.slice(1).join(" ") || "Customer" };
}

function chapaPhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\s+/g, "");
  return /^0[79]\d{8}$/.test(digits) ? digits : undefined;
}
