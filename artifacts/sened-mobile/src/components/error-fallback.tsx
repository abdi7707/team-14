import type { ErrorBoundaryProps } from 'expo-router';

import { Screen } from '@/components/screen';
import { EmptyState } from '@/components/ui';

export function ErrorFallback({ error, retry }: ErrorBoundaryProps) {
  return (
    <Screen edges={['top', 'bottom']} scroll={false}>
      <EmptyState
        icon={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
        title="Something went wrong"
        message={__DEV__ ? error.message : 'Please try again.'}
        actionLabel="Try again"
        onAction={retry}
      />
    </Screen>
  );
}
