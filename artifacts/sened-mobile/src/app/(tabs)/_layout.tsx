import { Tabs } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        // react-native-web lets the label shrink and clip descenders without this.
        tabBarLabelStyle: { flexShrink: 0 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name={{ ios: 'house.fill', android: 'home', web: 'home' }} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: 'Business',
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
          title: 'Documents',
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
          title: 'Financing',
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
          title: 'Profile',
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
