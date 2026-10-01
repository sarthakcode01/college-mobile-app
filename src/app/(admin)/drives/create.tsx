import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

import { Badge, Button, Card, Input, Screen, Section, Toast, Txt } from '@/components/ui-kit';
import { COLLEGE, Radius, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BRANCHES, COMPANIES, daysFromNow } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

const schema = z.object({
  companyId: z.string().min(1, 'Select a company'),
  jobTitle: z.string().min(3, 'Enter a job title'),
  jobRole: z.string().min(2, 'Enter the role'),
  ctcLpa: z.number().min(0.1, 'CTC must be above 0').max(100, 'Check the CTC value'),
  location: z.string().min(2, 'Enter a location'),
  minCgpa: z.number().min(0).max(10),
  minTenthMarks: z.number().min(0).max(100),
  minTwelfthMarks: z.number().min(0).max(100),
  maxActiveBacklogs: z.number().min(0).max(10),
  deadlineDays: z.number().min(0).max(90),
});

type FormValues = z.infer<typeof schema>;

const STEPS = ['Company & role', 'CTC & location', 'Eligibility criteria', 'Rounds & review'] as const;

export default function CreateDriveScreen() {
  const router = useRouter();
  const t = useTheme();
  const { createDrive } = useStore();

  const [step, setStep] = useState(0);
  const [branches, setBranches] = useState<string[]>([...BRANCHES]);
  const [rounds, setRounds] = useState<string[]>([
    'Online Assessment',
    'Technical Interview',
    'HR Interview',
  ]);
  const [newRound, setNewRound] = useState('');
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: COMPANIES[0].id,
      jobTitle: '',
      jobRole: '',
      ctcLpa: 8,
      location: 'Bengaluru, Karnataka',
      minCgpa: 7,
      minTenthMarks: 70,
      minTwelfthMarks: 70,
      maxActiveBacklogs: 0,
      deadlineDays: 5,
    },
  });

  async function next() {
    const fieldsByStep: (keyof FormValues)[][] = [
      ['companyId', 'jobTitle', 'jobRole'],
      ['ctcLpa', 'location'],
      ['minCgpa', 'minTenthMarks', 'minTwelfthMarks', 'maxActiveBacklogs', 'deadlineDays'],
      [],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  const onSubmit = handleSubmit((values) => {
    if (branches.length === 0) {
      setToast({ message: 'Select at least one eligible branch.', tone: 'danger' });
      return;
    }
    if (rounds.length === 0) {
      setToast({ message: 'Add at least one selection round.', tone: 'danger' });
      return;
    }

    const company = COMPANIES.find((c) => c.id === values.companyId)!;

    createDrive({
      id: `drv-new-${Date.now()}`,
      companyId: values.companyId,
      jobTitle: values.jobTitle,
      jobRole: values.jobRole,
      ctcLpa: values.ctcLpa,
      location: values.location,
      workMode: 'onsite',
      jobType: 'full_time',
      eligibility: {
        minCgpa: values.minCgpa,
        allowedBranches: branches,
        maxActiveBacklogs: values.maxActiveBacklogs,
        minTenthMarks: values.minTenthMarks,
        minTwelfthMarks: values.minTwelfthMarks,
      },
      rounds: rounds.map((name) => ({ name, description: 'As defined by the company.' })),
      registrationDeadline: daysFromNow(values.deadlineDays, 23, 59),
      driveDate: daysFromNow(values.deadlineDays + 4, 10, 0),
      status: 'open',
      jdSummary: 'Job description pending upload by the placement cell.',
      keySkills: ['Communication', 'Problem Solving'],
    });

    setToast({ message: `${company.name} drive published successfully.`, tone: 'success' });
    setTimeout(() => router.back(), 900);
  });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            Create Drive
          </Txt>
          <Txt size="sm" tone="secondary">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </Txt>
        </View>

        {/* Step indicator */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STEPS.map((label, i) => (
            <View
              key={label}
              style={{
                flex: 1,
                height: 4,
                borderRadius: Radius.full,
                backgroundColor: i <= step ? t.brand : t.backgroundElement,
              }}
            />
          ))}
        </View>

        {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}

        {/* STEP 1 */}
        {step === 0 ? (
          <Section title="Company & role">
            <Card>
              <Controller
                control={control}
                name="companyId"
                render={({ field }) => (
                  <View style={{ gap: 6 }}>
                    <Txt size="sm" weight="600" tone="secondary">
                      Company
                    </Txt>
                    <View style={{ gap: 6 }}>
                      {COMPANIES.map((c) => (
                        <Pressable
                          key={c.id}
                          onPress={() => field.onChange(c.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: Spacing.two,
                            padding: 10,
                            borderRadius: Radius.md,
                            borderWidth: 1,
                            borderColor: field.value === c.id ? t.brand : t.border,
                            backgroundColor: field.value === c.id ? t.brandSoft : 'transparent',
                          }}
                        >
                          <Txt size="sm" weight="700">
                            {c.name}
                          </Txt>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="jobTitle"
                render={({ field }) => (
                  <Input
                    label="Job title"
                    placeholder="Software Engineer — Campus 2027"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.jobTitle?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="jobRole"
                render={({ field }) => (
                  <Input
                    label="Role designation"
                    placeholder="Software Development Engineer"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.jobRole?.message}
                  />
                )}
              />
            </Card>
          </Section>
        ) : null}

        {/* STEP 2 */}
        {step === 1 ? (
          <Section title="Compensation & location">
            <Card>
              <Controller
                control={control}
                name="ctcLpa"
                render={({ field }) => (
                  <Input
                    label="Annual CTC (in LPA)"
                    value={String(field.value)}
                    onChangeText={(v) => field.onChange(v === '' ? NaN : Number(v))}
                    keyboardType="decimal-pad"
                    error={errors.ctcLpa?.message}
                    hint="12+ LPA is classified as Super Dream by the tier engine."
                  />
                )}
              />
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <Input
                    label="Location"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.location?.message}
                  />
                )}
              />
            </Card>
          </Section>
        ) : null}

        {/* STEP 3 */}
        {step === 2 ? (
          <Section title="Eligibility criteria">
            <Card>
              <Controller
                control={control}
                name="minCgpa"
                render={({ field }) => (
                  <Input
                    label="Minimum CGPA"
                    value={String(field.value)}
                    onChangeText={(v) => field.onChange(v === '' ? NaN : Number(v))}
                    keyboardType="decimal-pad"
                    error={errors.minCgpa?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="minTenthMarks"
                render={({ field }) => (
                  <Input
                    label="Minimum Class 10th %"
                    value={String(field.value)}
                    onChangeText={(v) => field.onChange(v === '' ? NaN : Number(v))}
                    keyboardType="decimal-pad"
                    error={errors.minTenthMarks?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="minTwelfthMarks"
                render={({ field }) => (
                  <Input
                    label="Minimum Class 12th / Diploma %"
                    value={String(field.value)}
                    onChangeText={(v) => field.onChange(v === '' ? NaN : Number(v))}
                    keyboardType="decimal-pad"
                    error={errors.minTwelfthMarks?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="maxActiveBacklogs"
                render={({ field }) => (
                  <Input
                    label="Maximum active backlogs"
                    value={String(field.value)}
                    onChangeText={(v) => field.onChange(v === '' ? NaN : Number(v))}
                    keyboardType="number-pad"
                    error={errors.maxActiveBacklogs?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="deadlineDays"
                render={({ field }) => (
                  <Input
                    label="Registration closes in (days)"
                    value={String(field.value)}
                    onChangeText={(v) => field.onChange(v === '' ? NaN : Number(v))}
                    keyboardType="number-pad"
                    error={errors.deadlineDays?.message}
                  />
                )}
              />

              <View style={{ gap: Spacing.two }}>
                <Txt size="sm" weight="600" tone="secondary">
                  Eligible branches ({branches.length} selected)
                </Txt>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {BRANCHES.map((b) => {
                    const active = branches.includes(b);
                    return (
                      <Pressable
                        key={b}
                        onPress={() =>
                          setBranches((prev) =>
                            prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
                          )
                        }
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          borderRadius: Radius.full,
                          borderWidth: 1,
                          borderColor: active ? t.brand : t.border,
                          backgroundColor: active ? t.brand : t.backgroundElement,
                        }}
                      >
                        <Txt size="xs" weight="600" style={{ color: active ? '#fff' : t.textSecondary }}>
                          {b}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                  <Button
                    label="Select all"
                    variant="ghost"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={() => setBranches([...BRANCHES])}
                  />
                  <Button
                    label="Clear"
                    variant="ghost"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={() => setBranches([])}
                  />
                </View>
              </View>
            </Card>
          </Section>
        ) : null}

        {/* STEP 4 */}
        {step === 3 ? (
          <Section title="Selection rounds">
            <Card>
              {rounds.map((round, index) => (
                <View
                  key={`${round}-${index}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing.two,
                    paddingVertical: 8,
                  }}
                >
                  <Badge label={`Round ${index + 1}`} tone="brand" />
                  <Txt size="sm" style={{ flex: 1 }}>
                    {round}
                  </Txt>
                  <Pressable onPress={() => setRounds((prev) => prev.filter((_, i) => i !== index))}>
                    <Txt tone="danger" size="sm" weight="700">
                      Remove
                    </Txt>
                  </Pressable>
                </View>
              ))}

              <View style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Add a round"
                    placeholder="e.g. Panel Interview"
                    value={newRound}
                    onChangeText={setNewRound}
                  />
                </View>
                <Button
                  label="Add"
                  variant="secondary"
                  onPress={() => {
                    if (newRound.trim()) {
                      setRounds((prev) => [...prev, newRound.trim()]);
                      setNewRound('');
                    }
                  }}
                />
              </View>
            </Card>
          </Section>
        ) : null}

        {/* Navigation */}
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          {step > 0 ? (
            <Button
              label="Back"
              variant="ghost"
              style={{ flex: 1 }}
              onPress={() => setStep((s) => s - 1)}
            />
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button label="Continue" style={{ flex: 1 }} onPress={next} />
          ) : (
            <Button label="Publish drive" style={{ flex: 1 }} onPress={onSubmit} />
          )}
        </View>

        <Txt size="xs" tone="muted" style={{ textAlign: 'center' }}>
          {COLLEGE.placementCell} · {COLLEGE.shortName}
        </Txt>
      </ScrollView>
    </Screen>
  );
}