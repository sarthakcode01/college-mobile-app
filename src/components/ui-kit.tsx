/**
 * Shared UI primitives for CampusHire.
 * Every component reads colours from the active theme, so light/dark mode
 * works everywhere without per-screen handling.
 */

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useColorScheme,
    type StyleProp,
    type TextInputProps,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Elevation, Fonts, Radius, Spacing, TypeScale, glassTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ---------------------------------------------------------------------------
// Glassmorphism
// ---------------------------------------------------------------------------

/**
 * Frosted-glass surface.
 *
 * Layers, back to front: a real `BlurView` for the frosted refraction, a
 * translucent tint on top of it, then a top-edge "sheen" gradient that
 * simulates light catching the top edge of glass. The bottom half of the
 * border is dropped so the panel reads as lit from above rather than outlined.
 */
export function Glass({
  children,
  style,
  strong = false,
  radius = Radius.lg,
  intensity,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  radius?: number;
  intensity?: number;
}) {
  const scheme = useColorScheme();
  const isDark = scheme !== 'light';
  const g = glassTokens(isDark);

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: g.border,
        },
        Elevation.medium,
        style,
      ]}
    >
      <BlurView
        intensity={intensity ?? g.blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? g.fillStrong : g.fill },
        ]}
      />
      {/* Top-edge sheen */}
      <LinearGradient
        colors={[g.sheen, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%', pointerEvents: 'none' }}
      />
      {children}
    </View>
  );
}

/**
 * Elevated card.
 *
 * Uses a soft drop shadow plus a hairline border. Set `glass` to swap the
 * opaque fill for a frosted panel — useful for headers and floating chrome.
 */
export function Card({
  children,
  style,
  onPress,
  accent,
  elevation = 'low',
  glass = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accent?: string;
  elevation?: keyof typeof Elevation;
  glass?: boolean;
}) {
  const t = useTheme();

  const padding = { padding: Spacing.three, gap: Spacing.two };

  if (glass) {
    const inner = (
      <View style={[padding, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null, style]}>
        {children}
      </View>
    );
    return (
      <Glass strong>
        {onPress ? (
          <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            {inner}
          </Pressable>
        ) : (
          inner
        )}
      </Glass>
    );
  }

  const body = (
    <View
      style={[
        {
          backgroundColor: t.backgroundElevated,
          borderColor: t.border,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderRadius: Radius.lg,
          overflow: 'hidden',
        },
        Elevation[elevation],
        padding,
        accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

type Tone = 'default' | 'secondary' | 'muted' | 'brand' | 'success' | 'warning' | 'danger' | 'onBrand';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'hero';
type Weight = '300' | '400' | '500' | '600' | '700' | '800';
type Family = 'sans' | 'display';

/** Maps a semantic weight onto the loaded Inter family. */
const SANS_FOR_WEIGHT: Record<Weight, string> = {
  '300': Fonts.sansLight,
  '400': Fonts.sans,
  '500': Fonts.sansMedium,
  '600': Fonts.sansSemiBold,
  '700': Fonts.sansBold,
  '800': Fonts.sansBold,
};

/** Playfair only ships 400/500/700 — heavier weights fall back to bold. */
const DISPLAY_FOR_WEIGHT: Record<Weight, string> = {
  '300': Fonts.displayRegular,
  '400': Fonts.displayRegular,
  '500': Fonts.displayMedium,
  '600': Fonts.displayMedium,
  '700': Fonts.display,
  '800': Fonts.display,
};

export function Txt({
  children,
  tone = 'default',
  size = 'md',
  weight = '400',
  family = 'sans',
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  tone?: Tone;
  size?: Size;
  weight?: Weight;
  family?: Family;
  style?: StyleProp<any>;
  numberOfLines?: number;
}) {
  const t = useTheme();
  const color = {
    default: t.text,
    secondary: t.textSecondary,
    muted: t.textMuted,
    brand: t.brand,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
    onBrand: t.brandText,
  }[tone];

  const scale = TypeScale[size];

  // The serif is only used at display sizes; smaller text stays on Inter.
  const resolvedFamily =
    family === 'display'
      ? DISPLAY_FOR_WEIGHT[weight]
      : SANS_FOR_WEIGHT[weight];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color,
          fontFamily: resolvedFamily,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
        },
        weight === '800' && family === 'sans' ? { fontWeight: '700' } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/**
 * Large editorial headline. Serif, tight tracking, optional uppercase eyebrow.
 */
export function Display({
  children,
  size = 'xxl',
  tone = 'default',
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  size?: 'xl' | 'xxl' | 'hero';
  tone?: Tone;
  style?: StyleProp<any>;
  numberOfLines?: number;
}) {
  return (
    <Txt
      family="display"
      weight="700"
      size={size}
      tone={tone}
      style={style}
      numberOfLines={numberOfLines}
    >
      {children}
    </Txt>
  );
}

/** Small uppercase label with wide tracking — the editorial "eyebrow". */
export function Eyebrow({ children, tone = 'muted', style }: { children: React.ReactNode; tone?: Tone; style?: StyleProp<any> }) {
  return (
    <Txt size="xs" weight="600" tone={tone} style={[{ textTransform: 'uppercase', letterSpacing: 1.6 }, style]}>
      {children}
    </Txt>
  );
}

// ---------------------------------------------------------------------------
// Screen scaffolding
// ---------------------------------------------------------------------------

export function Screen({
  children,
  scroll = false,
  edges = ['top'],
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: t.background }, style]}>
        <ScrollView
          contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: t.background }]}>
      {children}
    </SafeAreaView>
  );
}

