import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
    Badge,
    Card,
    Chip,
    EmptyState,
    Input,
    Logo,
    Screen,
    Section,
    Txt,
} from '@/components/ui-kit';
import { Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EXPERIENCES, getCompany } from '@/lib/demo-data';
import { useStore } from '@/lib/store';
import type { Difficulty } from '@/lib/types';

const DIFFICULTY_TONE: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

export default function PrepHubScreen() {
  const router = useRouter();
  const t = useTheme();
  const { announcements } = useStore();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');

  const filtered = useMemo(() => {
    return EXPERIENCES.filter((exp) => {
      const company = getCompany(exp.companyId);
      if (difficulty !== 'all' && exp.difficulty !== difficulty) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = `${company.name} ${exp.roleOffered} ${exp.authorName} ${exp.authorBranch} ${exp.topicsAsked.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.upvotes - a.upvotes);
  }, [query, difficulty]);

  return (
    <Screen>
      <View style={{ padding: Spacing.three, paddingBottom: 0, gap: Spacing.three }}>
        <View style={{ gap: 2 }}>
          <Txt size="xl" weight="700" family="display">
            Prep Hub
          </Txt>
          <Txt size="sm" tone="secondary">
            Interview experiences shared by seniors
          </Txt>
        </View>

        <Input
          placeholder="Search company, topic or senior…"
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.two, paddingRight: Spacing.three }}
        >
          <Chip label="All" active={difficulty === 'all'} onPress={() => setDifficulty('all')} count={EXPERIENCES.length} />
          <Chip label="Easy" active={difficulty === 'Easy'} onPress={() => setDifficulty('Easy')} count={EXPERIENCES.filter((e) => e.difficulty === 'Easy').length} />
          <Chip label="Medium" active={difficulty === 'Medium'} onPress={() => setDifficulty('Medium')} count={EXPERIENCES.filter((e) => e.difficulty === 'Medium').length} />
          <Chip label="Hard" active={difficulty === 'Hard'} onPress={() => setDifficulty('Hard')} count={EXPERIENCES.filter((e) => e.difficulty === 'Hard').length} />
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.three }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Notice board">
          <View style={{ gap: Spacing.two }}>
            {announcements.slice(0, 3).map((a) => (
              <Card
                key={a.id}
                accent={a.priority === 'urgent' ? '#EF4444' : a.priority === 'high' ? '#F59E0B' : '#4F46E5'}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                  <Badge
                    label={a.priority.toUpperCase()}
                    tone={a.priority === 'urgent' ? 'danger' : a.priority === 'high' ? 'warning' : 'neutral'}
                  />
                  <View style={{ flex: 1 }} />
                  <Txt size="xs" tone="muted">
                    {a.targetBranch}
                  </Txt>
                </View>
                <Txt size="md" weight="700">
                  {a.title}
                </Txt>
                <Txt size="xs" tone="secondary">
                  {a.message}
                </Txt>
              </Card>
            ))}
          </View>
        </Section>

        <Section title={`${filtered.length} experiences`}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="💡"
              title="No experiences found"
              message="Try a different search term or difficulty filter."
            />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {filtered.map((exp) => {
                const company = getCompany(exp.companyId);
                return (
                  <Card key={exp.id} onPress={() => router.push({ pathname: '/(student)/prep/[id]', params: { id: exp.id } })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
                      <Logo text={company.logoText} size={40} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt size="md" weight="700">
                          {company.name}
                        </Txt>
                        <Txt size="xs" tone="secondary" numberOfLines={1}>
                          {exp.roleOffered} · {exp.ctcLpa} LPA
                        </Txt>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      <Badge label={exp.difficulty} tone={DIFFICULTY_TONE[exp.difficulty]} />
                      <Badge label={`${exp.rounds.length} rounds`} tone="neutral" />
                      <Badge label={`▲ ${exp.upvotes}`} tone="neutral" />
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: t.border, paddingTop: Spacing.two }}>
                      <Txt size="xs" tone="secondary" numberOfLines={2}>
                        <Txt size="xs" tone="muted">
                          {exp.authorName} · {exp.authorBranch}
                        </Txt>
                        {'\n'}
                        {exp.tipsForJuniors}
                      </Txt>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}