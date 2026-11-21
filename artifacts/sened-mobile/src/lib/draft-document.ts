import type { Language } from '@/lib/contracts';
import type { BusinessPassport, StructuredAmount } from '@/types/passport';
import type { DocType, DocumentContent } from '@/types/document';

const MISSING = '[to be confirmed]';

const DISCLAIMER: Record<Language, string> = {
  EN: 'This is a draft for preparation. It is not an official document, and it does not promise loan approval.',
  AM: 'ይህ ሰነድ ረቂቅ ብቻ ነው። ኦፊሴላዊ ሰነድ አይደለም። ብድር እንደሚሰጥ አያረጋግጥም።',
  OM: "Kun waraqaa qophaa'aa dha. Sanada seeraa miti. Liqii kennamuu hin waada'u.",
};

const DISCLAIMER_HEADINGS = new Set(['Disclaimer', 'ማስታወሻ', 'Hubachiisa']);

type Copy = {
  title: string;
  business: string;
  request: string;
  operations: string;
  financial: string;
  financialNote: string;
  legal: string;
  disclaimer: string;
  name: string;
  type: string;
  sector: string;
  city: string;
  region: string;
  year: string;
  amount: string;
  purpose: string;
  term: string;
  collateral: string;
  products: string;
  employees: string;
  revenue: string;
  expenses: string;
  assets: string;
  tin: string;
  license: string;
  expiry: string;
};

const COPY: Record<Language, Copy> = {
  EN: {
    title: 'Loan Request Letter',
    business: 'Business',
    request: 'Financing goal',
    operations: 'Operations',
    financial: 'Financial figures',
    financialNote: 'These figures were entered by the business. They are not verified.',
    legal: 'Legal details',
    disclaimer: 'Disclaimer',
    name: 'Business name',
    type: 'Business type',
    sector: 'Sector',
    city: 'City',
    region: 'Region',
    year: 'Year started',
    amount: 'Amount needed',
    purpose: 'Purpose',
    term: 'Preferred term',
    collateral: 'Collateral',
    products: 'Products or services',
    employees: 'Employees',
    revenue: 'Monthly revenue',
    expenses: 'Monthly expenses',
    assets: 'Assets',
    tin: 'TIN',
    license: 'Trade license number',
    expiry: 'License expiry',
  },
  AM: {
    title: 'የብድር ጥያቄ ደብዳቤ',
    business: 'ንግድ',
    request: 'የፋይናንስ ግብ',
    operations: 'ሥራ',
    financial: 'የገንዘብ አሃዞች',
    financialNote: 'እነዚህ አሃዞች በንግዱ የተገቡ ናቸው። አልተረጋገጡም።',
    legal: 'ሕጋዊ ዝርዝር',
    disclaimer: 'ማስታወሻ',
    name: 'የንግድ ስም',
    type: 'የንግድ ዓይነት',
    sector: 'ዘርፍ',
    city: 'ከተማ',
    region: 'ክልል',
    year: 'የተጀመረበት ዓመት',
    amount: 'የተጠየቀ መጠን',
    purpose: 'ዓላማ',
    term: 'የጊዜ ርዝመት',
    collateral: 'መያዣ',
    products: 'ምርቶች ወይም አገልግሎቶች',
    employees: 'የሰራተኞች ብዛት',
    revenue: 'ወርሃዊ ገቢ',
    expenses: 'ወርሃዊ ወጪ',
    assets: 'ንብረት',
    tin: 'የግብር መለያ ቁጥር',
    license: 'የንግድ ፈቃድ ቁጥር',
    expiry: 'የፈቃድ ማብቂያ',
  },
  OM: {
    title: 'Waraqaa Gaaffii Liqii',
    business: 'Daldala',
    request: 'Kaayyoo faayinaansii',
    operations: 'Hojii',
    financial: 'Lakkoofsota faayinaansii',
    financialNote: 'Lakkoofsota kana daldalaan galche. Hin mirkanoofne.',
    legal: "Bal'ina seeraa",
    disclaimer: 'Hubachiisa',
    name: 'Maqaa daldalaa',
    type: 'Gosa daldalaa',
    sector: 'Seektara',
    city: 'Magaalaa',
    region: 'Naannoo',
    year: 'Bara jalqabaa',
    amount: 'Hamma gaafatamu',
    purpose: 'Kaayyoo',
    term: 'Yeroo filatame',
    collateral: 'Wabii',
    products: 'Oomisha yookaan tajaajila',
    employees: 'Baay’ina hojjettootaa',
    revenue: "Galii ji'aa",
    expenses: "Baasii ji'aa",
    assets: 'Qabeenya',
    tin: 'TIN',
    license: 'Lakkoofsa hayyama daldalaa',
    expiry: 'Guyyaa hayyamni itti xumuramu',
  },
};

