import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  loading?: boolean;
  fullWidth?: boolean;
};

function getVariantColors(variant: ButtonVariant, theme: Theme) {
  switch (variant) {
    case 'primary':
      return { background: theme.primary, border: theme.primary, text: theme.textOnPrimary };
    case 'secondary':
      return { background: theme.primarySoft, border: theme.primarySoft, text: theme.primary };
    case 'outline':
      return { background: 'transparent', border: theme.border, text: theme.text };
    case 'ghost':
      return { background: 'transparent', border: 'transparent', text: theme.primary };
    case 'danger':
      return { background: theme.danger, border: theme.danger, text: theme.textOnPrimary };
  }
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const colors = getVariantColors(variant, theme);
  const isDisabled = Boolean(disabled) || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        { backgroundColor: colors.background, borderColor: colors.border },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <ThemedText type={size === 'sm' ? 'smallBold' : 'defaultSemiBold'} style={{ color: colors.text }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  medium: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
  },
  small: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
