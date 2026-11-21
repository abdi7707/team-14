import { router, Stack, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, Input } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import {
  amountToDraft,
  countError,
  dateError,
  emptyPassport,
  parseAmount,
  yearError,
} from '@/lib/passport';
import type {
  AmountPeriod,
  BusinessPassport,
  FinancingSection,
  FinancialSection,
  IdentitySection,
  LegalSection,
  LocationSection,
  OperationsSection,
  PassportSectionId,
} from '@/types/passport';

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  inputMode?: 'text' | 'numeric' | 'decimal';
};

const SECTION_COPY: Record<PassportSectionId, { title: string; intro: string; fields: Field[] }> = {
  identity: {
    title: 'Identity',
    intro: 'The name and type of this business.',
    fields: [
      { key: 'businessName', label: 'Business name' },
      { key: 'sector', label: 'Sector', placeholder: 'For example, retail or coffee' },
      { key: 'businessType', label: 'Business type', placeholder: 'For example, sole proprietor' },
      { key: 'yearStarted', label: 'Year started', placeholder: '2019', inputMode: 'numeric' },
    ],
  },
  location: {
    title: 'Location',
    intro: 'Where this business operates.',
    fields: [
      { key: 'region', label: 'Region', placeholder: 'For example, Addis Ababa' },
      { key: 'city', label: 'City or sub-city', placeholder: 'For example, Bole' },
    ],
  },
  legal: {
    title: 'Legal',
    intro: 'Registration details. A TIN is usually 10 digits.',
    fields: [
      { key: 'tin', label: 'TIN', hint: 'Usually 10 digits.', inputMode: 'numeric' },
      { key: 'tradeLicenseNumber', label: 'Trade license number' },
      { key: 'licenseExpiry', label: 'License expiry', placeholder: '2027-12-31', hint: 'YYYY-MM-DD' },
    ],
  },
  operations: {
    title: 'Operations',
    intro: 'What the business sells and the people who work in it.',
    fields: [
      {
        key: 'productsServices',
        label: 'Products or services',
        placeholder: 'For example, roasted coffee and beans',
        multiline: true,
      },
      { key: 'employeeCount', label: 'Number of employees', inputMode: 'numeric' },
    ],
  },
  financial: {
    title: 'Financial',
    intro: 'These figures are what you enter. SENED does not verify them.',
    fields: [
      { key: 'monthlyRevenue', label: 'Monthly revenue (ETB)', inputMode: 'decimal' },
      { key: 'monthlyExpenses', label: 'Monthly expenses (ETB)', inputMode: 'decimal' },
      { key: 'assets', label: 'Assets (ETB)', inputMode: 'decimal', hint: 'Equipment, stock, or other assets.' },
    ],
  },
  financing: {
    title: 'Financing goal',
    intro: 'What you want to prepare for. This is not a loan application, and it does not promise a match.',
    fields: [
      { key: 'amountNeeded', label: 'Amount needed (ETB)', inputMode: 'decimal' },
      { key: 'purpose', label: 'Purpose', placeholder: 'For example, buy stock', multiline: true },
      { key: 'preferredTerm', label: 'Preferred term', placeholder: 'For example, 12 months' },
      { key: 'collateral', label: 'Collateral', placeholder: 'For example, none' },
    ],
  },
};

const MONEY_PERIODS: Record<string, AmountPeriod> = {
  monthlyRevenue: 'monthly',
  monthlyExpenses: 'monthly',
  assets: 'total',
  amountNeeded: 'one-time',
};

type PassportSectionProps = {
  section: PassportSectionId;
  afterSave?: Href;
};

