import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
  const [open, setOpen] = useState(false);
  const selected = LANGUAGE_CHOICES.find((choice) => choice.id === value);

  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={[styles.field, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <ThemedText>{selected?.label ?? value}</ThemedText>
        <ThemedText themeColor="textSecondary">{open ? '▴' : '▾'}</ThemedText>
      </Pressable>
      {open ? (
        <View style={[styles.menu, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          {LANGUAGE_CHOICES.map((choice) => {
            const active = choice.id === value;
            return (
              <Pressable
                key={choice.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(choice.id);
                  setOpen(false);
                }}
                style={[styles.option, { backgroundColor: active ? theme.primarySoft : theme.surface }]}>
                <ThemedText type="smallBold">{choice.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
    zIndex: 2,
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menu: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});
