import {
  DOCUMENT_TITLES,
  MISSING_VALUE,
  type BusinessPassport,
  type DocType,
  type Language,
  type StructuredAmount,
} from "@workspace/api-zod";

const LANGUAGE_NAMES: Record<Language, string> = {
  EN: "English",
  AM: "Amharic",
  OM: "Afaan Oromoo",
};

const LANGUAGE_RULES: Record<Language, string> = {
  EN: "Write every heading and paragraph in clear, formal English.",
  AM: "Write every heading and paragraph in formal Amharic (አማርኛ) using Ethiopic script. Keep names, numbers, the TIN and license numbers exactly as given.",
  OM: "Write every heading and paragraph in formal Afaan Oromoo using Latin script (Qubee). Keep names, numbers, the TIN and license numbers exactly as given.",
};

const OUTLINES: Record<DocType, { name: string; sections: string[] }> = {
  LOAN_REQUEST_LETTER: {
    name: "loan request letter from the business owner to a bank or microfinance institution",
    sections: [
      "Opening: introduce the business (name, business type, sector, location and year started) and say that it is requesting financing.",
      "Financing request: the amount needed, its purpose, the preferred repayment term and the collateral offered.",
      "Business operations: the products or services and the number of employees.",
      "Financial overview: monthly revenue, monthly expenses and assets, described as figures reported by the owner that have not been verified.",
      "Legal details: the TIN, the trade license number and the license expiry date.",
      "Closing: thank the lender, offer to provide supporting documents, and ask to discuss next steps.",
    ],
  },
};

const SYSTEM_INSTRUCTION = `You are SENED AI. You write draft business documents for small and medium business owners in Ethiopia, using only the facts in their Business Passport.

Rules:
1. Use only the facts given in the Business Passport. Never invent names, figures, dates, places, lenders, licenses or any other fact.
2. When a fact the outline asks for is missing, write ${MISSING_VALUE} in its place.
3. Copy every number exactly as given. Do not calculate totals, yearly amounts, percentages or any other new figure, and do not convert currencies or calendars.
4. Never say or suggest that financing is approved or guaranteed, or that the business is eligible. Do not use the words "approved", "eligible" or "guaranteed", or their equivalents in any language.
5. Write in the owner's voice, as a draft the owner will review. Do not claim the document is official or verified.
6. Do not add a date, a signature, contact details or the lender's name; write ${MISSING_VALUE} where a letter would normally have them.
7. Use plain text without Markdown. Separate paragraphs inside a section with a blank line.
8. Do not add a disclaimer section. SENED adds one.`;

function text(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : MISSING_VALUE;
}

const PERIODS: Record<StructuredAmount["period"], string> = {
  monthly: "per month",
  "one-time": "one-time",
  total: "total",
};

function amount(value: StructuredAmount | null) {
  if (!value) return MISSING_VALUE;
  const status = value.verified ? "verified" : "owner-entered, not verified";
  return `${value.value} ${value.currency} (${PERIODS[value.period]}, ${status})`;
}

/** The facts exactly as the model sees them. The figure check uses the same text. */
export function passportFacts(passport: BusinessPassport): string {
  const { identity, location, legal, operations, financial, financing } = passport;
  const facts: [string, string][] = [
    ["Business name", text(identity.businessName)],
    ["Business type", text(identity.businessType)],
    ["Sector", text(identity.sector)],
    ["Year started", text(identity.yearStarted)],
    ["Region", text(location.region)],
    ["City", text(location.city)],
    ["TIN", text(legal.tin)],
    ["Trade license number", text(legal.tradeLicenseNumber)],
    ["License expiry", text(legal.licenseExpiry)],
    ["Products or services", text(operations.productsServices)],
    ["Number of employees", text(operations.employeeCount)],
    ["Monthly revenue", amount(financial.monthlyRevenue)],
    ["Monthly expenses", amount(financial.monthlyExpenses)],
    ["Assets", amount(financial.assets)],
    ["Amount needed", amount(financing.amountNeeded)],
    ["Purpose of the financing", text(financing.purpose)],
    ["Preferred term", text(financing.preferredTerm)],
    ["Collateral offered", text(financing.collateral)],
  ];
  return facts.map(([label, value]) => `- ${label}: ${value}`).join("\n");
}

export function buildPrompt(docType: DocType, language: Language, facts: string) {
  const outline = OUTLINES[docType];
  const languageName = LANGUAGE_NAMES[language];
  const user = `Write a ${outline.name}, in ${languageName}.
The document title is "${DOCUMENT_TITLES[docType][language]}"; do not repeat it inside the sections.
${LANGUAGE_RULES[language]}

Write these sections in this order. Give each one a short heading in ${languageName}:
${outline.sections.map((section, index) => `${index + 1}. ${section}`).join("\n")}

Business Passport (entered by the owner):
${facts}

Return JSON only, in this shape: {"sections": [{"heading": "...", "body": "..."}]}`;

  return { system: SYSTEM_INSTRUCTION, user };
}
