import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { EmptyState, ScreenHeader } from '@/components/ui';

export default function DocumentsScreen() {
  return (
    <Screen>
      <ScreenHeader title="Documents" subtitle="Professional drafts generated from your Business Passport." />
      <EmptyState
        icon={{ ios: 'doc.text.fill', android: 'description', web: 'description' }}
        title="No documents yet"
        message="Generate a loan request letter in English, Amharic, or Afaan Oromoo."
        actionLabel="Create a document"
        onAction={() => router.push('/select')}
      />
    </Screen>
  );
}
