import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, Glass, Logo, Screen, Txt } from '@/components/ui-kit';
import { COLLEGE, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DEMO_COORDINATOR, DEMO_STUDENT, DEMO_TPO } from '@/lib/demo-data';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

type RoleOption = {
  role: Role;
  title: string;
  subtitle: string;
  icon: string;
  name: string;
  email: string;
  designation: string;
};

const OPTIONS: RoleOption[] = [
  {
    role: 'student',
    title: 'Student',
    subtitle: 'Browse drives, check eligibility, track applications',
    icon: '🎓',
    name: DEMO_STUDENT.fullName,
    email: DEMO_STUDENT.email,
    designation: `B.Tech CSE · CGPA ${DEMO_STUDENT.cgpa}`,
  },
  {
    role: 'tpo',
    title: 'Placement Officer',
    subtitle: 'Create drives, filter applicants, publish results',
    icon: '🗂️',
    name: DEMO_TPO.fullName,
    email: DEMO_TPO.email,
    designation: DEMO_TPO.designation,
  },
  {
    role: 'coordinator',
    title: 'Student Coordinator',
    subtitle: 'Verify attendance, send urgent campus updates',
    icon: '📣',
    name: DEMO_COORDINATOR.fullName,
    email: DEMO_COORDINATOR.email,
    designation: DEMO_COORDINATOR.designation,
  },
];

export default function LoginScreen() {
  const router = useRouter();
  const t = useTheme();
  const { signIn } = useStore();

  function enter(option: RoleOption) {
    signIn(option.role);
    router.replace(option.role === 'student' ? '/(student)/home' : '/(admin)/dashboard');
  }

  return (
    <Screen scroll edges={['top', 'bottom']}>
      {/* Ambient light bloom behind the hero — gives the blur something to refract. */}
      <View style={{ position: 'absolute', top: -80, left: -60, width: 320, height: 320, borderRadius: 999, backgroundColor: t.backgroundElement, opacity: 0.7 }} pointerEvents="none" />

      <View style={{ gap: 6, marginBottom: Spacing.four }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <Logo text="DH" size={46} inverted />
          <View style={{ flex: 1 }}>
            <Txt size="sm" weight="700" numberOfLines={2} style={{ letterSpacing: 1.4 }}>
              {COLLEGE.shortName}
            </Txt>
            <Txt size="xs" tone="muted" style={{ letterSpacing: 0.6 }}>
              {COLLEGE.placementCell.toUpperCase()}
            </Txt>
          </View>
        </View>

        <View style={{ height: Spacing.five }} />

        <Txt size="hero" weight="700" family="display">
          CampusHire
        </Txt>
        <Txt size="sm" tone="secondary">
          {COLLEGE.name}
        </Txt>
        <Txt size="xs" tone="muted" style={{ letterSpacing: 0.4 }}>
          {COLLEGE.city.toUpperCase()}
        </Txt>
      </View>

      <Glass strong radius={Radius.lg} style={{ padding: Spacing.three }}>
        <View style={{ gap: 6 }}>
          <Txt size="sm" weight="700" tone="brand">
            Demo mode
          </Txt>
          <Txt size="xs" tone="secondary">
          Choose a role to explore. Each role opens a completely different portal — the
          student experience and the administration tools are separated by role.
        </Txt>
        </View>
      </Glass>

      <View style={{ height: Spacing.three }} />

      <View style={{ gap: Spacing.three }}>
        {OPTIONS.map((option) => (
          <Pressable
            key={option.role}
            onPress={() => enter(option)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Card style={{ gap: Spacing.two }} elevation="medium">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: Radius.md,
                  backgroundColor: t.backgroundElement,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt size="lg">{option.icon}</Txt>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt size="md" weight="700">
                  {option.title}
                </Txt>
                <Txt size="xs" tone="secondary">
                  {option.subtitle}
                </Txt>
              </View>
              <Txt tone="muted" size="lg">
                ›
              </Txt>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.two,
                borderTopWidth: 1,
                borderTopColor: t.border,
                paddingTop: Spacing.two,
              }}
            >
              <View style={{ flex: 1, gap: 1 }}>
                <Txt size="sm" weight="600">
                  {option.name}
                </Txt>
                <Txt size="xs" tone="muted">
                  {option.email}
                </Txt>
              </View>
              <Badge label={option.designation} tone="neutral" />
            </View>
            </Card>
          </Pressable>
        ))}
      </View>

      <View style={{ height: Spacing.four }} />

      <Button label="Continue as Student" onPress={() => enter(OPTIONS[0])} size="lg" />

      <Txt size="xs" tone="muted" style={{ textAlign: 'center', marginTop: Spacing.three }}>
        Database integration will be added later. All data is local for now.
      </Txt>
    </Screen>
  );
}