export function PassportSection({ section, afterSave }: PassportSectionProps) {
  const copy = SECTION_COPY[section];
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness, saveSections } = useBusiness();
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const loadedFor = useRef<string | null>(null);
  const loadKey = `${user?.id ?? ''}:${activeBusiness?.id ?? 'new'}:${section}`;

  useEffect(() => {
    if (authStatus === 'loading' || status !== 'ready') return;
    if (loadedFor.current === loadKey) return;
    loadedFor.current = loadKey;
    setDraft(draftFrom(section, activeBusiness?.passport ?? emptyPassport()));
    setErrors({});
    setFormError(null);
  }, [authStatus, status, loadKey, section, activeBusiness]);

  async function onSave() {
    if (!draft) return;
    const nextErrors = validate(section, draft);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await saveSections(patchFrom(section, draft));
      if (afterSave) router.push(afterSave);
      else if (router.canGoBack()) router.back();
      else router.dismissTo('/overview');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: copy.title }} />
      {authStatus === 'loading' || (user && (status === 'loading' || !draft)) ? (
        <LoadingNote message="Loading your passport…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to save your passport"
          message="Your Business Passport stays on this device, tied to your account."
        />
      ) : section !== 'identity' && !activeBusiness ? (
        <EmptyState
          icon={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }}
          title="Add your business basics first"
          message="A business name is the start of the passport. You can fill this section after that."
          actionLabel="Add business basics"
          onAction={() => router.replace('/business-basics')}
        />
      ) : draft ? (
        <>
          <ThemedText themeColor="textSecondary">{copy.intro}</ThemedText>
          {copy.fields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              value={draft[field.key] ?? ''}
              onChangeText={(text) =>
                setDraft((current) => (current ? { ...current, [field.key]: text } : current))
              }
              error={errors[field.key]}
              placeholder={field.placeholder}
              hint={field.hint}
              multiline={field.multiline}
              inputMode={field.inputMode ?? 'text'}
              autoCorrect={false}
              keyboardType={
                field.inputMode === 'decimal' ? 'decimal-pad' : field.inputMode === 'numeric' ? 'number-pad' : 'default'
              }
            />
          ))}
          {formError ? (
            <ThemedText type="small" themeColor="danger">
              {formError}
            </ThemedText>
          ) : null}
          <Button
            title={afterSave ? 'Save and continue' : 'Save'}
            loading={saving}
            onPress={() => void onSave()}
          />
        </>
      ) : null}
    </Screen>
  );
}

function draftFrom(section: PassportSectionId, passport: BusinessPassport): Record<string, string> {
  switch (section) {
    case 'identity':
      return { ...passport.identity };
    case 'location':
      return { ...passport.location };
    case 'legal':
      return { ...passport.legal };
    case 'operations':
      return { ...passport.operations };
    case 'financial':
      return {
        monthlyRevenue: amountToDraft(passport.financial.monthlyRevenue),
        monthlyExpenses: amountToDraft(passport.financial.monthlyExpenses),
        assets: amountToDraft(passport.financial.assets),
      };
    case 'financing':
      return {
        amountNeeded: amountToDraft(passport.financing.amountNeeded),
        purpose: passport.financing.purpose,
        preferredTerm: passport.financing.preferredTerm,
        collateral: passport.financing.collateral,
      };
  }
}

function validate(section: PassportSectionId, draft: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (section === 'identity' && !(draft.businessName ?? '').trim()) {
    errors.businessName = 'Enter the business name.';
  }
  if (section === 'identity') {
    const year = yearError(draft.yearStarted ?? '');
    if (year) errors.yearStarted = year;
  }
  if (section === 'operations') {
    const count = countError(draft.employeeCount ?? '');
    if (count) errors.employeeCount = count;
  }
  if (section === 'legal') {
    const expiry = dateError(draft.licenseExpiry ?? '');
    if (expiry) errors.licenseExpiry = expiry;
  }
  if (section === 'financial') {
    for (const key of ['monthlyRevenue', 'monthlyExpenses', 'assets'] as const) {
      const message = parseAmount(draft[key] ?? '', MONEY_PERIODS[key]).error;
      if (message) errors[key] = message;
    }
  }
  if (section === 'financing') {
    const message = parseAmount(draft.amountNeeded ?? '', 'one-time').error;
    if (message) errors.amountNeeded = message;
  }
  return errors;
}

function patchFrom(section: PassportSectionId, draft: Record<string, string>): Partial<BusinessPassport> {
  switch (section) {
    case 'identity':
      return { identity: trimmed<IdentitySection>(draft, ['businessName', 'sector', 'businessType', 'yearStarted']) };
    case 'location':
      return { location: trimmed<LocationSection>(draft, ['region', 'city']) };
    case 'legal':
      return { legal: trimmed<LegalSection>(draft, ['tin', 'tradeLicenseNumber', 'licenseExpiry']) };
    case 'operations':
      return { operations: trimmed<OperationsSection>(draft, ['productsServices', 'employeeCount']) };
    case 'financial':
      return {
        financial: {
          monthlyRevenue: parseAmount(draft.monthlyRevenue ?? '', 'monthly').amount,
          monthlyExpenses: parseAmount(draft.monthlyExpenses ?? '', 'monthly').amount,
          assets: parseAmount(draft.assets ?? '', 'total').amount,
        } satisfies FinancialSection,
      };
    case 'financing':
      return {
        financing: {
          amountNeeded: parseAmount(draft.amountNeeded ?? '', 'one-time').amount,
          purpose: (draft.purpose ?? '').trim(),
          preferredTerm: (draft.preferredTerm ?? '').trim(),
          collateral: (draft.collateral ?? '').trim(),
        } satisfies FinancingSection,
      };
  }
}

function trimmed<T>(draft: Record<string, string>, keys: (keyof T)[]): T {
  const value = {} as T;
  for (const key of keys) value[key] = (draft[String(key)] ?? '').trim() as T[keyof T];
  return value;
}
