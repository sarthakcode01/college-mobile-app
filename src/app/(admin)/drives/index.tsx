import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Badge, Button, Card, Chip, EmptyState, Logo, Screen, Txt } from '@/components/ui-kit';
import { Radius, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildApplicants, DRIVES, getCompany } from '@/lib/demo-data';
import { formatCountdown, getDriveTier, TIER_LABELS, timeUntilDeadline } from '@/lib/eligibility';
import { useStore } from '@/lib/store';
import type { DriveStatus } from '@/lib/types';

export default function AdminDrivesScreen() {
  const router = useRouter();
  const t = useTheme();
  const { drives, setDriveStatus } = useStore();
  const [filter, setFilter] = useState<DriveStatus | 'all'>('all');

  /** New drives created in-session are merged with the seeded ones. */
  const allDrives = useMemo(() => [...drives, ...DRIVES], [drives]);

  const filtered = useMemo(
    () =>
      allDrives
        .filter((d) => filter === 'all' || d.status === filter)
        .sort((a, b) => timeUntilDeadline(a) - timeUntilDeadline(b)),
    [allDrives, filter],
  );

  const counts = {
    open: allDrives.filter((d) => d.status === 'open').length,
    upcoming: allDrives.filter((d) => d.status === 'upcoming').length,
    closed: allDrives.filter((d) => d.status === 'closed').length,
    completed: allDrives.filter((d) => d.status === 'completed').length,
  };

  return (
    <Screen>
      <View style={{ padding: Spacing.three, paddingBottom: 0, gap: Spacing.three }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size="xl" weight="700" family="display">
              Manage Drives
            </Txt>
            <Txt size="sm" tone="secondary">
              {allDrives.length} total · {counts.open} open
            </Txt>
          </View>
          <Pressable
            onPress={() => router.push('/(admin)/drives/create')}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: Radius.md,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Txt size="xl" weight="800" style={{ color: '#fff' }}>
              +
            </Txt>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} count={allDrives.length} />
          <Chip label="Open" active={filter === 'open'} onPress={() => setFilter('open')} count={counts.open} />
          <Chip label="Upcoming" active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} count={counts.upcoming} />
          <Chip label="Closed" active={filter === 'closed'} onPress={() => setFilter('closed')} count={counts.closed} />
          <Chip label="Completed" active={filter === 'completed'} onPress={() => setFilter('completed')} count={counts.completed} />
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.three }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📭" title="No drives here" message="Create a new placement drive to get started." />
        ) : (
          filtered.map((drive) => {
            const company = getCompany(drive.companyId);
            const applicants = buildApplicants(drive.id);
            const tier = getDriveTier(drive.ctcLpa);
            const msLeft = timeUntilDeadline(drive);

            return (
              <Card key={drive.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
                  <Logo text={company.logoText} size={40} />
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

                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Badge
                    label={drive.status.toUpperCase()}
                    tone={
                      drive.status === 'open'
                        ? 'success'
                        : drive.status === 'upcoming'
                          ? 'brand'
                          : drive.status === 'completed'
                            ? 'warning'
                            : 'neutral'
                    }
                  />
                  <Badge label={TIER_LABELS[tier]} tone="neutral" />
                  <Badge label={`${applicants.length} applicants`} tone="neutral" />
                  <Badge
                    label={
                      msLeft > 0 ? formatCountdown(msLeft) : 'Deadline passed'
                    }
                    tone={msLeft > 0 && msLeft < 3 * 86400000 ? 'danger' : 'neutral'}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
                  <Button
                    label="Applicants"
                    variant="secondary"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={() => router.push('/(admin)/drives/applicants')}
                  />
                  <Button
                    label={drive.status === 'open' ? 'Close' : 'Reopen'}
                    variant="ghost"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={() => setDriveStatus(drive.id, drive.status === 'open' ? 'closed' : 'open')}
                  />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}