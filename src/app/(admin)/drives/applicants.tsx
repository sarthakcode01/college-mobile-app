import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { STAGE_DISPLAY } from '@/components/pipeline-stepper';
import {
    Badge,
    Button,
    Card,
    Chip,
    EmptyState,
    Input,
    Logo,
    Screen,
    Toast,
    Txt,
} from '@/components/ui-kit';
import { Radius, Spacing , TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exportApplicantsToCsv, summariseApplicants } from '@/lib/csv';
import { BRANCHES, DRIVES, buildApplicants, getCompany } from '@/lib/demo-data';
import type { ApplicantRow, ApplicationStage } from '@/lib/types';

const STAGES: ApplicationStage[] = ['Applied', 'OA', 'Tech_1', 'Tech_2', 'HR', 'Selected'];

export default function ApplicantsScreen() {
  const t = useTheme();

  const [driveId, setDriveId] = useState(DRIVES[0].id);
  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState<string>('all');
  const [stage, setStage] = useState<ApplicationStage | 'all'>('all');
  const [minCgpa, setMinCgpa] = useState(0);
  const [onlyEligibleBacklog, setOnlyEligibleBacklog] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' | 'brand' } | null>(null);

  const drive = DRIVES.find((d) => d.id === driveId)!;
  const company = getCompany(drive.companyId);
  const allApplicants = useMemo(() => buildApplicants(driveId), [driveId]);

  const filtered = useMemo(() => {
    return allApplicants.filter((row) => {
      if (branch !== 'all' && row.branch !== branch) return false;
      if (stage !== 'all' && row.stage !== stage) return false;
      if (row.cgpa < minCgpa) return false;
      if (onlyEligibleBacklog && row.activeBacklogs > drive.eligibility.maxActiveBacklogs) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = `${row.name} ${row.email} ${row.rollNumber} ${row.branch}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allApplicants, branch, stage, minCgpa, onlyEligibleBacklog, query, drive]);

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleExport() {
    const result = await exportApplicantsToCsv(filtered, `${company.name}_${drive.jobRole}`.replace(/\s+/g, '_'));
    if (result.ok) {
      setToast({
        message: `Exported ${result.rowCount} applicants to ${result.fileName}`,
        tone: 'success',
      });
    } else {
      setToast({ message: result.reason, tone: 'danger' });
    }
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <Screen>
      {/* Drive selector */}
      <View style={{ padding: Spacing.three, paddingBottom: 0, gap: Spacing.three }}>
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
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          {DRIVES.map((d) => {
            const c = getCompany(d.companyId);
            const active = d.id === driveId;
            return (
              <Pressable
                key={d.id}
                onPress={() => {
                  setDriveId(d.id);
                  setSelected([]);
                }}
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 7,
                  borderRadius: Radius.full,
                  borderWidth: 1,
                  borderColor: active ? t.brand : t.border,
                  backgroundColor: active ? t.brand : t.backgroundElement,
                }}
              >
                <Txt size="xs" weight="600" style={{ color: active ? '#fff' : t.textSecondary }}>
                  {c.name}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>

        <Input
          placeholder="Search name, roll number or email…"
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          <Chip label="All stages" active={stage === 'all'} onPress={() => setStage('all')} />
          {STAGES.map((s) => (
            <Chip
              key={s}
              label={STAGE_DISPLAY[s].split(' ')[0]}
              active={stage === s}
              onPress={() => setStage(stage === s ? 'all' : s)}
              count={allApplicants.filter((a) => a.stage === s).length}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          <Chip label="All branches" active={branch === 'all'} onPress={() => setBranch('all')} />
          {BRANCHES.map((b) => (
            <Chip
              key={b}
              label={b.split(' ')[0]}
              active={branch === b}
              onPress={() => setBranch(branch === b ? 'all' : b)}
              count={allApplicants.filter((a) => a.branch === b).length}
            />
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'center' }}>
          <Chip
            label={`CGPA ≥ ${minCgpa.toFixed(1)}`}
            active={minCgpa > 0}
            onPress={() => setMinCgpa(minCgpa >= 9 ? 0 : minCgpa + 0.5)}
          />
          <Chip
            label="Backlog eligible"
            active={onlyEligibleBacklog}
            onPress={() => setOnlyEligibleBacklog((v) => !v)}
          />
        </View>
      </View>

      {/* Summary + export */}
      <View
        style={{
          paddingHorizontal: Spacing.three,
          paddingVertical: Spacing.two,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.two,
        }}
      >
        <Txt size="sm" weight="700" style={{ flex: 1 }}>
          {filtered.length} of {allApplicants.length}
        </Txt>
        {selected.length > 0 ? <Badge label={`${selected.length} selected`} tone="brand" /> : null}
        <Button label="Export CSV" icon="⬇" size="sm" onPress={handleExport} disabled={filtered.length === 0} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.two }}
        showsVerticalScrollIndicator={false}
      >
        {toast ? (
          <View style={{ marginBottom: Spacing.two }}>
            <Toast message={toast.message} tone={toast.tone} />
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No applicants match" message="Relax the filters to see more students." />
        ) : (
          <>
            <Pressable onPress={() => setSelected(selected.length === filtered.length ? [] : filtered.map((r) => r.studentId))}>
              <Card style={{ padding: Spacing.two }}>
                <Txt size="xs" weight="700" tone="brand">
                  {selected.length === filtered.length ? '☑ Deselect all' : '☐ Select all'}
                </Txt>
              </Card>
            </Pressable>

            {filtered.map((row) => (
              <ApplicantRowCard
                key={row.studentId}
                row={row}
                selected={selected.includes(row.studentId)}
                onToggle={() => toggleSelect(row.studentId)}
              />
            ))}

            <Card style={{ marginTop: Spacing.three }}>
              <Txt size="xs" weight="700" tone="secondary">
                BRANCH-WISE BREAKDOWN
              </Txt>
              <Txt size="xs" tone="muted" style={{ lineHeight: 18 }}>
                {summariseApplicants(filtered)}
              </Txt>
            </Card>

            {selected.length > 0 ? (
              <Card accent={t.brand} style={{ marginTop: Spacing.three }}>
                <Txt size="sm" weight="700">
                  {selected.length} candidate{selected.length === 1 ? '' : 's'} selected
                </Txt>
                <Txt size="xs" tone="secondary">
                  Bulk actions will be available once the applicants table is connected to the
                  live database.
                </Txt>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function ApplicantRowCard({
  row,
  selected,
  onToggle,
}: {
  row: ApplicantRow;
  selected: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onToggle}>
      <Card
        accent={selected ? t.brand : undefined}
        style={{ padding: Spacing.three, gap: 6 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <Txt size="sm" weight="800" tone={selected ? 'brand' : 'muted'}>
            {selected ? '☑' : '☐'}
          </Txt>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt size="sm" weight="700">
              {row.name}
            </Txt>
            <Txt size="xs" tone="muted">
              {row.rollNumber} · {row.branch}
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt size="sm" weight="800" tone="brand">
              {row.cgpa.toFixed(2)}
            </Txt>
            <Txt size="xs" tone="muted">
              CGPA
            </Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Badge label={STAGE_DISPLAY[row.stage]} tone={row.status === 'rejected' ? 'danger' : row.status === 'offered' ? 'success' : 'brand'} />
          <Badge label={row.gender} tone="neutral" />
          {row.activeBacklogs > 0 ? (
            <Badge label={`${row.activeBacklogs} backlog`} tone="warning" />
          ) : (
            <Badge label="No backlog" tone="success" />
          )}
        </View>

        <Txt size="xs" tone="muted" numberOfLines={1}>
          {row.email}
        </Txt>
      </Card>
    </Pressable>
  );
}