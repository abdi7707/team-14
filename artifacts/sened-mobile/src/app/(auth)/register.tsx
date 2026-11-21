import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { isMockApi } from '@/lib/api';
import { ApiError } from '@/lib/contracts';
import { emailError, fullNameError, passwordError } from '@/lib/validation';

export default function RegisterScreen() {
  const { status, user, register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'signedIn' && user) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Create account' }} />
        <ThemedText type="defaultSemiBold">You are signed in as {user.email}.</ThemedText>
        <Button title="Continue" onPress={() => router.dismissTo('/')} />
      </Screen>
    );
  }

  async function onSubmit() {
    const nextNameError = fullNameError(fullName);
    const nextEmailError = emailError(email);
    const nextPasswordError = passwordError(password);
    setNameError(nextNameError);
    setEmailFieldError(nextEmailError);
    setPasswordFieldError(nextPasswordError);
    setFormError(null);
    if (nextNameError || nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    try {
      await register({ fullName, email, password });
      router.dismissTo('/');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Create account' }} />
      <ThemedText themeColor="textSecondary">
        Create an account to generate documents and keep them with you.
      </ThemedText>
      <Input
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        error={nameError ?? undefined}
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="name"
        textContentType="name"
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={emailFieldError ?? undefined}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        inputMode="email"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={passwordFieldError ?? undefined}
        hint="At least 8 characters."
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
      />
      {formError ? (
        <ThemedText type="small" themeColor="danger">
          {formError}
        </ThemedText>
      ) : null}
      <Button title="Create account" loading={submitting} onPress={() => void onSubmit()} />
      <Button title="I already have an account" variant="ghost" onPress={() => router.replace('/login')} />
      {isMockApi() ? (
        <ThemedText type="caption" themeColor="textSecondary">
          Practice mode: this account stays on this device until the SENED API is connected.
        </ThemedText>
      ) : null}
    </Screen>
  );
}