export function buildDraftContent(docType: DocType, language: Language, passport: BusinessPassport): DocumentContent {
  const copy = COPY[language];
  if (docType !== 'LOAN_REQUEST_LETTER') {
    return { title: copy.title, sections: [] };
  }
  return {
    title: copy.title,
    sections: [
      {
        heading: copy.business,
        body: lines([
          [copy.name, text(passport.identity.businessName)],
          [copy.type, text(passport.identity.businessType)],
          [copy.sector, text(passport.identity.sector)],
          [copy.city, text(passport.location.city)],
          [copy.region, text(passport.location.region)],
          [copy.year, text(passport.identity.yearStarted)],
        ]),
      },
      {
        heading: copy.request,
        body: lines([
          [copy.amount, money(passport.financing.amountNeeded)],
          [copy.purpose, text(passport.financing.purpose)],
          [copy.term, text(passport.financing.preferredTerm)],
          [copy.collateral, text(passport.financing.collateral)],
        ]),
      },
      {
        heading: copy.operations,
        body: lines([
          [copy.products, text(passport.operations.productsServices)],
          [copy.employees, text(passport.operations.employeeCount)],
        ]),
      },
      {
        heading: copy.financial,
        body: `${copy.financialNote}\n\n${lines([
          [copy.revenue, money(passport.financial.monthlyRevenue)],
          [copy.expenses, money(passport.financial.monthlyExpenses)],
          [copy.assets, money(passport.financial.assets)],
        ])}`,
      },
      {
        heading: copy.legal,
        body: lines([
          [copy.tin, text(passport.legal.tin)],
          [copy.license, text(passport.legal.tradeLicenseNumber)],
          [copy.expiry, text(passport.legal.licenseExpiry)],
        ]),
      },
      { heading: copy.disclaimer, body: DISCLAIMER[language] },
    ],
  };
}

/** Keeps the closing disclaimer in the document language, including letters saved earlier with all three. */
export function withSelectedDisclaimer(
  language: Language,
  sections: { heading: string; body: string }[],
): { heading: string; body: string }[] {
  const heading = COPY[language].disclaimer;
  const body = DISCLAIMER[language];
  let found = false;
  const next = sections.map((section) => {
    if (!isDisclaimerSection(section)) return section;
    found = true;
    return { heading, body };
  });
  return found ? next : [...next, { heading, body }];
}

function isDisclaimerSection(section: { heading: string; body: string }): boolean {
  if (DISCLAIMER_HEADINGS.has(section.heading.trim())) return true;
  const included = Object.values(DISCLAIMER).filter((text) => section.body.includes(text));
  return included.length >= 2;
}

export function documentHtml(title: string, sections: { heading: string; body: string }[]): string {
  const body = sections
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`,
    )
    .join('');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: "Noto Sans Ethiopic", "Ebrima", "Nyala", sans-serif; color: #111827; margin: 32px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .draft { color: #b45309; font-weight: 700; margin-bottom: 24px; }
  h2 { font-size: 16px; margin: 0 0 8px; }
  section { margin-bottom: 20px; }
  p { white-space: pre-wrap; line-height: 1.5; margin: 0; }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="draft">DRAFT</div>
  ${body}
</body>
</html>`;
}

function lines(pairs: [string, string][]): string {
  return pairs.map(([label, value]) => `${label}: ${value}`).join('\n');
}

function text(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : MISSING;
}

function money(amount: StructuredAmount | null): string {
  if (!amount || !Number.isFinite(amount.value)) return MISSING;
  const rendered = Number.isInteger(amount.value) ? String(amount.value) : String(amount.value);
  return `${rendered} ETB`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
