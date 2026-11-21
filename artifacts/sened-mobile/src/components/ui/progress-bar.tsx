import { StyleSheet, View } from 'react-native';

import { Radius, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ProgressBarProps = {
  /** Percentage from 0 to 100. */
  value: number;
  color?: ThemeColor;
  height?: number;
  accessibilityLabel?: string;
};

export function ProgressBar({ value, color = 'primary', height = 8, accessibilityLabel }: ProgressBarProps) {
  const theme = useTheme();
  const percent = Number.isFinite(value) ? Math.round(Math.min(Math.max(value, 0), 100)) : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { height, backgroundColor: theme.surfaceMuted }]}>
      <View style={[styles.fill, { width: `${percent}%`, backgroundColor: theme[color] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
