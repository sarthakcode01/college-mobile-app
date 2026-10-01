/**
 * CampusHire design tokens — monochrome editorial palette.
 *
 * The interface is greyscale throughout (near-black ink on paper white, true
 * black in dark mode). Colour is reserved strictly for *meaning*: eligibility
 * pass/fail, warnings and destructive actions. This keeps the eligibility
 * scorecard — the product's centrepiece — instantly scannable while the rest
 * of the UI reads as quiet, premium typography.
 */

import '@/global.css';

import { Platform, type ViewStyle } from 'react-native';

export const Colors = {
  light: {
    text: '#0A0A0A',
    textSecondary: '#6B6B6B',
    textMuted: '#9E9E9E',
    background: '#FFFFFF',
    backgroundElement: '#F5F5F4',
    backgroundSelected: '#EBEBEA',
    backgroundElevated: '#FFFFFF',
    border: '#E7E7E5',
    borderStrong: '#D4D4D2',
    brand: '#0A0A0A',
    brandSoft: '#F0F0EF',
    brandText: '#FFFFFF',
    // Semantic accents — functional only, never decorative.
    success: '#15803D',
    successSoft: '#F0FDF4',
    warning: '#B45309',
    warningSoft: '#FFFBEB',
    danger: '#B91C1C',
    dangerSoft: '#FEF2F2',
    overlay: 'rgba(10, 10, 10, 0.5)',
  },
  dark: {
    text: '#FAFAFA',
    textSecondary: '#A1A1A1',
    textMuted: '#6E6E6E',
    background: '#000000',
    backgroundElement: '#141414',
    backgroundSelected: '#242424',
    backgroundElevated: '#0D0D0D',
    border: '#242424',
    borderStrong: '#3A3A3A',
    brand: '#FAFAFA',
    brandSoft: '#1C1C1C',
    brandText: '#0A0A0A',
    success: '#4ADE80',
    successSoft: '#0A1F14',
    warning: '#FBBF24',
    warningSoft: '#1F1608',
    danger: '#F87171',
    dangerSoft: '#1F0C0C',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type ThemeColor = keyof (typeof Colors)['light'];

/**
 * Elevation scale.
 *
 * iOS renders three physical shadow layers; Android uses elevation alone.
 * Keeping them here means a card's depth is tuned in one place and stays
 * consistent across platforms. Values are deliberately restrained — heavy
 * shadows cheapen a monochrome palette.
 */
export const Elevation = {
  none: Platform.select({ ios: { shadowOpacity: 0 }, default: { elevation: 0 } }),
  low: Platform.select({
    ios: {
      shadowColor: '#0A0A0A',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    default: { elevation: 2 },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#0A0A0A',
      shadowOpacity: 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    default: { elevation: 6 },
  }),
  high: Platform.select({
    ios: {
      shadowColor: '#0A0A0A',
      shadowOpacity: 0.16,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 16 },
    },
    default: { elevation: 12 },
  }),
} satisfies Record<string, ViewStyle>;

/**
 * Glassmorphism tokens.
 *
 * True blur needs a `BlurView` behind a translucent surface, so these are the
 * fill/border values only. `Glass` in ui-kit.tsx composes them.
 * `intensity` is deliberately lower in light mode — a heavy blur on a white
 * background just looks grey.
 */
export const Glass = {
  light: {
    fill: 'rgba(255, 255, 255, 0.72)',
    fillStrong: 'rgba(255, 255, 255, 0.88)',
    border: 'rgba(255, 255, 255, 0.9)',
    sheen: 'rgba(255, 255, 255, 0.55)',
    blurIntensity: 24,
  },
  dark: {
    fill: 'rgba(28, 28, 28, 0.62)',
    fillStrong: 'rgba(20, 20, 20, 0.85)',
    border: 'rgba(255, 255, 255, 0.12)',
    sheen: 'rgba(255, 255, 255, 0.07)',
    blurIntensity: 40,
  },
} as const;

export function glassTokens(isDark: boolean) {
  return isDark ? Glass.dark : Glass.light;
}

/**
 * Typography — an editorial pairing.
 *
 * Playfair Display (high-contrast didone serif) carries display and headline
 * type, giving the app a luxury editorial character. Inter handles all UI and
 * body copy — its tall x-height stays legible at small sizes on phones.
 *
 * Font families are registered in `src/app/_layout.tsx` via `useFonts`.
 */
export const Fonts = {
  /** Display / headlines — Playfair Display. */
  display: 'PlayfairDisplay_700Bold',
  displayRegular: 'PlayfairDisplay_400Regular',
  displayMedium: 'PlayfairDisplay_500Medium',
  /** UI / body — Inter. */
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansLight: 'Inter_300Light',
} as const;

export type FontFamily = keyof typeof Fonts;

/**
 * Type scale. Display sizes pair the serif with negative tracking (the didone
 * needs it to feel tight); UI sizes use Inter with slightly positive tracking
 * at the smallest size for legibility.
 */
export const TypeScale = {
  xs: { fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
  sm: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  md: { fontSize: 15, lineHeight: 21, letterSpacing: -0.1 },
  lg: { fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  xl: { fontSize: 21, lineHeight: 27, letterSpacing: -0.5 },
  xxl: { fontSize: 28, lineHeight: 34, letterSpacing: -1 },
  hero: { fontSize: 36, lineHeight: 42, letterSpacing: -1.4 },
} as const;

export type TypeSize = keyof typeof TypeScale;

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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

/** Institutional branding used across headers and the login screen. */
export const COLLEGE = {
  name: 'Dr. Hari Singh Gour Central University',
  shortName: 'DHSGCU',
  placementCell: 'Training & Placement Cell',
  city: 'Sagar, Madhya Pradesh',
} as const;

/** CTC (in LPA) boundaries that define a drive's tier. */
export const TIER_THRESHOLDS = {
  superDream: 12,
  dream: 6,
} as const;

/**
 * Extra bottom padding screens need so content clears the floating glass tab
 * bar. The bar is `position: absolute`, so it overlays the scroll content.
 */
export const TabBarClearance = Platform.select({ ios: 84, android: 92, default: 92 }) ?? 92;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
