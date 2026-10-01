import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { formatDate } from '@/components/pipeline-stepper';
import { Badge, Card, Logo, Screen, Section, Txt } from '@/components/ui-kit';
import { Radius, Spacing , TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EXPERIENCES, getCompany } from '@/lib/demo-data';
import { useStore } from '@/lib/store';
import type { Difficulty } from '@/lib/types';

const DIFFICULTY_TONE: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const { experiencesUpvotes, toggleExperienceUpvote } = useStore();

  const exp = EXPERIENCES.find((e) => e.id === id);
  if (!exp) {
    return (
      <Screen>
        <Txt style={{ padding: Spacing.four }}>Experience not found.</Txt>
      </Screen>
    );
  }

  const company = getCompany(exp.companyId);
  const upvoted = Boolean(experiencesUpvotes[exp.id]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <Logo text={company.logoText} size={54} />
          <View style={{ flex: 1, gap: 3 }}>
            <Txt size="lg" weight="800">
              {company.name}
            </Txt>
            <Txt size="sm" tone="secondary">
              {exp.roleOffered}
            </Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Badge label={exp.difficulty} tone={DIFFICULTY_TONE[exp.difficulty]} />
          <Badge label={`${exp.ctcLpa} LPA`} tone="brand" />
          <Badge label={formatDate(exp.createdAt)} tone="neutral" />
        </View>

        <Card>
          <Txt size="xs" tone="muted">
            Shared by
          </Txt>
          <Txt size="md" weight="700">
            {exp.authorName}
          </Txt>
          <Txt size="xs" tone="secondary">
            {exp.authorBranch}
          </Txt>

          <Pressable
            onPress={() => toggleExperienceUpvote(exp.id)}
            style={({ pressed }) => ({
              marginTop: Spacing.three,
              backgroundColor: upvoted ? t.brandSoft : t.backgroundElement,
              borderRadius: Radius.md,
              paddingVertical: 11,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Txt size="sm" weight="700" tone={upvoted ? 'brand' : 'secondary'}>
              {upvoted ? '▲' : '△'} Helpful · {exp.upvotes + (upvoted ? 1 : 0)}
            </Txt>
          </Pressable>
        </Card>

        <Section title={`Round-by-round breakdown`}>
          <Card>
            {exp.rounds.map((round, index) => (
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
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt size="sm" weight="700">
                    {round.name}
                  </Txt>
                  <Txt size="xs" tone="secondary">
                    {round.experience}
                  </Txt>
                </View>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="Topics asked">
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {exp.topicsAsked.map((topic) => (
              <Badge key={topic} label={topic} tone="neutral" />
            ))}
          </View>
        </Section>

        <Section title="Advice for juniors">
          <Card accent={t.success}>
            <Txt size="sm" tone="secondary">
              {exp.tipsForJuniors}
            </Txt>
          </Card>
        </Section>
      </ScrollView>
    </Screen>
  );
}