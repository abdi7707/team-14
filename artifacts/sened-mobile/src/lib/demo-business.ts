import AsyncStorage from '@react-native-async-storage/async-storage';

import { register as registerRequest } from '@/lib/api';
import { ApiError } from '@/lib/contracts';
import { emptyPassport, parseAmount } from '@/lib/passport';
import { activeBusinessKey, businessesKey } from '@/lib/storage-keys';
import type { BusinessPassport, BusinessRecord } from '@/types/passport';

/**
 * Stand-in for Filimon's demo persona until that data arrives.
 * The example in the task notes is a coffee business in Jimma.
 * Operations are left empty so the live demo can complete one section.
 */
export const DEMO_EMAIL = 'demo@sened.app';
export const DEMO_PASSWORD = 'sened-demo';
export const DEMO_NAME = 'Hana Bekele';

const BACKUP_EMAIL = 'backup@sened.app';
const BACKUP_NAME = 'Backup Demo';

export function demoPassport(): BusinessPassport {
  const passport = emptyPassport();
  passport.identity = {
    businessName: 'Jimma Highland Coffee',
    sector: 'Coffee',
    businessType: 'Private limited company',
    yearStarted: '2016',
  };
  passport.location = { region: 'Oromia', city: 'Jimma' };
  passport.legal = {
    tin: '0012345678',
    tradeLicenseNumber: 'OR-JIM-2048',
    licenseExpiry: '2027-06-30',
  };
  passport.financial = {
    monthlyRevenue: amount('180000', 'monthly'),
    monthlyExpenses: amount('120000', 'monthly'),
    assets: amount('950000', 'total'),
  };
  passport.financing = {
    amountNeeded: amount('500000', 'one-time'),
    purpose: 'Working capital for washed-coffee processing',
    preferredTerm: '12 months',
    collateral: 'Coffee inventory',
  };
  return passport;
}

export function backupPassport(): BusinessPassport {
  const passport = demoPassport();
  passport.operations = {
    productsServices: 'Washed Arabica coffee',
    employeeCount: '12',
  };
  return passport;
}

/** Creates the backup practice account once. A duplicate email is left as it is. */
export async function ensureBackupAccount(): Promise<void> {
  try {
    const session = await registerRequest({
      email: BACKUP_EMAIL,
      password: DEMO_PASSWORD,
      fullName: BACKUP_NAME,
    });
    const now = new Date().toISOString();
    const id = createId();
    const record: BusinessRecord = { id, createdAt: now, updatedAt: now, passport: backupPassport() };
    await AsyncStorage.multiSet([
      [businessesKey(session.user.id), JSON.stringify([record])],
      [activeBusinessKey(session.user.id), id],
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return;
    throw error;
  }
}

function amount(value: string, period: 'monthly' | 'one-time' | 'total') {
  const parsed = parseAmount(value, period);
  if (!parsed.amount) throw new Error('Demo amount is invalid.');
  return parsed.amount;
}

function createId(): string {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUUID) return randomUUID();
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
}
