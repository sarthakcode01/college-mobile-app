import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, View } from 'react-native';

import { EligibilityScorecard } from '@/components/eligibility-scorecard';
import { formatDate, formatDateTime } from '@/components/pipeline-stepper';
import {
    Badge,
    Button,
    Card,
    Logo,
    RowLink,
    Screen,
    Section,
    Toast,
    Txt,
} from '@/components/ui-kit';
import { COLLEGE, Radius, Spacing , TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApplicationForDrive, getCompany, getDrive } from '@/lib/demo-data';
import {
    DEFAULT_POLICY,
    evaluateForDrive,
    formatCountdown,
    formatRelativeDeadline,
    getDriveTier,
    isDriveOpen,
    TIER_LABELS,
    timeUntilDeadline,
} from '@/lib/eligibility';
import { scheduleDeadlineReminder } from '@/lib/notifications';
import { useStore } from '@/lib/store';

export default function DriveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();
  const { student, applyToDrive, withdrawFromDrive } = useStore();

  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' | 'brand' } | null>(null);

  const drive = getDrive(id);

  useEffect(() => {
    if (drive && student && isDriveOpen(drive)) {
      scheduleDeadlineReminder(drive.id, drive.companyId, drive.registrationDeadline);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!drive) {
    return (
      <Screen>
        <View style={{ padding: Spacing.four }}>
          <Txt>Drive not found.</Txt>
        </View>
      </Screen>
    );
  }

  const company = getCompany(drive.companyId);
  const verdict = evaluateForDrive(student, drive, DEFAULT_POLICY);
  const existingApp = getApplicationForDrive(drive.id);
  const applied = existingApp && existingApp.status !== 'rejected';
  const open = isDriveOpen(drive);
  const msLeft = timeUntilDeadline(drive);
  const urgentDeadline = msLeft > 0 && msLeft < 3 * 86400000;

  function handleApply() {
    const result = applyToDrive(drive!.id);
    setToast({ message: result.message, tone: result.ok ? 'success' : 'danger' });
    if (result.ok) {
      setTimeout(() => setToast(null), 3000);
    }
  }

  function handleWithdraw() {
    if (Platform.OS === 'web') {
      withdrawFromDrive(drive!.id);
      setToast({ message: 'Application withdrawn.', tone: 'brand' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    Alert.alert('Withdraw application?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: () => {
          withdrawFromDrive(drive!.id);
          setToast({ message: 'Application withdrawn.', tone: 'brand' });
          setTimeout(() => setToast(null), 3000);
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        {/* Company header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <Logo text={company.logoText} size={54} />
          <View style={{ flex: 1, gap: 3 }}>
            <Txt size="lg" weight="800">
              {company.name}
            </Txt>
            <Txt size="sm" tone="secondary">
              {drive.jobTitle}
            </Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Badge
            label={TIER_LABELS[getDriveTier(drive.ctcLpa)]}
            tone={getDriveTier(drive.ctcLpa) === 'super_dream' ? 'brand' : getDriveTier(drive.ctcLpa) === 'dream' ? 'warning' : 'neutral'}
          />
          <Badge label={drive.jobType === 'internship' ? 'Internship' : 'Full time'} tone="neutral" />
          <Badge label={drive.workMode} tone="neutral" />
          {!open ? <Badge label={drive.status === 'closed' ? 'Registration Closed' : 'Upcoming'} tone="neutral" /> : null}
        </View>

        {/* Deadline banner */}
        <Card
          accent={open ? (urgentDeadline ? t.danger : t.warning) : t.border}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size="xs" tone="secondary" weight="600">
                REGISTRATION DEADLINE
              </Txt>
              <Txt size="md" weight="700">
                {formatDateTime(drive.registrationDeadline)}
              </Txt>
              <Txt size="xs" tone="muted">
                {formatRelativeDeadline(drive)}
              </Txt>
            </View>
            <View
              style={{
                backgroundColor: urgentDeadline ? t.dangerSoft : t.warningSoft,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: Radius.md,
              }}
            >
              <Txt size="md" weight="800" tone={urgentDeadline ? 'danger' : 'warning'}>
                {formatCountdown(msLeft)}
              </Txt>
            </View>
          </View>
        </Card>

        {/* Compensation */}
        <Section title="Compensation">
          <Card>
            <View style={{ flexDirection: 'row', gap: Spacing.four }}>
              <CompItem label="Annual CTC" value={`${drive.ctcLpa} LPA`} tone="brand" />
              {drive.stipendPerMonth ? (
                <CompItem label="Monthly Stipend" value={`₹${(drive.stipendPerMonth / 1000).toFixed(0)}k`} tone="success" />
              ) : (
                <CompItem label="Job type" value={drive.jobType === 'internship' ? 'Internship' : 'Full time'} />
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderTopColor: t.border,
                paddingTop: Spacing.two,
              }}
            >
              <Txt size="xs" tone="secondary">
                Location
              </Txt>
              <Txt size="xs" weight="600">
                {drive.location}
              </Txt>
            </View>
          </Card>
        </Section>

        {/* ELIGIBILITY ENGINE OUTPUT */}
        <Section title="Automated eligibility check">
          <EligibilityScorecard result={verdict} />
        </Section>

        {/* Apply CTA */}
        <Card>
          {applied ? (
            <View style={{ gap: Spacing.two }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                <Badge label="Applied" tone="success" icon="✓" />
                <Txt size="xs" tone="secondary">
                  {formatDate(existingApp!.appliedAt)}
                </Txt>
              </View>
              <Button
                label="View application tracker"
                onPress={() => router.push('/(student)/applications/tracker')}
                size="lg"
              />
              <Button label="Withdraw application" variant="ghost" onPress={handleWithdraw} />
            </View>
          ) : (
            <View style={{ gap: Spacing.two }}>
              {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
              <Button
                label={verdict.isEligible ? 'Apply now' : 'You are not eligible'}
                onPress={handleApply}
                disabled={!verdict.isEligible || !open}
                size="lg"
              />
              {!verdict.isEligible ? (
                <Txt size="xs" tone="danger" style={{ textAlign: 'center' }}>
                  Failed: {verdict.failures.join(' · ')}
                </Txt>
              ) : !open ? (
                <Txt size="xs" tone="muted" style={{ textAlign: 'center' }}>
                  Registration for this drive is closed.
                </Txt>
              ) : (
                <Txt size="xs" tone="muted" style={{ textAlign: 'center' }}>
                  One tap applies you. The placement cell will verify your profile.
                </Txt>
              )}
            </View>
          )}
        </Card>

        {/* Selection process */}
        <Section title="Selection process">
          <Card>
            {drive.rounds.map((round, index) => (
              <View
                key={round.name}
                style={{
                  flexDirection: 'row',
                  gap: Spacing.three,
                  paddingVertical: Spacing.two,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: t.border,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: Radius.full,
                    backgroundColor: t.brandSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Txt size="xs" weight="800" tone="brand">
                    {index + 1}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size="sm" weight="700">
                    {round.name}
                  </Txt>
                  <Txt size="xs" tone="secondary">
                    {round.description}
                  </Txt>
                </View>
              </View>
            ))}
          </Card>
        </Section>

        {/* Job description */}
        <Section title="About the role">
          <Card>
            <Txt size="sm" tone="secondary">
              {drive.jdSummary}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: Spacing.two }}>
              {drive.keySkills.map((skill) => (
                <Badge key={skill} label={skill} tone="neutral" />
              ))}
            </View>
          </Card>
        </Section>

        {/* About company */}
        <Section title={`About ${company.name}`}>
          <Card>
            <Txt size="sm" tone="secondary">
              {company.about}
            </Txt>
            <View style={{ marginTop: Spacing.two }}>
              <RowLink
                title="Visit company careers page"
                subtitle={company.website}
                onPress={() => Linking.openURL(company.website)}
                left={<Logo text={company.logoText} size={34} />}
              />
            </View>
          </Card>
        </Section>

        <Txt size="xs" tone="muted" style={{ textAlign: 'center' }}>
          {COLLEGE.placementCell} · {COLLEGE.shortName}
        </Txt>
      </ScrollView>
    </Screen>
  );
}

function CompItem({ label, value, tone }: { label: string; value: string; tone?: 'brand' | 'success' }) {
  return (
    <View style={{ gap: 2 }}>
      <Txt size="xs" tone="muted">
        {label}
      </Txt>
      <Txt size="lg" weight="800" tone={tone ?? 'default'}>
        {value}
      </Txt>
    </View>
  );
}