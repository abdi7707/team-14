import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState } from '@/components/ui';

type SignInPromptProps = {
  title: string;
  message: string;
};

export function SignInPrompt({ title, message }: SignInPromptProps) {
  return (
    <>
      <EmptyState
        icon={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
        title={title}
        message={message}
      />
      <Button title="Log in" onPress={() => router.push('/login')} />
      <Button title="Create account" variant="secondary" onPress={() => router.push('/register')} />
    </>
  );
}

export function LoadingNote({ message }: { message: string }) {
  return <ThemedText themeColor="textSecondary">{message}</ThemedText>;
}
