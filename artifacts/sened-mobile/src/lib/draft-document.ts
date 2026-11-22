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

/**
 * The draft shown before payment, and the document delivered after payment.
 * Both are this same reading. Nothing else is added at download.
 */
export function documentFromHighlight(
  sections: { heading: string; body: string }[],
  language: Language,
  variant = 0,
): { heading: string; body: string }[] {
  return [
    documentHighlight(sections, language, variant),
    { heading: COPY[language].disclaimer, body: DISCLAIMER[language] },
  ];
}

/**
 * SENED's own reading of the draft. It reports preparation readiness and open
 * items. It does not repeat the facts the business already entered.
 */
export function documentHighlight(
  sections: { heading: string; body: string }[],
  language: Language,
  variant = 0,
): { heading: string; body: string } {
  const facts = letterFacts(sections);
  const style = Math.abs(variant) % 3;
  if (facts.length === 0) return { heading: HIGHLIGHT_HEADING[language], body: proseHighlight(language, sections, style) };
  const missing = facts.filter((fact) => fact.missing).map((fact) => fact.label);
  const percent = Math.round(((facts.length - missing.length) / facts.length) * 100);
  return {
    heading: HIGHLIGHT_HEADING[language],
    body: readinessHighlight(language, style, percent, missing),
  };
}

const HIGHLIGHT_HEADING: Record<Language, string> = {
  EN: 'SENED highlight',
  AM: 'የSENED ንባብ',
  OM: 'Dubbisa SENED',
};

const HIGHLIGHT_OPENING: Record<Language, [string, string, string]> = {
  EN: [
    'SENED read this draft and wrote this highlight. It does not repeat the facts you already entered.',
    "This highlight is SENED's own reading of the draft. Your entered facts stay out of it.",
    "SENED prepared a fresh reading of this draft. The highlight is the system's view, not a copy of your passport.",
  ],
  AM: [
    'SENED ይህን ረቂቅ አንብቦ ይህን ማጠቃለያ ጻፈ። እርስዎ ያስገቡትን መረጃ አይደግምም።',
    'ይህ ማጠቃለያ SENED ስለ ረቂቁ ያለው ንባብ ነው። ያስገቡት መረጃ እዚህ አይገለጽም።',
    'SENED ስለዚህ ረቂቅ አዲስ ንባብ አዘጋጅቷል። ይህ የስርዓቱ እይታ ነው፣ የፓስፖርትዎ ቅጂ አይደለም።',
  ],
  OM: [
    'SENED qophaa’aa kana dubbisee gudunfaa kana barreesse. Odeeffannoo ati galchite hin irra deebi’u.',
    'Gudunfaan kun dubbisa SENED qophaa’aa kanaa irratti qopheesse dha. Odeeffannoon ati galchite asitti hin ibsamu.',
    'SENED dubbisa haaraa qophaa’aa kanaa qopheesse. Kun ilaalcha sirnaa ti, waraabbii paaspoortii keetii miti.',
  ],
};

const HIGHLIGHT_CLOSING: Record<Language, string> = {
  EN: 'The figures behind this reading were entered by the business. They are not verified. This draft does not promise loan approval.',
  AM: 'የዚህ ንባብ መሠረት የሆኑት አሃዞች በንግዱ የተገቡ ናቸው። አልተረጋገጡም። ይህ ረቂቅ ብድር እንደሚሰጥ አያረጋግጥም።',
  OM: 'Lakkoofsota dubbisa kanaa duuba jiran daldalaan galche. Hin mirkanoofne. Qophaa’aan kun liqii kennamuu hin waada’u.',
};

function readinessHighlight(language: Language, style: number, percent: number, missing: string[]): string {
  const band = percent >= 100 ? 'complete' : percent >= 80 ? 'high' : percent >= 50 ? 'mid' : 'low';
  const gap =
    missing.length === 0
      ? COMPLETE_LINE[language][style]
      : fillGap(language, style, missing);
  return [
    HIGHLIGHT_OPENING[language][style],
    `${READINESS_LINE[language].replace('{percent}', String(percent))} ${JUDGMENT[language][band][style]}`,
    gap,
    HIGHLIGHT_CLOSING[language],
  ].join('\n\n');
}

const READINESS_LINE: Record<Language, string> = {
  EN: 'Preparation readiness for this letter is {percent}%.',
  AM: 'የዚህ ደብዳቤ የዝግጅት ደረጃ {percent}% ነው።',
  OM: 'Sadarkaan qophii waraqaa kanaa {percent}% dha.',
};

