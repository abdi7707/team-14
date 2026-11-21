import { DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ErrorFallback } from '@/components/error-fallback';
import { AuthProvider } from '@/context/auth-context';
import { BusinessProvider } from '@/context/business-context';
import { DocumentProvider } from '@/context/document-context';
import { I18nProvider } from '@/context/i18n-context';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
  },
};

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorFallback {...props} />;
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BusinessProvider>
          <DocumentProvider>
            <ThemeProvider value={navigationTheme}>
              <Stack
                screenOptions={{
                  headerTintColor: Colors.primary,
                  headerTitleStyle: { color: Colors.text },
                  headerShadowVisible: false,
                  headerBackButtonDisplayMode: 'minimal',
                  contentStyle: { backgroundColor: Colors.background },
                }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'SENED AI' }} />
              </Stack>
              <StatusBar style="dark" />
            </ThemeProvider>
          </DocumentProvider>
        </BusinessProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
