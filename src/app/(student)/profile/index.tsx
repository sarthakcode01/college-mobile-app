import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import {
    Badge,
    Button,
    Card,
    RowLink,
    Screen,
    Section,
    Toast,
    Txt,
} from '@/components/ui-kit';
import { COLLEGE, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DRIVES } from '@/lib/demo-data';
import { DEFAULT_POLICY, evaluateForDrive, isDriveOpen } from '@/lib/eligibility';
import { requestNotificationPermission } from '@/lib/notifications';
import { useStore } from '@/lib/store';

export default function ProfileScreen() {
  const { student, applications, signOut, updateProfile } = useStore();
  const t = useTheme();
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' | 'brand' } | null>(null);

  const eligibleCount = DRIVES.filter(
    (d) => isDriveOpen(d) && evaluateForDrive(student, d, DEFAULT_POLICY).isEligible,
  ).length;

  async function pickResume() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      updateProfile({ resumeName: asset.name });
      setToast({ message: `Resume attached: ${asset.name}`, tone: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ message: 'Could not open the file picker.', tone: 'danger' });
      setTimeout(() => setToast(null), 3000);
    }
  }

  useEffect(() => {
    // Ask once on mount; silently declines if unavailable (e.g. Expo Go).
    requestNotificationPermission().catch(() => false);
  }, []);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            Academic Profile
          </Txt>
          <Txt size="sm" tone="secondary">
            This data drives every eligibility check
          </Txt>
        </View>

        {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}

        {/* Identity */}
        <Card accent={t.brand}>
          <Txt size="lg" weight="800">
            {student.fullName}
          </Txt>
          <Txt size="sm" tone="secondary">
            {student.rollNumber} · {student.branch}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: Spacing.two }}>
            <Badge label={`CGPA ${student.cgpa.toFixed(2)}`} tone="brand" />
            <Badge
              label={student.activeBacklogs === 0 ? 'No active backlogs' : `${student.activeBacklogs} active backlog`}
              tone={student.activeBacklogs === 0 ? 'success' : 'danger'}
            />
            <Badge label={eligibleCount + ' eligible drives'} tone="success" />
          </View>
        </Card>

        {/* Academic scorecard */}
        <Section title="Academic scorecard">
          <Card>
            <ScoreRow label="Current CGPA" value={student.cgpa.toFixed(2)} />
            <ScoreRow label="Class 10th" value={`${student.tenthPercentage}%`} />
            <ScoreRow label="Class 12th / Diploma" value={`${student.twelfthPercentage}%`} />
            <ScoreRow label="Active backlogs" value={String(student.activeBacklogs)} />
            <ScoreRow label="Total backlog history" value={String(student.totalBacklogHistory)} last />
          </Card>
        </Section>

        {/* Contact */}
        <Section title="Contact details">
          <Card>
            <ScoreRow label="Email" value={student.email} />
            <ScoreRow label="Phone" value={student.phone} />
            <ScoreRow label="Gender" value={student.gender} last />
          </Card>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {student.skills.map((skill) => (
              <Badge key={skill} label={skill} tone="brand" />
            ))}
          </View>
        </Section>

        {/* Resume */}
        <Section title="Resume">
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
              <Txt size="lg">📄</Txt>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt size="sm" weight="600" numberOfLines={1}>
                  {student.resumeName ?? 'No resume attached'}
                </Txt>
                <Txt size="xs" tone="muted">
                  {student.resumeName ? 'PDF · verified by placement cell' : 'A verified resume is required for most drives'}
                </Txt>
              </View>
            </View>
            <Button
              label={student.resumeName ? 'Replace resume' : 'Upload resume (PDF)'}
              variant="secondary"
              onPress={pickResume}
            />
          </Card>
        </Section>

        {/* Policy */}
        <Section title="Placement policy">
          <Card>
            <Txt size="sm" tone="secondary">
              Every student may hold a maximum of two offers — one core offer and one dream
              offer. Students who do not attend an interview without prior approval are
              blacklisted from the remaining drives for that semester.
            </Txt>
          </Card>
        </Section>

        <Section title="Account">
          <RowLink
            title="Placement helpdesk"
            subtitle="tpо@dhsgu.edu.in"
            onPress={() => Linking.openURL('mailto:tpo@dhsgu.edu.in')}
            left={<Txt size="lg">✉️</Txt>}
          />
          <RowLink
            title="College website"
            subtitle={COLLEGE.name}
            onPress={() => Linking.openURL('https://www.dhsgu.edu.in')}
            left={<Txt size="lg">🌐</Txt>}
          />
        </Section>

        <Button label="Sign out" variant="ghost" onPress={signOut} />
      </ScrollView>
    </Screen>
  );
}

function ScoreRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
      }}
    >
      <Txt size="sm" tone="secondary">
        {label}
      </Txt>
      <Txt size="sm" weight="700">
        {value}
      </Txt>
    </View>
  );
}