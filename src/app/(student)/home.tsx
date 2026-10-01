import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { formatDateTime } from '@/components/pipeline-stepper';
import { Badge, Button, Card, Logo, ProgressBar, Screen, Section, Txt } from '@/components/ui-kit';
import { COLLEGE, Radius, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
    DEMO_APPLICATIONS,
    DRIVES,
    getCompany,
    getDrive,
} from '@/lib/demo-data';
import { DEFAULT_POLICY, evaluateForDrive, isDriveOpen } from '@/lib/eligibility';
import { useStore } from '@/lib/store';

export default function StudentDashboard() {
  const router = useRouter();
  const t = useTheme();
  const { student, applications, announcements, signOut } = useStore();

  const eligibleCount = useMemo(
    () =>
      DRIVES.filter(
        (d) => isDriveOpen(d) && evaluateForDrive(student, d, DEFAULT_POLICY).isEligible,
      ).length,
    [student],
  );

  const urgent = announcements.filter((a) => a.priority === 'urgent' || a.priority === 'high');

  const activeApplications = applications.filter(
    (a) => a.status === 'in_progress' || a.status === 'shortlisted' || a.status === 'offered',
  );

  /** Next upcoming scheduled event across all active applications. */
  const nextEvent = useMemo(() => {
    const now = Date.now();
    const candidates: { app: (typeof DEMO_APPLICATIONS)[number]; date: string; stage: string }[] = [];
    for (const app of activeApplications) {
      for (const s of app.schedule) {
        if (!s.date) continue;
        const ts = new Date(s.date).getTime();
        if (ts > now) candidates.push({ app, date: s.date, stage: s.stage });
      }
    }
    candidates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return candidates[0];
  }, [activeApplications]);

  const recommended = useMemo(
    () =>
      DRIVES.filter(
        (d) =>
          isDriveOpen(d) &&
          !applications.some((a) => a.driveId === d.id) &&
          evaluateForDrive(student, d, DEFAULT_POLICY).isEligible,
      ).slice(0, 3),
    [student, applications],
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ gap: Spacing.one }}>
          <Txt size="sm" tone="secondary">
            {COLLEGE.placementCell}
          </Txt>
          <Txt size="xl" weight="700" family="display">
            Hello, {student.fullName.split(' ')[0]} 👋
          </Txt>
        </View>

        {/* Profile summary strip — frosted panel */}
        <Card accent={t.brand} glass>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
            <View style={{ flex: 1, gap: Spacing.one }}>
              <Txt size="md" weight="700">
                {student.rollNumber}
              </Txt>
              <Txt size="xs" tone="secondary">
                {student.branch}
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Txt size="lg" weight="800" tone="brand">
                {student.cgpa.toFixed(2)}
              </Txt>
              <Txt size="xs" tone="muted">
                CGPA
              </Txt>
            </View>
          </View>
        </Card>

        {/* Stat row */}
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          <StatTile
            value={String(eligibleCount)}
            label="Eligible drives"
            tone={t.success}
            onPress={() => router.push('/(student)/drives/index')}
          />
          <StatTile
            value={String(activeApplications.length)}
            label="Active applications"
            tone={t.brand}
            onPress={() => router.push('/applications')}
          />
          <StatTile
            value={String(announcements.length)}
            label="Notices"
            tone={t.warning}
            onPress={() => router.push('/(student)/prep/index')}
          />
        </View>

        {/* Next interview */}
        {nextEvent ? (
          <Section title="Next up">
            <Card accent={t.warning} onPress={() => router.push('/applications')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
                <Logo text={getCompany(getDrive(nextEvent.app.driveId)?.companyId ?? 'cmp-001').logoText} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt size="md" weight="700">
                    {getCompany(getDrive(nextEvent.app.driveId)?.companyId ?? 'cmp-001').name}
                  </Txt>
                  <Txt size="xs" tone="secondary">
                    {nextEvent.stage.replace('_', ' ')} · {formatDateTime(nextEvent.date)}
                  </Txt>
                </View>
              </View>
              {nextEvent.app.schedule.find((s) => s.stage === nextEvent.stage)?.venue ? (
                <View
                  style={{
                    backgroundColor: t.warningSoft,
                    padding: 10,
                    borderRadius: Radius.sm,
                    marginTop: Spacing.two,
                  }}
                >
                  <Txt size="xs" tone="secondary">
                    📍{' '}
                    {nextEvent.app.schedule.find((s) => s.stage === nextEvent.stage)?.venue}
                    {'  ·  Report by '}
                    {nextEvent.app.schedule.find((s) => s.stage === nextEvent.stage)?.reportingTime}
                  </Txt>
                </View>
              ) : null}
            </Card>
          </Section>
        ) : null}

        {/* Urgent notices */}
        {urgent.length > 0 ? (
          <Section title="Urgent notices">
            <View style={{ gap: Spacing.two }}>
              {urgent.slice(0, 2).map((a) => (
                <Card key={a.id} accent={a.priority === 'urgent' ? t.danger : t.warning}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                    <Badge
                      label={a.priority === 'urgent' ? 'URGENT' : 'IMPORTANT'}
                      tone={a.priority === 'urgent' ? 'danger' : 'warning'}
                    />
                    <View style={{ flex: 1 }} />
                    <Txt size="xs" tone="muted">
                      {a.postedBy}
                    </Txt>
                  </View>
                  <Txt size="md" weight="700">
                    {a.title}
                  </Txt>
                  <Txt size="xs" tone="secondary">
                    {a.message}
                  </Txt>
                </Card>
              ))}
            </View>
          </Section>
        ) : null}

        {/* Recommended drives */}
        <Section
          title="Recommended for you"
          action={
            <Button label="See all" variant="ghost" size="sm" onPress={() => router.push('/(student)/drives/index')} />
          }
        >
          {recommended.length === 0 ? (
            <Card>
              <Txt size="sm" tone="secondary">
                You have applied to every drive you are currently eligible for. Check back
                soon for new openings.
              </Txt>
            </Card>
          ) : (
            <View style={{ gap: Spacing.two }}>
              {recommended.map((drive) => {
                const company = getCompany(drive.companyId);
                return (
                  <Card key={drive.id} onPress={() => router.push({ pathname: '/(student)/drives/[id]', params: { id: drive.id } })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
                      <Logo text={company.logoText} size={38} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt size="md" weight="700">
                          {company.name}
                        </Txt>
                        <Txt size="xs" tone="secondary" numberOfLines={1}>
                          {drive.jobTitle}
                        </Txt>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Txt size="md" weight="800" tone="brand">
                          {drive.ctcLpa} LPA
                        </Txt>
                        <Badge label="Eligible" tone="success" icon="✓" />
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </Section>

        <Button label="Sign out" variant="ghost" onPress={signOut} />
      </ScrollView>
    </Screen>
  );
}

function StatTile({
  value,
  label,
  tone,
  onPress,
}: {
  value: string;
  label: string;
  tone: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Card onPress={onPress} elevation="medium" style={{ flex: 1, padding: Spacing.three, gap: 4 }}>
      <Txt size="xl" weight="700" family="display" style={{ color: tone }}>
        {value}
      </Txt>
      <Txt size="xs" tone="secondary">
        {label}
      </Txt>
      <View style={{ height: 4 }} />
      <ProgressBar value={100} tone="brand" />
    </Card>
  );
}