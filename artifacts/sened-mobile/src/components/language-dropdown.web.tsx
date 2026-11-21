import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Language } from '@/lib/contracts';
import { LANGUAGE_CHOICES } from '@/types/document';

type LanguageDropdownProps = {
  label: string;
  value: Language;
  onChange: (language: Language) => void;
};

export function LanguageDropdown({ label, value, onChange }: LanguageDropdownProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as Language)}
        style={{
          width: '100%',
          minHeight: 48,
          borderRadius: Radius.md,
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.surface,
          color: theme.text,
          fontSize: 16,
          paddingLeft: Spacing.three,
          paddingRight: Spacing.three,
          fontFamily: 'system-ui, "Segoe UI", Ebrima, Nyala, sans-serif',
        }}>
        {LANGUAGE_CHOICES.map((choice) => (
          <option key={choice.id} value={choice.id}>
            {choice.label}
          </option>
        ))}
      </select>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
});
