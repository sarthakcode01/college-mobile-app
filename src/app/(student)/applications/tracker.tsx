import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { PipelineStepper, formatDateTime } from '@/components/pipeline-stepper';
import { Card, Logo, Screen, Section, Txt } from '@/components/ui-kit';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCompany, getDrive } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

export default function ApplicationTrackerScreen() {
  const { applications } = useStore();

  /** Renders the stepper for every application, grouped by outcome. */
  const groups = useMemo(() => {
    const withDrive = applications
      .map((app) => ({ app, drive: getDrive(app.driveId) }))
      .filter((x): x is { app: (typeof applications)[number]; drive: NonNullable<ReturnType<typeof getDrive>> } => Boolean(x.drive));

    return {
      offered: withDrive.filter((x) => x.app.status === 'offered'),
      active: withDrive.filter((x) => x.app.status === 'in_progress' || x.app.status === 'shortlisted'),
      rejected: withDrive.filter((x) => x.app.status === 'rejected'),
    };
  }, [applications]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            Application Tracker
          </Txt>
          <Txt size="sm" tone="secondary">
            Stage-by-stage progress for every drive
          </Txt>
        </View>

        {groups.offered.length > 0 ? (
          <Section title="🎉 Offers received">
            {groups.offered.map(({ app, drive }) => (
              <TrackerCard key={app.id} app={app} drive={drive} />
            ))}
          </Section>
        ) : null}

        {groups.active.length > 0 ? (
          <Section title="In progress">
            {groups.active.map(({ app, drive }) => (
              <TrackerCard key={app.id} app={app} drive={drive} />
            ))}
          </Section>
        ) : null}

        {groups.rejected.length > 0 ? (
          <Section title="Closed applications">
            {groups.rejected.map(({ app, drive }) => (
              <TrackerCard key={app.id} app={app} drive={drive} />
            ))}
          </Section>
        ) : null}

        {applications.length === 0 ? (
          <Card>
            <Txt size="sm" tone="secondary">
              You have not applied to any drives yet.
            </Txt>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function TrackerCard({
  app,
  drive,
}: {
  app: ReturnType<typeof useStore>['applications'][number];
  drive: NonNullable<ReturnType<typeof getDrive>>;
}) {
  const company = getCompany(drive.companyId);
  const nextStep = app.schedule.find((s) => s.date && !s.feedback);
  const t = useTheme();

  return (
    <Card accent={app.status === 'offered' ? t.success : app.status === 'rejected' ? t.danger : t.borderStrong}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
        <Logo text={company.logoText} size={40} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size="md" weight="700">
            {company.name}
          </Txt>
          <Txt size="xs" tone="secondary">
            {drive.jobRole} · {drive.ctcLpa} LPA
          </Txt>
        </View>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: t.border,
          paddingTop: Spacing.three,
          marginTop: Spacing.two,
        }}
      >
        <PipelineStepper application={app} />
      </View>

      {nextStep?.date && app.status !== 'rejected' && app.status !== 'offered' ? (
        <View
          style={{
            backgroundColor: t.brandSoft,
            padding: Spacing.three,
            borderRadius: 10,
            gap: 3,
          }}
        >
          <Txt size="xs" weight="700" tone="brand">
            NEXT ACTION REQUIRED
          </Txt>
          <Txt size="sm" weight="600">
            {nextStep.stage.replace('_', ' ')} · {formatDateTime(nextStep.date)}
          </Txt>
          {nextStep.venue ? (
            <Txt size="xs" tone="secondary">
              📍 {nextStep.venue}
              {nextStep.reportingTime ? ` · Report by ${nextStep.reportingTime}` : ''}
            </Txt>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}