import { Stack } from 'expo-router';

import { Screen } from '@/components/screen';
import { Badge, EmptyState } from '@/components/ui';

export type PlaceholderScreenProps = {
  title: string;
  task: string;
  description: string;
};

export function PlaceholderScreen({ title, task, description }: PlaceholderScreenProps) {
  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title }} />
      <Badge label={`Placeholder · ${task}`} variant="warning" />
      <EmptyState
        icon={{ ios: 'hammer.fill', android: 'construction', web: 'construction' }}
        title={title}
        message={description}
      />
    </Screen>
  );
}
