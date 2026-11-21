import { SAMPLE_REGISTRY } from '@/lib/institutions';
import { PASSPORT_SECTIONS } from '@/lib/passport';
import type {
  FitResult,
  FitStrength,
  InstitutionRegistry,
  PotentialMatch,
  Product,
  Requirement,
  RequirementField,
  RequirementReport,
} from '@/types/financing';
import type { BusinessPassport, PassportSectionId, StructuredAmount } from '@/types/passport';
import type { Href } from 'expo-router';

export function runMatchingEngine(
  passport: BusinessPassport,
  registry: InstitutionRegistry = SAMPLE_REGISTRY,
): PotentialMatch[] {
  return registry.products
    .map((product) => {
      const institution = registry.institutions.find((item) => item.id === product.institutionId);
      if (!institution) return null;
      const requirements = checkRequirements(passport, product.requirements);
      return {
        institution,
        product,
        fit: calculateFitScore(passport, product),
        readiness: calculateReadiness(requirements),
        requirements,
      };
    })
    .filter((match): match is PotentialMatch => match !== null)
    .sort((a, b) => b.fit.score - a.fit.score || b.readiness - a.readiness);
}

export function calculateFitScore(passport: BusinessPassport, product: Product): FitResult {
  const reasons: string[] = [];
  let score = 0;

  const sector = passport.identity.sector.trim();
  const sectorOk = keywordFits(sector, product.sectors);
  if (!sector) {
    score += 10;
    reasons.push('Sector is not in the passport yet.');
  } else if (sectorOk) {
    score += 30;
    reasons.push('Sector fits this sample product.');
  } else {
    reasons.push('Sector is outside this sample product.');
  }

  const amount = passport.financing.amountNeeded?.value ?? null;
  const amountState = amountFit(amount, product.minAmount, product.maxAmount);
  if (amountState === 'unknown') {
    score += 15;
    reasons.push('Amount needed is not in the passport yet.');
  } else if (amountState === 'inside') {
    score += 40;
    reasons.push('Amount needed sits inside the sample range.');
  } else {
    reasons.push('Amount needed is outside the sample range, so this stays a lower potential match.');
  }

  const age = businessAgeYears(passport.identity.yearStarted);
  if (age == null) {
    score += 8;
    reasons.push('Year started is not in the passport yet.');
  } else if (age >= product.minYears) {
    score += 20;
    reasons.push(
      product.minYears > 0
        ? `About ${age} years in business, which meets the sample minimum of ${product.minYears}.`
        : `About ${age} years in business.`,
    );
  } else {
    reasons.push(`About ${age} years in business, under the sample minimum of ${product.minYears}.`);
  }

  const regionState = keywordState(passport.location.region, product.regions);
  if (regionState === 'unknown') {
    score += 4;
    reasons.push('Region is not in the passport yet.');
  } else if (regionState === 'match') {
    score += 10;
    reasons.push(
      product.regions.length === 0
        ? 'This sample product is not limited to one region.'
        : 'Region fits this sample product.',
    );
  } else {
    reasons.push('Region is outside this sample product.');
  }

  if (amountState === 'outside') score = Math.min(score, 39);
  else if (amountState === 'unknown' || regionState === 'miss' || (sector.length > 0 && !sectorOk)) {
    score = Math.min(score, 69);
  }

  const strength: FitStrength = score < 40 ? 'lower' : score >= 70 && amountState === 'inside' ? 'closer' : 'possible';
  return { score, strength, reasons };
}

export function checkRequirements(
  passport: BusinessPassport,
  requirements: readonly Requirement[],
): RequirementReport {
  const checks = requirements.map((requirement) => ({
    ...requirement,
    met: requirementMet(passport, requirement.field),
  }));
  return {
    met: checks.filter((item) => item.met),
    missing: checks.filter((item) => !item.met),
  };
}

export function calculateReadiness(report: RequirementReport): number {
  const total = report.met.length + report.missing.length;
  if (total === 0) return 0;
  return Math.round((report.met.length / total) * 100);
}

export function averageReadiness(matches: readonly PotentialMatch[]): number {
  if (matches.length === 0) return 0;
  return Math.round(matches.reduce((sum, match) => sum + match.readiness, 0) / matches.length);
}

export function strengthLabel(strength: FitStrength): string {
  if (strength === 'closer') return 'Closer potential match';
  if (strength === 'possible') return 'Possible potential match';
  return 'Lower potential match';
}

export function formatEtb(value: number): string {
  return `${value.toLocaleString('en-US')} ETB`;
}

export function formatAmountRange(product: Product): string {
  return `${formatEtb(product.minAmount)} – ${formatEtb(product.maxAmount)}`;
}

export function sectionHref(section: PassportSectionId): Href {
  return PASSPORT_SECTIONS.find((item) => item.id === section)?.href ?? '/overview';
}

function requirementMet(passport: BusinessPassport, field: RequirementField): boolean {
  switch (field) {
    case 'businessName':
      return filled(passport.identity.businessName);
    case 'sector':
      return filled(passport.identity.sector);
    case 'region':
      return filled(passport.location.region);
    case 'tin':
      return filled(passport.legal.tin);
    case 'tradeLicense':
      return filled(passport.legal.tradeLicenseNumber);
    case 'revenue':
      return hasAmount(passport.financial.monthlyRevenue);
    case 'amount':
      return hasAmount(passport.financing.amountNeeded);
    case 'purpose':
      return filled(passport.financing.purpose);
    case 'collateral':
      return filled(passport.financing.collateral);
    case 'employees':
      return filled(passport.operations.employeeCount);
    default:
      return false;
  }
}

function filled(value: string): boolean {
  return value.trim().length > 0;
}

function hasAmount(amount: StructuredAmount | null): boolean {
  return amount != null && Number.isFinite(amount.value) && amount.value >= 0;
}

function businessAgeYears(yearStarted: string, now = new Date()): number | null {
  const year = Number(yearStarted);
  if (!Number.isInteger(year) || year < 1900 || year > now.getFullYear()) return null;
  return now.getFullYear() - year;
}

function keywordFits(value: string, keywords: readonly string[]): boolean {
  return keywordState(value, keywords) === 'match';
}

function keywordState(value: string, keywords: readonly string[]): 'match' | 'miss' | 'unknown' {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'unknown';
  if (keywords.length === 0) return 'match';
  const hit = keywords.some((keyword) => normalized.includes(keyword) || keyword.includes(normalized));
  return hit ? 'match' : 'miss';
}

function amountFit(value: number | null, min: number, max: number): 'inside' | 'outside' | 'unknown' {
  if (value == null || !Number.isFinite(value)) return 'unknown';
  if (value < min || value > max) return 'outside';
  return 'inside';
}
