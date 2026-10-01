import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
    Badge,
    Button,
    Card,
    Chip,
    EmptyState,
    Input,
    ProgressBar,
    Screen,
    Txt
} from '@/components/ui-kit';
import { COLLEGE, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exportApplicantsToCsv } from '@/lib/csv';
import { BRANCHES, DIRECTORY } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

export default function StudentDirectoryScreen() {
  const { user, signOut } = useStore();
  const t = useTheme();
  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState('all');
  const [minCgpa, setMinCgpa] = useState(0);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null);

  const filtered = useMemo(() => {
    return DIRECTORY.filter((s) => {
      if (branch !== 'all' && s.branch !== branch) return false;
      if (s.cgpa < minCgpa) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!`${s.fullName} ${s.email} ${s.rollNumber}`.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.cgpa - a.cgpa);
  }, [query, branch, minCgpa]);

  async function handleExport() {
    const rows = filtered.map((s) => ({
      studentId: s.id,
      name: s.fullName,
      rollNumber: s.rollNumber,
      email: s.email,
      phone: s.phone,
      branch: s.branch,
      cgpa: s.cgpa,
      gender: s.gender,
      activeBacklogs: s.activeBacklogs,
      resumeName: s.resumeName ?? '',
      stage: 'Applied' as const,
      status: 'in_progress' as const,
    }));

    const result = await exportApplicantsToCsv(rows, 'student_directory');
    setToast(
      result.ok
        ? { message: `Exported ${result.rowCount} students to ${result.fileName}`, tone: 'success' }
        : { message: result.reason, tone: 'danger' },
    );
    setTimeout(() => setToast(null), 4000);
  }

  const avgCgpa = filtered.length
    ? filtered.reduce((sum, s) => sum + s.cgpa, 0) / filtered.length
    : 0;

  const placedCount = Math.round((filtered.length * 73) / 100);

  return (
    <Screen>
      <View style={{ padding: Spacing.three, paddingBottom: 0, gap: Spacing.three }}>
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            Student Directory
          </Txt>
          <Txt size="sm" tone="secondary">
            {user?.designation}
          </Txt>
        </View>

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
          <Chip label="All branches" active={branch === 'all'} onPress={() => setBranch('all')} count={DIRECTORY.length} />
          {BRANCHES.map((b) => (
            <Chip
              key={b}
              label={b.split(' ')[0]}
              active={branch === b}
              onPress={() => setBranch(branch === b ? 'all' : b)}
              count={DIRECTORY.filter((s) => s.branch === b).length}
            />
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          <Chip
            label={`CGPA ≥ ${minCgpa.toFixed(1)}`}
            active={minCgpa > 0}
            onPress={() => setMinCgpa(minCgpa >= 9 ? 0 : minCgpa + 0.5)}
          />
          <Button label="Export CSV" icon="⬇" size="sm" onPress={handleExport} disabled={filtered.length === 0} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.two }}
        showsVerticalScrollIndicator={false}
      >
        {toast ? (
          <View style={{ marginBottom: Spacing.two }}>
            <Card accent={t.success}>
              <Txt size="sm" tone="success" weight="600">
                {toast.message}
              </Txt>
            </Card>
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No students found" message="Adjust the search or filters." />
        ) : (
          <>
            <Card accent={t.brand}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size="xs" tone="secondary">
                    Showing
                  </Txt>
                  <Txt size="xl" weight="700" family="display">
                    {filtered.length}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size="xs" tone="secondary">
                    Avg CGPA
                  </Txt>
                  <Txt size="xl" weight="700" family="display" tone="brand">
                    {avgCgpa.toFixed(2)}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size="xs" tone="secondary">
                    Placed
                  </Txt>
                  <Txt size="xl" weight="700" family="display" tone="success">
                    {placedCount}
                  </Txt>
                </View>
              </View>
            </Card>

            {filtered.slice(0, 40).map((s) => (
              <Card key={s.id} style={{ padding: Spacing.three, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Txt size="sm" weight="700">
                      {s.fullName}
                    </Txt>
                    <Txt size="xs" tone="muted">
                      {s.rollNumber} · {s.branch}
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Txt size="sm" weight="800" tone="brand">
                      {s.cgpa.toFixed(2)}
                    </Txt>
                    <Txt size="xs" tone="muted">
                      CGPA
                    </Txt>
                  </View>
                </View>
                <ProgressBar value={(s.cgpa / 10) * 100} tone={s.cgpa >= 8 ? 'success' : s.cgpa >= 6.5 ? 'warning' : 'brand'} />
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Badge label={s.gender} tone="neutral" />
                  {s.activeBacklogs > 0 ? (
                    <Badge label={`${s.activeBacklogs} backlog`} tone="warning" />
                  ) : (
                    <Badge label="Clean record" tone="success" />
                  )}
                  <Badge label={s.resumeName ? 'Resume verified' : 'No resume'} tone={s.resumeName ? 'success' : 'danger'} />
                </View>
              </Card>
            ))}

            {filtered.length > 40 ? (
              <Txt size="xs" tone="muted" style={{ textAlign: 'center', marginTop: Spacing.two }}>
                Showing 40 of {filtered.length}. Refine your filters to narrow the list.
              </Txt>
            ) : null}
          </>
        )}

        <Button label="Sign out" variant="ghost" onPress={signOut} style={{ marginTop: Spacing.three }} />

        <Txt size="xs" tone="muted" style={{ textAlign: 'center' }}>
          {COLLEGE.placementCell} · {COLLEGE.shortName}
        </Txt>
      </ScrollView>
    </Screen>
  );
}