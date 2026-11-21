import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const variantTokens: Record<BadgeVariant, { background: ThemeColor; text: ThemeColor }> = {
  success: { background: 'successSoft', text: 'success' },
  warning: { background: 'warningSoft', text: 'warning' },
  danger: { background: 'dangerSoft', text: 'danger' },
  info: { background: 'infoSoft', text: 'info' },
  neutral: { background: 'neutralSoft', text: 'neutral' },
  primary: { background: 'primarySoft', text: 'primary' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const theme = useTheme();
  const tokens = variantTokens[variant];

  return (
    <View style={[styles.badge, { backgroundColor: theme[tokens.background] }]}>
      <ThemedText type="caption" style={{ color: theme[tokens.text] }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
});
