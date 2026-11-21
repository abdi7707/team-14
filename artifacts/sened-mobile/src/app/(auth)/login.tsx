import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/contracts';
import { isMockApi } from '@/lib/api';
import { emailError, passwordError } from '@/lib/validation';

export default function LoginScreen() {
  const { status, user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'signedIn' && user) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Log in' }} />
        <ThemedText type="defaultSemiBold">You are signed in as {user.email}.</ThemedText>
        <Button title="Continue" onPress={() => router.dismissTo('/')} />
      </Screen>
    );
  }

  async function onSubmit() {
    const nextEmailError = emailError(email);
    const nextPasswordError = passwordError(password);
    setEmailFieldError(nextEmailError);
    setPasswordFieldError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    try {
      await login({ email, password });
      router.dismissTo('/');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Log in' }} />
      <ThemedText themeColor="textSecondary">Use the email and password for your SENED account.</ThemedText>
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
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
      />
      {formError ? (
        <ThemedText type="small" themeColor="danger">
          {formError}
        </ThemedText>
      ) : null}
      <Button title="Log in" loading={submitting} onPress={() => void onSubmit()} />
      <Button title="Create an account" variant="ghost" onPress={() => router.replace('/register')} />
      {isMockApi() ? (
        <ThemedText type="caption" themeColor="textSecondary">
          Practice mode: this account stays on this device until the SENED API is connected.
        </ThemedText>
      ) : null}
    </Screen>
  );
}
