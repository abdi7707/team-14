import { Tabs } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Platform, type ColorValue } from 'react-native';

import { useI18n } from '@/context/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { copy } from '@/lib/i18n';

type TabIconProps = {
  name: SymbolViewProps['name'];
  color: ColorValue;
  size: number;
};

function TabIcon({ name, color, size }: TabIconProps) {
  return <SymbolView name={name} tintColor={color} size={size} />;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        // The label box is the exact width of the word, so the last letter is clipped.
        tabBarLabelStyle: {
          flexShrink: 0,
          fontSize: 11,
          fontWeight: '500',
          paddingRight: 2,
          overflow: 'visible',
          fontFamily:
            Platform.OS === 'web'
              ? 'system-ui, "Segoe UI", Ebrima, Nyala, sans-serif'
              : Platform.OS === 'android'
                ? 'sans-serif'
                : undefined,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t(copy.tabs.home),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name={{ ios: 'house.fill', android: 'home', web: 'home' }} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: t(copy.tabs.business),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t(copy.tabs.documents),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'doc.text.fill', android: 'description', web: 'description' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="financing"
        options={{
          title: t(copy.tabs.financing),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t(copy.tabs.profile),
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
