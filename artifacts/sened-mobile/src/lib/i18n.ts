import type { Href } from 'expo-router';

import type { Language } from '@/lib/contracts';
import type { PassportSectionId } from '@/types/passport';

/**
 * Main-screen copy as [English, Amharic, Afaan Oromoo] tuples.
 * Shared terms stay in `terms`. A native reader should review Amharic and Afaan Oromoo.
 */
export type Phrase = readonly [string, string, string];

const INDEX: Record<Language, 0 | 1 | 2> = { EN: 0, AM: 1, OM: 2 };

export function translate(language: Language, phrase: Phrase): string {
  return phrase[INDEX[language]];
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

export function isLanguage(value: string | null): value is Language {
  return value === 'EN' || value === 'AM' || value === 'OM';
}

/** Consistent business terms. Reuse these instead of inventing a second wording. */
export const terms = {
  businessPassport: ['Business Passport', 'የንግድ ፓስፖርት', 'Paaspoortii daldalaa'],
  potentialMatch: ['potential match', 'ሊሆን የሚችል ተዛማጅ', "fakkaannaa ta'uu danda'u"],
  preparationReadiness: ['preparation readiness', 'የዝግጅት ደረጃ', 'sadarkaa qophii'],
  financing: ['Financing', 'ፋይናንስ', 'Faayinaansii'],
} as const satisfies Record<string, Phrase>;

export const copy = {
  tabs: {
    home: ['Home', 'መነሻ', 'Fuula'],
    business: ['Business', 'ንግድ', 'Daldala'],
    documents: ['Documents', 'ሰነዶች', 'Sanadoota'],
    financing: terms.financing,
    profile: ['Profile', 'መገለጫ', 'Profaayilii'],
  },
  home: {
    subtitle: ['Prepare your business for financing.', 'ንግድዎን ለፋይናንስ ያዘጋጁ።', 'Daldala keessan faayinaansiif qopheessaa.'],
    loading: ['Loading', 'በመጫን ላይ', 'Fe\'aa jira'],
    checking: ['Checking your passport…', 'ፓስፖርትዎን በመመልከት ላይ…', "Paaspoortii keessan ilaalaa jira…"],
    percentComplete: ['{percent}% complete', '{percent}% ተሞልቷል', '{percent}% guutame'],
    nextAction: ['Next best action', 'ቀጣይ እርምጃ', 'Tarkaanfii itti aanu'],
  },
  status: {
    notStarted: ['Not started', 'አልተጀመረም', 'Hin jalqabamne'],
    inProgress: ['In progress', 'በሂደት ላይ', 'Adeemsa irra'],
    ready: ['Ready', 'ዝግጁ', "Qophaa'e"],
  },
  business: {
    subtitle: [
      'Your Business Passport is the single source of truth for every document and lender.',
      'የንግድ ፓስፖርት ለሰነድም ለተቋምም አንድ መረጃ ነው።',
      'Paaspoortiin daldalaa sanadaafii fi dhaabbataaf odeeffannoo tokkicha.',
    ],
    loading: ['Loading your passport…', 'ፓስፖርትዎን በመጫን ላይ…', "Paaspoortii keessan fe'aa jira…"],
    signInTitle: ['Sign in to see your business', 'ንግድዎን ለማየት ይግቡ', 'Daldala keessan ilaaluuf seenaa'],
    signInMessage: [
      'Each account keeps its own passport on this device.',
      'እያንዳንዱ መለያ የራሱን ፓስፖርት በዚህ መሣሪያ ይጠብቃል።',
      'Akkaawuntii hundi paaspoortii ofii isaa meeshaa kana irratti kuusa.',
    ],
    emptyTitle: ['No business yet', 'ገና ንግድ የለም', 'Daldalli amma hin jiru'],
    emptyMessage: [
      'Create your business to start filling in your Business Passport.',
      'የንግድ ፓስፖርት ለመጀመር ንግድዎን ይፍጠሩ።',
      'Paaspoortii daldalaa jalqabuuf daldala uumaa.',
    ],
    emptyAction: ['Create your business', 'ንግድ ይፍጠሩ', 'Daldala uumaa'],
    untitled: ['Untitled business', 'ስም የሌለው ንግድ', 'Daldala maqaa hin qabne'],
    open: ['Open passport', 'ፓስፖርት ክፈት', 'Paaspoortii banuu'],
  },
  documents: {
    subtitle: [
      'Professional drafts generated from your Business Passport.',
      'ከንግድ ፓስፖርትዎ የተዘጋጁ ረቂቅ ሰነዶች።',
      'Sanadoota qophaa\'aa paaspoortii daldalaa irraa qophaa\'an.',
    ],
    checking: ['Checking your documents…', 'ሰነዶችዎን በመመልከት ላይ…', 'Sanadoota keessan ilaalaa jira…'],
    signInTitle: ['Sign in to see your documents', 'ሰነዶችዎን ለማየት ይግቡ', 'Sanadoota keessan ilaaluuf seenaa'],
    emptyTitle: ['No documents yet', 'ገና ሰነድ የለም', 'Sanadni amma hin jiru'],
    letterPrompt: [
      'Generate a loan request letter in English, Amharic, or Afaan Oromoo.',
      'የብድር ጥያቄ ደብዳቤ በእንግሊዝኛ፣ በአማርኛ ወይም በአፋን ኦሮሞ ያዘጋጁ።',
      'Waraqaa gaaffii liqii Afaan Ingiliffaa, Amaariffaa yookaan Afaan Oromootiin qopheessaa.',
    ],
    generate: ['Generate Loan Request Letter', 'የብድር ጥያቄ ደብዳቤ አዘጋጅ', 'Waraqaa gaaffii liqii qopheessi'],
  },
  financing: {
    subtitle: [
      'See potential matches and your preparation readiness.',
      'ሊሆኑ የሚችሉ ተዛማጆችን እና የዝግጅት ደረጃዎን ይመልከቱ።',
      "Fakkaattuu ta'uu danda'anii fi sadarkaa qophii keessan ilaalaa.",
    ],
    checking: ['Checking your passport…', 'ፓስፖርትዎን በመመልከት ላይ…', "Paaspoortii keessan ilaalaa jira…"],
    signInTitle: ['Sign in to see potential matches', 'ተዛማጆችን ለማየት ይግቡ', "Fakkaattuu ilaaluuf seenaa"],
    signInMessage: [
      'Preparation readiness is calculated from your Business Passport.',
      'የዝግጅት ደረጃ ከንግድ ፓስፖርትዎ ይሰላል።',
      'Sadarkaan qophii paaspoortii daldalaa keessan irraa shallagama.',
    ],
    emptyTitle: ['Add your business first', 'መጀመሪያ ንግድዎን ያክሉ', 'Dursa daldala keessan galchaa'],
    emptyMessage: [
      'Potential matches are calculated from your Business Passport.',
      'ሊሆኑ የሚችሉ ተዛማጆች ከንግድ ፓስፖርትዎ ይሰላሉ።',
      "Fakkaattuu ta'uu danda'an paaspoortii daldalaa keessan irraa shallagamu.",
    ],
    emptyAction: ['Add business basics', 'የንግድ መሠረት ያክሉ', 'Bu\'uura daldalaa galchaa'],
    readiness: ['{percent}% preparation readiness', '{percent}% የዝግጅት ደረጃ', '{percent}% sadarkaa qophii'],
    averageNote: [
      'Averaged across the sample products. Missing facts, such as a TIN or a license, lower it.',
      'በናሙና ምርቶች ላይ አማካይ ነው። የጎደለ የግብር መለያ ወይም ፈቃድ ደረጃውን ይቀንሳል።',
      'Giddu-galeessa oomisha fakkeenyaa. TIN yookaan hayyamni yoo hin jirre sadarkaa hir\'isa.',
    ],
    seeMatches: ['See potential matches', 'ሊሆኑ የሚችሉ ተዛማጆችን ይመልከቱ', "Fakkaattuu ta'uu danda'an ilaalaa"],
    trustNote: [
      'SENED shows potential matches and preparation readiness. It never promises loan approval.',
      'SENED ሊሆን የሚችል ተዛማጅ እና የዝግጅት ደረጃ ያሳያል። ብድር እንደሚሰጥ አያረጋግጥም።',
      "SENED fakkaannaa ta'uu danda'uu fi sadarkaa qophii agarsiisa. Liqii kennamuu hin waada'u.",
    ],
    sampleList: [
      'These figures are a hackathon sample, not an official product list.',
      'እነዚህ አሃዞች የሃካቶን ናሙና ናቸው፣ ኦፊሴላዊ የምርት ዝርዝር አይደሉም።',
      'Lakkoofsota kunneen fakkeenya hakaatoonii ti, tarree oomishaa seeraa miti.',
    ],
    notADecision: [
      'A potential match is not a loan decision.',
      'ሊሆን የሚችል ተዛማጅ የብድር ውሳኔ አይደለም።',
      "Fakkaannaan ta'uu danda'u murtoo liqii miti.",
    ],
    matchTitle: ['Potential match', 'ሊሆን የሚችል ተዛማጅ', "Fakkaannaa ta'uu danda'u"],
    matchesTitle: ['Potential matches', 'ሊሆኑ የሚችሉ ተዛማጆች', "Fakkaattuu ta'uu danda'an"],
    stillNeeded: ['Still needed', 'ቀርቷል', 'Hafe'],
    inPassport: ['In the passport', 'በፓስፖርቱ ውስጥ', 'Paaspoortii keessa'],
    addToPassport: ['Add to passport', 'ወደ ፓስፖርት ያክሉ', 'Paaspoortitti galchaa'],
    bank: ['Bank', 'ባንክ', 'Baankii'],
    microfinance: ['Microfinance', 'ማይክሮፋይናንስ', 'Maayikiroofaayinaansii'],
    researchNote: [
      'Based on manual research. Confirm with the institution.',
      'ይህ በእጅ ጥናት ላይ የተመሠረተ ነው። ከተቋሙ ጋር ያረጋግጡ።',
      'Qorannoo harkaan kan hundeeffame. Dhaabbata waliin mirkaneessaa.',
    ],
    fitLine: [
      'Fit {score} · {percent}% preparation readiness',
      'ነጥብ {score} · {percent}% የዝግጅት ደረጃ',
      'Qabxii {score} · {percent}% sadarkaa qophii',
    ],
    missingNone: ['No missing sample requirements', 'የናሙና መስፈርት አልቀረም', 'Ulaagaan fakkeenyaa hin hafne'],
    missingOne: ['1 sample requirement still needed', '1 ናሙና መስፈርት ቀርቷል', 'Ulaagaan fakkeenyaa 1 hafe'],
    missingMany: ['{count} sample requirements still needed', '{count} ናሙና መስፈርቶች ቀርተዋል', 'Ulaagaaleen fakkeenyaa {count} hafan'],
    closer: ['Closer potential match', 'የቀረበ ሊሆን የሚችል ተዛማጅ', "Fakkaannaa dhiyoo ta'uu danda'u"],
    possible: ['Possible potential match', 'ሊሆን የሚችል ተዛማጅ', "Fakkaannaa ta'uu danda'u"],
    lower: ['Lower potential match', 'ዝቅተኛ ሊሆን የሚችል ተዛማጅ', "Fakkaannaa gadi aanaa ta'uu danda'u"],
  },
  profile: {
    title: ['Profile', 'መገለጫ', 'Profaayilii'],
    checking: ['Checking your account…', 'መለያዎን በመመልከት ላይ…', 'Akkaawuntii keessan ilaalaa jira…'],
    signedOutTitle: ['You are not signed in', 'አልገቡም', 'Hin seenne'],
    signedOutMessage: [
      'Sign in to generate documents and keep your account safe.',
      'ሰነድ ለማዘጋጀት እና መለያዎን ለመጠበቅ ይግቡ።',
      'Sanada qopheessuu fi akkaawuntii keessan eeguuf seenaa.',
    ],
    logIn: ['Log in', 'ይግቡ', 'Seenaa'],
    createAccount: ['Create account', 'መለያ ይፍጠሩ', 'Akkaawuntii uumaa'],
    logOut: ['Log out', 'ውጣ', 'Ba\'i'],
    logoutError: ['Could not log out. Please try again.', 'መውጣት አልተቻለም። እንደገና ይሞክሩ።', "Ba'uun hin dandeenye. Irra deebi'aa yaalaa."],
    language: ['Language', 'ቋንቋ', 'Afaan'],
    languageHint: [
      'New documents start in this language.',
      'አዲስ ሰነድ በዚህ ቋንቋ ይጀምራል።',
      'Sanadni haaraan afaan kanaan jalqaba.',
    ],
    welcome: ['View welcome screen', 'የመቀበያ ገጽ ይመልከቱ', 'Fuula simannaa ilaalaa'],
  },
  welcome: {
    subtitle: [
      'Prepare your business documents and financing applications in English, አማርኛ, or Afaan Oromoo.',
      'የንግድ ሰነዶችዎን እና የፋይናንስ ዝግጅት በእንግሊዝኛ፣ በአማርኛ ወይም በአፋን ኦሮሞ ያዘጋጁ።',
      'Sanada daldalaa fi qophii faayinaansii Afaan Ingiliffaa, Amaariffaa yookaan Afaan Oromootiin qopheessaa.',
    ],
    createAccount: ['Create account', 'መለያ ይፍጠሩ', 'Akkaawuntii uumaa'],
    logIn: ['Log in', 'ይግቡ', 'Seenaa'],
    skip: ['Skip for now', 'ለአሁን ይለፉ', 'Ammaaf darbaa'],
  },
  auth: {
    logIn: ['Log in', 'ይግቡ', 'Seenaa'],
    createAccount: ['Create account', 'መለያ ይፍጠሩ', 'Akkaawuntii uumaa'],
  },
} as const;

export const nextActionCopy: Record<
  PassportSectionId | 'ready' | 'signIn',
  { title: Phrase; message: Phrase; button: Phrase; href: Href }
> = {
  signIn: {
    title: ['Sign in to start your passport', 'ፓስፖርት ለመጀመር ይግቡ', 'Paaspoortii jalqabuuf seenaa'],
    message: [
      'Your Business Passport stays on this device, tied to your account.',
      'የንግድ ፓስፖርትዎ በዚህ መሣሪያ ከመለያዎ ጋር ይቆያል።',
      'Paaspoortiin daldalaa keessan meeshaa kana irratti akkaawuntii keessan waliin tura.',
    ],
    button: ['Log in', 'ይግቡ', 'Seenaa'],
    href: '/login',
  },
  identity: {
    title: ['Add your business basics', 'የንግድ መሠረት ያክሉ', "Bu'uura daldalaa galchaa"],
    message: [
      'Your business name, sector, and type are the first step toward potential financing matches.',
      'የንግድ ስም፣ ዘርፍ እና ዓይነት ወደ ሊሆኑ የሚችሉ ተዛማጆች የመጀመሪያ እርምጃ ናቸው።',
      "Maqaan, seektarrii fi gosti daldalaa tarkaanfii jalqabaa fakkaattuu ta'uu danda'aniif.",
    ],
    button: ['Add business basics', 'የንግድ መሠረት ያክሉ', "Bu'uura daldalaa galchaa"],
    href: '/business-basics',
  },
  location: {
    title: ['Add your location', 'አድራሻ ያክሉ', 'Bakka galchaa'],
    message: [
      'Region and city help compare your business with lender requirements.',
      'ክልል እና ከተማ ንግድዎን ከተቋም መስፈርት ጋር ለማወዳደር ይረዳሉ።',
      'Naannoo fi magaalaan daldala ulaagaa dhaabbataa waliin madaaluuf gargaaru.',
    ],
    button: ['Add location', 'አድራሻ ያክሉ', 'Bakka galchaa'],
    href: '/location',
  },
  legal: {
    title: ['Add your legal details', 'ሕጋዊ ዝርዝር ያክሉ', 'Bal\'ina seeraa galchaa'],
    message: [
      'TIN and trade license details are part of a complete passport.',
      'የግብር መለያ እና የንግድ ፈቃድ የተሟላ ፓስፖርት ክፍል ናቸው።',
      'TIN fi hayyamni daldalaa kutaa paaspoortii guutuu ti.',
    ],
    button: ['Add legal details', 'ሕጋዊ ዝርዝር ያክሉ', 'Bal\'ina seeraa galchaa'],
    href: '/legal',
  },
  operations: {
    title: ['Describe your operations', 'ሥራዎን ይግለጹ', 'Hojii keessan ibsaa'],
    message: [
      'What you sell, and how many people work with you, belongs in the passport.',
      'የሚሸጡት እና ከእርስዎ ጋር የሚሠሩ ሰዎች በፓስፖርቱ ውስጥ ይገባሉ።',
      'Waan gurgurtanii fi namoonni isin waliin hojjetan paaspoortii keessa galu.',
    ],
    button: ['Describe operations', 'ሥራ ይግለጹ', 'Hojii ibsaa'],
    href: '/operations',
  },
  financial: {
    title: ['Add your numbers', 'አሃዞችዎን ያክሉ', 'Lakkoofsota keessan galchaa'],
    message: [
      'Monthly revenue, expenses, and assets are figures you enter. SENED does not verify them.',
      'ወርሃዊ ገቢ፣ ወጪ እና ንብረት እርስዎ የሚያስገቡ አሃዞች ናቸው። SENED አያረጋግጣቸውም።',
      "Galii, baasii fi qabeenyi lakkoofsa isin galchitan. SENED hin mirkaneessu.",
    ],
    button: ['Add numbers', 'አሃዞች ያክሉ', 'Lakkoofsota galchaa'],
    href: '/financial',
  },
  financing: {
    title: ['Set your financing goal', 'የፋይናንስ ግብ ያስቀምጡ', 'Kaayyoo faayinaansii kaa\'aa'],
    message: [
      'Amount, purpose, term, and collateral prepare you to compare potential matches.',
      'መጠን፣ ዓላማ፣ ጊዜ እና መያዣ ሊሆኑ የሚችሉ ተዛማጆችን ለማወዳደር ያዘጋጃሉ።',
      "Hamma, kaayyoo, yeroo fi wabiin fakkaattuu ta'uu danda'an madaaluuf qopheessa.",
    ],
    button: ['Set financing goal', 'የፋይናንስ ግብ ያስቀምጡ', 'Kaayyoo faayinaansii kaa\'aa'],
    href: '/goal',
  },
  ready: {
    title: ['Your passport is ready to review', 'ፓስፖርትዎ ለግምገማ ዝግጁ ነው', "Paaspoortiin keessan gamaaggamuf qophaa'e"],
    message: [
      'Every section has an answer. You can still edit anything before you prepare a document.',
      'እያንዳንዱ ክፍል መልስ አለው። ሰነድ ከማዘጋጀት በፊት ማንኛውንም ማስተካከል ይችላሉ።',
      'Kutaa hundi deebii qaba. Sanada qopheessuun dura waan barbaaddan jijjiiruu dandeessu.',
    ],
    button: ['Review passport', 'ፓስፖርት ይገምግሙ', 'Paaspoortii gamaaggamaa'],
    href: '/overview',
  },
};

export function completenessPhrase(percentComplete: number): Phrase {
  if (percentComplete >= 100) return copy.status.ready;
  if (percentComplete <= 0) return copy.status.notStarted;
  return copy.status.inProgress;
}

export function strengthPhrase(strength: 'closer' | 'possible' | 'lower'): Phrase {
  return copy.financing[strength];
}
