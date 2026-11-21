import type { DocType } from "./documents";
import type { Language } from "./language";

/** Written wherever the Business Passport does not supply a fact. */
export const MISSING_VALUE = "[to be confirmed]";

/** Body of the section that ends every document, in all three languages. */
export const DRAFT_DISCLAIMER = [
  "This is a draft for preparation. It is not an official document, and it does not promise loan approval.",
  "ይህ ሰነድ ረቂቅ ብቻ ነው። ኦፊሴላዊ ሰነድ አይደለም። ብድር እንደሚሰጥ አያረጋግጥም።",
  "Kun waraqaa qophaa'aa dha. Sanada seeraa miti. Liqii kennamuu hin waada'u.",
].join("\n\n");

export const DISCLAIMER_HEADINGS: Record<Language, string> = {
  EN: "Disclaimer",
  AM: "ማስታወሻ",
  OM: "Hubachiisa",
};

export const DOCUMENT_TITLES: Record<DocType, Record<Language, string>> = {
  LOAN_REQUEST_LETTER: {
    EN: "Loan Request Letter",
    AM: "የብድር ጥያቄ ደብዳቤ",
    OM: "Waraqaa Gaaffii Liqii",
  },
};