export function Header({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={hs.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size="xl" weight="700">
          {title}
        </Txt>
        {subtitle ? (
          <Txt size="sm" tone="secondary">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

export type BadgeTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

export function Badge({
  label,
  tone = 'neutral',
  icon,
  style,
}: {
  label: string;
  tone?: BadgeTone;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const map = {
    brand: { bg: t.brandSoft, fg: t.brand },
    success: { bg: t.successSoft, fg: t.success },
    warning: { bg: t.warningSoft, fg: t.warning },
    danger: { bg: t.dangerSoft, fg: t.danger },
    neutral: { bg: t.backgroundElement, fg: t.textSecondary },
  }[tone];

  return (
    <View
      style={[
        {
          backgroundColor: map.bg,
          borderRadius: Radius.full,
          paddingHorizontal: 9,
          paddingVertical: 4,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ color: map.fg, fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 0.3 }}>
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'brand',
  disabled = false,
  loading = false,
  size = 'md',
  style,
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  tone?: 'brand' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  icon?: string;
}) {
  const t = useTheme();
  const base = tone === 'danger' ? t.danger : t.brand;

  const bg =
    variant === 'primary' ? base : variant === 'danger' ? t.dangerSoft : variant === 'secondary' ? t.backgroundElement : 'transparent';
  const fg =
    variant === 'primary' ? t.brandText : variant === 'danger' ? t.danger : base;

  const pad = size === 'lg' ? 15 : size === 'sm' ? 8 : 12;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: Radius.md,
          paddingVertical: pad,
          paddingHorizontal: Spacing.three,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: t.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text
          style={{
            color: fg,
            fontFamily: Fonts.sansSemiBold,
            fontSize: size === 'lg' ? 16 : 14,
            letterSpacing: -0.1,
          }}
        >
          {icon ? `${icon}  ` : ''}
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export function Input({
  label,
  error,
  hint,
  style,
  ...rest
}: TextInputProps & { label?: string; error?: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Txt size="sm" weight="600" tone="secondary">
          {label}
        </Txt>
      ) : null}
      <TextInput
        placeholderTextColor={t.textMuted}
        {...rest}
        style={[
          {
            backgroundColor: t.backgroundElement,
            borderColor: error ? t.danger : t.border,
            borderWidth: 1,
            borderRadius: Radius.md,
            paddingHorizontal: 13,
            paddingVertical: 11,
            color: t.text,
            fontSize: 15,
            fontFamily: Fonts.sans,
          },
          style,
        ]}
      />
      {error ? (
        <Txt size="xs" tone="danger">
          {error}
        </Txt>
      ) : hint ? (
        <Txt size="xs" tone="muted">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Filter chips
// ---------------------------------------------------------------------------

export function Chip({
  label,
  active,
  onPress,
  count,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? t.brand : t.backgroundElement,
        borderRadius: Radius.full,
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: active ? t.brand : t.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: active ? t.brandText : t.textSecondary,
          fontSize: 13,
          fontFamily: Fonts.sansMedium,
        }}
      >
        {label}
        {count !== undefined ? `  ${count}` : ''}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Company avatar
// ---------------------------------------------------------------------------

export function Logo({
  text,
  size = 44,
  color,
  inverted = false,
}: {
  text: string;
  size?: number;
  color?: string;
  /** Solid black tile with white lettering (used for the college mark). */
  inverted?: boolean;
}) {
  const t = useTheme();
  const bg = color ?? (inverted ? (t.background === '#FFFFFF' ? '#0A0A0A' : '#FAFAFA') : t.brand);
  const fg = inverted
    ? t.background === '#FFFFFF'
      ? '#FFFFFF'
      : '#0A0A0A'
    : t.brandText;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Radius.md,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: fg,
          fontFamily: Fonts.display,
          fontSize: size * 0.4,
          letterSpacing: 0.5,
        }}
      >
        {text.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

export function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'success' | 'warning' }) {
  const t = useTheme();
  const color = tone === 'success' ? t.success : tone === 'warning' ? t.warning : t.brand;
  return (
    <View style={{ height: 6, backgroundColor: t.backgroundElement, borderRadius: Radius.full, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function EmptyState({
  icon = '📭',
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: Spacing.two, paddingHorizontal: Spacing.three }}>
      <Text style={{ fontSize: 40 }}>{icon}</Text>
      <Txt size="lg" weight="700">
        {title}
      </Txt>
      {message ? (
        <Txt size="sm" tone="secondary" style={{ textAlign: 'center' }}>
          {message}
        </Txt>
      ) : null}
      {action}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={hs.row}>
        <Txt size="sm" weight="700" tone="secondary" style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {title}
        </Txt>
        <View style={{ flex: 1 }} />
        {action}
      </View>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// List row helper (pressable row with chevron)
// ---------------------------------------------------------------------------

export function RowLink({
  title,
  subtitle,
  onPress,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.three,
        backgroundColor: t.backgroundElevated,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: Radius.lg,
        padding: Spacing.three,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size="md" weight="600">
          {title}
        </Txt>
        {subtitle ? (
          <Txt size="sm" tone="secondary">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? <Txt tone="muted">{'›'}</Txt>}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

export function Toast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'danger' | 'brand' }) {
  const t = useTheme();
  const color = tone === 'danger' ? t.danger : tone === 'brand' ? t.brand : t.success;
  return (
    <View
      style={{
        backgroundColor: t.backgroundElevated,
        borderColor: color,
        borderWidth: 1,
        borderRadius: Radius.md,
        padding: Spacing.three,
      }}
    >
      <Txt size="sm" tone={tone === 'danger' ? 'danger' : tone === 'brand' ? 'brand' : 'success'} weight="600">
        {message}
      </Txt>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen navigation helper
// ---------------------------------------------------------------------------

export function useGoBack() {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace('/'));
}

const hs = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});