const JUDGMENT: Record<Language, Record<'complete' | 'high' | 'mid' | 'low', [string, string, string]>> = {
  EN: {
    complete: [
      'Every fact in this letter is filled in. It can be reviewed as a complete draft.',
      'Nothing in this letter is still waiting to be confirmed.',
      'The letter has no open passport facts. It can be reviewed as a complete draft.',
    ],
    high: [
      'A reader can follow the request. The letter is ready to review as a draft.',
      'The draft holds together. What remains is confirmation, not a new letter.',
      'The structure is in place. Review the open items before you rely on the full draft.',
    ],
    mid: [
      'The request is understandable, and several facts still need confirmation.',
      'Part of the letter is ready. The open items would leave a reader with questions.',
      'The draft can be reviewed, but it is not complete until the open items are filled.',
    ],
    low: [
      'Most of the letter is still open, so the full draft would read as incomplete.',
      'There is not enough confirmed fact for a reader to rely on this draft yet.',
      'The draft is only a frame until the open items are filled.',
    ],
  },
  AM: {
    complete: [
      'በዚህ ደብዳቤ ውስጥ ሁሉም ነጥቦች ተሞልተዋል። እንደ የተሟላ ረቂቅ ሊገመገም ይችላል።',
      'አሁንም እንዲረጋገጥ የቀረ ነጥብ የለም።',
      'የፓስፖርት ነጥብ ክፍት አልቀረም። እንደ የተሟላ ረቂቅ ሊገመገም ይችላል።',
    ],
    high: [
      'አንባቢ ጥያቄውን መከተል ይችላል። ደብዳቤው እንደ ረቂቅ ለግምገማ ዝግጁ ነው።',
      'ረቂቁ ተሰብስቧል። የቀረው ሥራ ማረጋገጥ ነው፣ አዲስ ደብዳቤ መጻፍ አይደለም።',
      'አወቃቀሩ ተዘጋጅቷል። ሙሉውን ረቂቅ ከመጠቀምዎ በፊት ክፍት ነጥቦችን ይመልከቱ።',
    ],
    mid: [
      'ጥያቄው ይገባል። አንዳንድ ነጥቦች ግን አሁንም ማረጋገጥ ያስፈልጋቸዋል።',
      'የደብዳቤው ክፍል ተዘጋጅቷል። ክፍት ነጥቦች አንባቢን ጥያቄ ላይ ይተዋሉ።',
      'ረቂቁ ሊገመገም ይችላል። ክፍት ነጥቦች እስኪሞሉ ድረስ አልተሟላም።',
    ],
    low: [
      'አብዛኛው ደብዳቤ አሁንም ክፍት ነው። ሙሉው ረቂቅ ያልተሟላ ሆኖ ይነበባል።',
      'አንባቢ በዚህ ረቂቅ ላይ እንዲተማመን የተረጋገጠ መረጃ በቂ አይደለም።',
      'ክፍት ነጥቦች እስኪሞሉ ድረስ ረቂቁ መሠረት ብቻ ነው።',
    ],
  },
  OM: {
    complete: [
      'Wantootni waraqaa kanaa hundi guutamaniiru. Akka qophaa’aa guutuu ilaalamuu danda’a.',
      'Wanti ammayyuu mirkaneessuuf hafe hin jiru.',
      'Wanti paaspoortii banaa hin jiru. Akka qophaa’aa guutuu ilaalamuu danda’a.',
    ],
    high: [
      'Dubbistuun gaafficha hordofuu danda’a. Waraqaan kun akka qophaa’aa ilaalamiif qophaa’eera.',
      'Qophaa’aan kun walitti qabameera. Kan hafe mirkaneessuu dha, waraqaa haaraa barreessuu miti.',
      'Caasaaan qophaa’eera. Qophaa’aa guutuu fayyadamuun dura wantoota banaa ilaali.',
    ],
    mid: [
      'Gaaffichi ni hubatama. Wantoonni muraasni ammallee mirkaneessuu barbaadu.',
      'Kutaan waraqaa qophaa’eera. Wantoonni banaa dubbistuu gaaffii waliin dhiisu.',
      'Qophaa’aan kun ilaalamuu danda’a. Wantoonni banaa guutanitti hin guutamne.',
    ],
    low: [
      'Irra caalaan waraqaa ammayyuu banaadha. Qophaa’aan guutuun akka hin guutamnetti dubbifama.',
      'Odeeffannoon mirkanaa’e dubbistuun qophaa’aa kana irratti hirkatuuf gahaa miti.',
      'Wantoonni banaa guutanitti qophaa’aan kun bu’uura qofa.',
    ],
  },
};

