export const Colors = {
  primary: '#0B6E4F',
  primaryPressed: '#08513A',
  primarySoft: '#E3F2EC',
  accent: '#C98A00',
  accentSoft: '#FDF3D6',
  background: '#F6F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1EE',
  border: '#D9DED9',
  text: '#111827',
  textSecondary: '#5B6470',
  textOnPrimary: '#FFFFFF',
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  info: '#1D4ED8',
  infoSoft: '#DBEAFE',
  neutral: '#4B5563',
  neutralSoft: '#F3F4F6',
} as const;

export type Theme = typeof Colors;
export type ThemeColor = keyof Theme;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const MaxContentWidth = 720;
