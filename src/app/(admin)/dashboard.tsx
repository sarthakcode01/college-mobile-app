import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Badge, Button, Card, Screen, Section, Txt } from '@/components/ui-kit';
import { COLLEGE, Radius, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ANALYTICS } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

export default function AdminDashboard() {
  const router = useRouter();
  const t = useTheme();
  const { user, signOut } = useStore();

  const maxCtc = Math.max(...ANALYTICS.ctcDistribution.map((c) => c.count));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 2 }}>
          <Txt size="sm" tone="secondary">
            {COLLEGE.placementCell}
          </Txt>
          <Txt size="xl" weight="700" family="display">
            {user?.fullName}
          </Txt>
          <Txt size="xs" tone="muted">
            {user?.designation}
          </Txt>
        </View>

        {/* Headline stats */}
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          <MetricTile
            value={`${ANALYTICS.placementPercentage}%`}
            label="Placed"
            tone={t.success}
            sub={`${ANALYTICS.placedStudents} of ${ANALYTICS.totalStudents}`}
          />
          <MetricTile
            value={`${ANALYTICS.averageCtc}`}
            label="Avg CTC"
            tone={t.brand}
            sub="LPA"
          />
          <MetricTile
            value={`${ANALYTICS.highestCtc}`}
            label="Highest"
            tone={t.warning}
            sub="LPA"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          <MetricTile
            value={String(ANALYTICS.activeDrives)}
            label="Open drives"
            tone={t.brand}
          />
          <MetricTile
            value={String(ANALYTICS.totalOffers)}
            label="Total offers"
            tone={t.success}
          />
        </View>

        {/* Quick actions */}
        <Section title="Quick actions">
          <View style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Button
              label="+ Create drive"
              onPress={() => router.push('/(admin)/drives/create')}
              style={{ flex: 1 }}
            />
            <Button
              label="New broadcast"
              variant="secondary"
              onPress={() => router.push('/(admin)/broadcasts')}
              style={{ flex: 1 }}
            />
          </View>
        </Section>

        {/* Branch-wise placement */}
        <Section title="Branch-wise placement rate">
          <Card>
            {ANALYTICS.branchWise.map((row, index) => (
              <View
                key={row.branch}
                style={{
                  gap: 6,
                  paddingVertical: Spacing.two,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: t.border,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt size="xs" weight="600" style={{ flex: 1 }} numberOfLines={1}>
                    {row.branch}
                  </Txt>
                  <Txt size="xs" weight="800" tone={row.percentage >= 75 ? 'success' : row.percentage >= 55 ? 'warning' : 'danger'}>
                    {row.percentage}%
                  </Txt>
                </View>
                <View style={{ height: 6, backgroundColor: t.backgroundElement, borderRadius: Radius.full, overflow: 'hidden' }}>
                  <View
                    style={{
                      width: `${row.percentage}%`,
                      height: '100%',
                      backgroundColor: row.percentage >= 75 ? t.success : row.percentage >= 55 ? t.warning : t.danger,
                    }}
                  />
                </View>
                <Txt size="xs" tone="muted">
                  {row.placed} placed of {row.total} students
                </Txt>
              </View>
            ))}
          </Card>
        </Section>

        {/* CTC distribution */}
        <Section title="CTC distribution">
          <Card>
            {ANALYTICS.ctcDistribution.map((row, index) => (
              <View
                key={row.range}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.three,
                  paddingVertical: Spacing.two,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: t.border,
                }}
              >
                <Txt size="xs" tone="secondary" style={{ width: 80 }}>
                  {row.range}
                </Txt>
                <View style={{ flex: 1, height: 18, backgroundColor: t.backgroundElement, borderRadius: Radius.sm, overflow: 'hidden' }}>
                  <View
                    style={{
                      width: `${(row.count / maxCtc) * 100}%`,
                      height: '100%',
                      backgroundColor: t.brand,
                      opacity: 0.4 + (row.count / maxCtc) * 0.6,
                    }}
                  />
                </View>
                <Txt size="xs" weight="700" style={{ width: 28, textAlign: 'right' }}>
                  {row.count}
                </Txt>
              </View>
            ))}
          </Card>
        </Section>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
            <Badge label="Note" tone="warning" />
            <Txt size="xs" tone="secondary" style={{ flex: 1 }}>
              Analytics are computed from the current placement dataset and refresh once the
              database is connected.
            </Txt>
          </View>
        </Card>

        <Button label="Sign out" variant="ghost" onPress={signOut} />
      </ScrollView>
    </Screen>
  );
}

function MetricTile({
  value,
  label,
  tone,
  sub,
}: {
  value: string;
  label: string;
  tone: string;
  sub?: string;
}) {
  return (
    <Card style={{ flex: 1, padding: Spacing.three, gap: 2 }}>
      <Txt size="xl" weight="700" family="display" style={{ color: tone }}>
        {value}
      </Txt>
      <Txt size="xs" tone="secondary">
        {label}
      </Txt>
      {sub ? (
        <Txt size="xs" tone="muted">
          {sub}
        </Txt>
      ) : null}
    </Card>
  );
}