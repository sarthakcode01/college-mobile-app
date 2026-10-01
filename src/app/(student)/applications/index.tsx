import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { formatDate, STAGE_DISPLAY } from '@/components/pipeline-stepper';
import { Badge, Card, Chip, EmptyState, Logo, Screen, Txt } from '@/components/ui-kit';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCompany, getDrive } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

type Tab = 'active' | 'history';

export default function ApplicationsScreen() {
  const router = useRouter();
  const t = useTheme();
  const { applications } = useStore();
  const [tab, setTab] = useState<Tab>('active');

  const { active, history } = useMemo(() => {
    const sorted = [...applications].sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
    return {
      active: sorted.filter(
        (a) => a.status === 'in_progress' || a.status === 'shortlisted' || a.status === 'offered',
      ),
      history: sorted.filter((a) => a.status === 'rejected'),
    };
  }, [applications]);

  const list = tab === 'active' ? active : history;

  return (
    <Screen>
      <View style={{ padding: Spacing.three, paddingBottom: 0, gap: Spacing.three }}>
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            My Applications
          </Txt>
          <Txt size="sm" tone="secondary">
            Track every drive you have applied to
          </Txt>
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          <Chip label="Active" active={tab === 'active'} onPress={() => setTab('active')} count={active.length} />
          <Chip label="History" active={tab === 'history'} onPress={() => setTab('history')} count={history.length} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.three }}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <EmptyState
            icon="📋"
            title={tab === 'active' ? 'No active applications' : 'No past applications'}
            message={
              tab === 'active'
                ? 'Browse the drives tab and apply to a drive to start tracking your progress here.'
                : 'Applications you were rejected from will appear here.'
            }
          />
        ) : (
          list.map((app) => {
            const drive = getDrive(app.driveId);
            if (!drive) return null;
            const company = getCompany(drive.companyId);

            const statusTone =
              app.status === 'offered'
                ? 'success'
                : app.status === 'rejected'
                  ? 'danger'
                  : app.status === 'shortlisted'
                    ? 'brand'
                    : 'warning';

            const statusLabel =
              app.status === 'offered'
                ? 'Offer Received'
                : app.status === 'rejected'
                  ? 'Not Selected'
                  : app.status === 'shortlisted'
                    ? 'Shortlisted'
                    : 'In Progress';

            return (
              <Card
                key={app.id}
                onPress={() => router.push('/(student)/applications/tracker')}
                accent={
                  app.status === 'offered'
                    ? t.success
                    : app.status === 'rejected'
                      ? t.danger
                      : t.borderStrong
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
                  <Logo text={company.logoText} />
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
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                  <Badge label={statusLabel} tone={statusTone} />
                  <Badge label={STAGE_DISPLAY[app.currentStage]} tone="neutral" />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderTopWidth: 1,
                    borderTopColor: '#E2E8F0',
                    paddingTop: Spacing.two,
                  }}
                >
                  <Txt size="xs" tone="muted">
                    Applied {formatDate(app.appliedAt)}
                  </Txt>
                  <Txt size="xs" tone="brand" weight="600">
                    View tracker ›
                  </Txt>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}