const COMPLETE_LINE: Record<Language, [string, string, string]> = {
  EN: [
    'No item in this letter is still marked to be confirmed.',
    'SENED found no open item in this letter.',
    'Every item used in this letter has a value.',
  ],
  AM: [
    'በዚህ ደብዳቤ ውስጥ አሁንም እንዲረጋገጥ ምልክት የተደረገ ነጥብ የለም።',
    'SENED በዚህ ደብዳቤ ክፍት ነጥብ አላገኘም።',
    'በዚህ ደብዳቤ ውስጥ የተጠቀመው እያንዳንዱ ነጥብ እሴት አለው።',
  ],
  OM: [
    'Wanti waraqaa kana keessatti ammayyuu akka mirkanaa’u mallattaa’e hin jiru.',
    'SENED waraqaa kana keessaa wanta banaa hin arganne.',
    'Wanti waraqaa kana keessatti fayyadame hundi gatii qaba.',
  ],
};

function fillGap(language: Language, style: number, missing: string[]): string {
  const shown = missing.slice(0, 6);
  const extra = missing.length - shown.length;
  const items = extra > 0 ? [...shown, moreItems(language, extra)] : shown;
  const list = joinList(language, items);
  return GAP_LINE[language][style].replace('{items}', list);
}

function moreItems(language: Language, count: number): string {
  if (language === 'AM') return `ሌሎች ${count}`;
  if (language === 'OM') return `${count} kan biraa`;
  return `${count} more`;
}

function joinList(language: Language, items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  const last = items[items.length - 1];
  const rest = items.slice(0, -1).join(language === 'AM' ? '፣ ' : ', ');
  const and = language === 'AM' ? ' እና ' : language === 'OM' ? ' fi ' : ' and ';
  return `${rest}${and}${last}`;
}

const GAP_LINE: Record<Language, [string, string, string]> = {
  EN: [
    'These items are still marked to be confirmed: {items}.',
    'SENED still needs confirmation for: {items}.',
    'Open items SENED found: {items}.',
  ],
  AM: [
    'እነዚህ ነጥቦች አሁንም እንዲረጋገጡ ምልክት ተደርገዋል፦ {items}።',
    'SENED አሁንም ማረጋገጫ የሚፈልገው፦ {items}።',
    'SENED ያገኛቸው ክፍት ነጥቦች፦ {items}።',
  ],
  OM: [
    'Wantoonni kun ammayyuu akka mirkanaa’an mallattaa’aniiru: {items}.',
    'SENED ammayyuu mirkaneessa barbaadu: {items}.',
    'Wantoota banaa SENED arge: {items}.',
  ],
};

function proseHighlight(language: Language, sections: { heading: string; body: string }[], style: number): string {
  const count = sections.filter((section) => !isDisclaimerSection(section)).length;
  return [HIGHLIGHT_OPENING[language][style], PROSE_LINE[language].replace('{count}', String(count)), HIGHLIGHT_CLOSING[language]].join(
    '\n\n',
  );
}

const PROSE_LINE: Record<Language, string> = {
  EN: 'The letter has {count} sections besides the disclaimer. This reading is the draft.',
  AM: 'ከማስታወሻው በተጨማሪ ደብዳቤው {count} ክፍሎች አሉት። ይህ ንባብ ረቂቁ ነው።',
  OM: 'Hubachiisa malees waraqaan kutaa {count} qaba. Dubbisni kun qophaa’aa dha.',
};

function letterFacts(sections: { heading: string; body: string }[]): { label: string; value: string; missing: boolean }[] {
  const seen = new Set<string>();
  const facts: { label: string; value: string; missing: boolean }[] = [];
  for (const section of sections) {
    if (isDisclaimerSection(section)) continue;
    for (const line of section.body.split('\n')) {
      const match = /^([^:\n]{1,80}):\s*(.*)$/.exec(line.trim());
      if (!match) continue;
      const label = match[1].trim();
      if (!label || seen.has(label)) continue;
      seen.add(label);
      const value = match[2].trim();
      const missing = value.length === 0 || value === MISSING;
      facts.push({ label, value, missing });
    }
  }
  return facts;
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
