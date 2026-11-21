import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { emptyPassport, yearError } from '@/lib/passport';

export default function BusinessBasicsScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness, saveSections } = useBusiness();
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [yearStarted, setYearStarted] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [yearFieldError, setYearFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const loadedFor = useRef<string | null>(null);
  const loadKey = `${user?.id ?? ''}:${activeBusiness?.id ?? 'new'}`;

  useEffect(() => {
    if (authStatus === 'loading' || status !== 'ready') return;
    if (loadedFor.current === loadKey) return;
    loadedFor.current = loadKey;
    const passport = activeBusiness?.passport ?? emptyPassport();
    setName(passport.identity.businessName);
    setSector(passport.identity.sector);
    setBusinessType(passport.identity.businessType);
    setYearStarted(passport.identity.yearStarted);
    setRegion(passport.location.region);
    setCity(passport.location.city);
  }, [authStatus, status, loadKey, activeBusiness]);

  async function onSave() {
    const nextNameError = name.trim() ? null : 'Enter the business name.';
    const nextYearError = yearError(yearStarted);
    setNameError(nextNameError);
    setYearFieldError(nextYearError);
    setFormError(null);
    if (nextNameError || nextYearError) return;

    setSaving(true);
    try {
      await saveSections({
        identity: {
          businessName: name.trim(),
          sector: sector.trim(),
          businessType: businessType.trim(),
          yearStarted: yearStarted.trim(),
        },
        location: { region: region.trim(), city: city.trim() },
      });
      router.push('/goal');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const loading = authStatus === 'loading' || (user !== null && status === 'loading');

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Business basics' }} />
      {loading ? (
        <LoadingNote message="Loading your passport…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to save your passport"
          message="Your Business Passport stays on this device, tied to your account."
        />
      ) : (
        <>
          <ThemedText themeColor="textSecondary">
            Name, sector, and location are the start of your Business Passport.
          </ThemedText>
          <Input label="Business name" value={name} onChangeText={setName} error={nameError ?? undefined} />
          <Input
            label="Sector"
            value={sector}
            onChangeText={setSector}
            placeholder="For example, retail or coffee"
            autoCorrect={false}
          />
          <Input
            label="Business type"
            value={businessType}
            onChangeText={setBusinessType}
            placeholder="For example, sole proprietor"
            autoCorrect={false}
          />
          <Input
            label="Year started"
            value={yearStarted}
            onChangeText={setYearStarted}
            error={yearFieldError ?? undefined}
            placeholder="2019"
            inputMode="numeric"
            keyboardType="number-pad"
          />
          <Input
            label="Region"
            value={region}
            onChangeText={setRegion}
            placeholder="For example, Addis Ababa"
            autoCorrect={false}
          />
          <Input
            label="City or sub-city"
            value={city}
            onChangeText={setCity}
            placeholder="For example, Bole"
            autoCorrect={false}
          />
          {formError ? (
            <ThemedText type="small" themeColor="danger">
              {formError}
            </ThemedText>
          ) : null}
          <Button title="Save and continue" loading={saving} onPress={() => void onSave()} />
        </>
      )}
    </Screen>
  );
}
