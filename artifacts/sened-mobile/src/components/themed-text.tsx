import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'title'
    | 'subtitle'
    | 'default'
    | 'defaultSemiBold'
    | 'small'
    | 'smallBold'
    | 'caption'
    | 'link';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? (type === 'link' ? 'primary' : 'text')];
  const fontFamily =
    Platform.OS === 'web'
      ? 'system-ui, "Segoe UI", Ebrima, Nyala, sans-serif'
      : Platform.OS === 'android'
        ? 'sans-serif'
        : undefined;

  return <Text style={[{ color, fontFamily }, styles.keepLastLetter, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  // The measured width stops at the last glyph and the final letter is clipped.
  keepLastLetter: {
    paddingRight: 2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  small: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
});
