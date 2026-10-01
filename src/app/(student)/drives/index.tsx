import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge, Card, Chip, EmptyState, Input, Logo, Screen, Txt } from '@/components/ui-kit';
import { Radius, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DRIVES, getCompany } from '@/lib/demo-data';
import {
    DEFAULT_POLICY,
    evaluateForDrive,
    formatCountdown,
    formatRelativeDeadline,
    getDriveTier,
    TIER_LABELS,
    timeUntilDeadline,
} from '@/lib/eligibility';
import { useStore } from '@/lib/store';

type TierFilter = 'all' | 'super_dream' | 'dream' | 'regular' | 'internship';
type StatusFilter = 'all' | 'open' | 'upcoming' | 'closed';

export default function DrivesScreen() {
  const router = useRouter();
  const t = useTheme();
  const { student, applications } = useStore();

  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [onlyEligible, setOnlyEligible] = useState(false);

  const appliedIds = useMemo(
    () => new Set(applications.filter((a) => a.status !== 'rejected').map((a) => a.driveId)),
    [applications],
  );

  const filtered = useMemo(() => {
    return DRIVES.filter((drive) => {
      const company = getCompany(drive.companyId);

      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = `${company.name} ${drive.jobTitle} ${drive.jobRole} ${drive.location} ${drive.keySkills.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (tier !== 'all') {
        if (tier === 'internship') {
          if (drive.jobType !== 'internship') return false;
        } else if (getDriveTier(drive.ctcLpa) !== tier) {
          return false;
        }
      }

      if (status !== 'all' && drive.status !== status) return false;

      if (onlyEligible) {
        if (!evaluateForDrive(student, drive, DEFAULT_POLICY).isEligible) return false;
      }

      return true;
    }).sort((a, b) => {
      const tierRank = { super_dream: 0, dream: 1, regular: 2 } as const;
      return (
        tierRank[getDriveTier(a.ctcLpa)] - tierRank[getDriveTier(b.ctcLpa)] ||
        timeUntilDeadline(a) - timeUntilDeadline(b)
      );
    });
  }, [query, tier, status, onlyEligible, student]);

  const eligibleTotal = useMemo(
    () => DRIVES.filter((d) => evaluateForDrive(student, d, DEFAULT_POLICY).isEligible).length,
    [student],
  );

  return (
    <Screen>
      <View style={{ padding: Spacing.three, paddingBottom: 0, gap: Spacing.three }}>
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            Placement Drives
          </Txt>
          <Txt size="sm" tone="secondary">
            {DRIVES.length} drives · {eligibleTotal} you are eligible for
          </Txt>
        </View>

        <Input
          placeholder="Search company, role or skill…"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          <Chip label="All tiers" active={tier === 'all'} onPress={() => setTier('all')} />
          <Chip
            label="Super Dream"
            active={tier === 'super_dream'}
            onPress={() => setTier('super_dream')}
            count={DRIVES.filter((d) => getDriveTier(d.ctcLpa) === 'super_dream').length}
          />
          <Chip
            label="Dream"
            active={tier === 'dream'}
            onPress={() => setTier('dream')}
            count={DRIVES.filter((d) => getDriveTier(d.ctcLpa) === 'dream').length}
          />
          <Chip
            label="Regular"
            active={tier === 'regular'}
            onPress={() => setTier('regular')}
            count={DRIVES.filter((d) => getDriveTier(d.ctcLpa) === 'regular').length}
          />
          <Chip
            label="Internships"
            active={tier === 'internship'}
            onPress={() => setTier('internship')}
            count={DRIVES.filter((d) => d.jobType === 'internship').length}
          />
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          <Chip
            label="Only eligible"
            active={onlyEligible}
            onPress={() => setOnlyEligible((v) => !v)}
          />
          <View style={{ width: 1, backgroundColor: t.border }} />
          <Chip label="Open" active={status === 'open'} onPress={() => setStatus(status === 'open' ? 'all' : 'open')} />
          <Chip
            label="Upcoming"
            active={status === 'upcoming'}
            onPress={() => setStatus(status === 'upcoming' ? 'all' : 'upcoming')}
          />
          <Chip
            label="Closed"
            active={status === 'closed'}
            onPress={() => setStatus(status === 'closed' ? 'all' : 'closed')}
          />
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.three }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No drives match your filters"
            message="Try clearing the search or removing a filter to see more opportunities."
          />
        ) : (
          filtered.map((drive) => {
            const company = getCompany(drive.companyId);
            const verdict = evaluateForDrive(student, drive, DEFAULT_POLICY);
            const driveTier = getDriveTier(drive.ctcLpa);
            const applied = appliedIds.has(drive.id);
            const msLeft = timeUntilDeadline(drive);

            return (
              <Card
                key={drive.id}
                onPress={() => router.push({ pathname: '/(student)/drives/[id]', params: { id: drive.id } })}
                accent={verdict.isEligible ? t.success : t.danger}
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
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Txt size="md" weight="800" tone="brand">
                      {drive.ctcLpa} LPA
                    </Txt>
                    <Txt size="xs" tone="muted">
                      {drive.jobType === 'internship' ? 'Internship' : 'Full time'}
                    </Txt>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Badge
                    label={TIER_LABELS[driveTier]}
                    tone={driveTier === 'super_dream' ? 'brand' : driveTier === 'dream' ? 'warning' : 'neutral'}
                  />
                  {verdict.isEligible ? (
                    <Badge label="Eligible" tone="success" icon="✓" />
                  ) : (
                    <Badge label={`Fails ${verdict.failures.length}`} tone="danger" icon="✕" />
                  )}
                  {applied ? <Badge label="Applied" tone="neutral" /> : null}
                  {drive.jobType === 'internship' ? (
                    <Badge label={`₹${((drive.stipendPerMonth ?? 0) / 1000).toFixed(0)}k/mo`} tone="neutral" />
                  ) : null}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTopWidth: 1,
                    borderTopColor: t.border,
                    paddingTop: Spacing.two,
                  }}
                >
                  <Txt size="xs" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
                    📍 {drive.location}
                  </Txt>
                  <View
                    style={{
                      backgroundColor: msLeft > 0 && msLeft < 3 * 86400000 ? t.dangerSoft : t.backgroundElement,
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: Radius.full,
                    }}
                  >
                    <Txt
                      size="xs"
                      weight="700"
                      tone={msLeft > 0 && msLeft < 3 * 86400000 ? 'danger' : 'secondary'}
                    >
                      {formatCountdown(msLeft)}
                    </Txt>
                  </View>
                </View>

                <Txt size="xs" tone="muted">
                  {formatRelativeDeadline(drive)}
                </Txt>
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}