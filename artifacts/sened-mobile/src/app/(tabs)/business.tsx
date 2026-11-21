import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { Button, EmptyState, ScreenHeader } from '@/components/ui';

export default function BusinessScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Business"
        subtitle="Your Business Passport is the single source of truth for every document and lender."
      />
      <EmptyState
        icon={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }}
        title="No business yet"
        message="Create your business to start filling in your Business Passport."
        actionLabel="Create your business"
        onAction={() => router.push('/business-basics')}
      />
      <Button title="Open passport overview" variant="outline" onPress={() => router.push('/overview')} />
    </Screen>
  );
}
