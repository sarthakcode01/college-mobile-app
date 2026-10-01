/**
 * Eligibility Scorecard — the visual output of the Eligibility Engine.
 * Renders every rule with the student's value against the requirement,
 * so a student immediately sees *why* they are or are not eligible.
 */

import { View } from 'react-native';

import { Badge, Card, Txt } from '@/components/ui-kit';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { EligibilityResult } from '@/lib/eligibility';

export function EligibilityScorecard({
  result,
  compact = false,
}: {
  result: EligibilityResult;
  compact?: boolean;
}) {
  const t = useTheme();

  return (
    <Card style={{ gap: Spacing.three }} elevation="high">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        <Txt size="md" weight="700">
          Eligibility Check
        </Txt>
        <View style={{ flex: 1 }} />
        <Badge
          label={result.isEligible ? `Eligible · ${result.passedCount}/${result.totalRules}` : `Ineligible · ${result.passedCount}/${result.totalRules}`}
          tone={result.isEligible ? 'success' : 'danger'}
          icon={result.isEligible ? '✓' : '✕'}
        />
      </View>

      <View style={{ gap: 1, backgroundColor: t.border, borderRadius: 10, overflow: 'hidden' }}>
        {result.reasons.map((r) => (
          <View
            key={r.rule}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.two,
              backgroundColor: t.backgroundElevated,
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          >
            <Txt size="md" tone={r.passed ? 'success' : 'danger'} weight="700">
              {r.passed ? '✓' : '✕'}
            </Txt>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt size="sm" weight="600">
                {r.label}
              </Txt>
              {!compact ? (
                <Txt size="xs" tone="secondary">
                  Your value:{' '}
                  <Txt size="xs" tone={r.passed ? 'success' : 'danger'} weight="600">
                    {r.studentValue}
                  </Txt>
                  {'  ·  Required: '}
                  {r.requiredValue}
                </Txt>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {result.warnings.length > 0 ? (
        <View style={{ gap: Spacing.one }}>
          {result.warnings.map((w, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                gap: Spacing.two,
                backgroundColor: t.warningSoft,
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Txt size="sm" tone="warning">
                ⚠
              </Txt>
              <Txt size="xs" tone="secondary" style={{ flex: 1 }}>
                {w}
              </Txt>
            </View>
          ))}
        </View>
      ) : null}

      {!result.isEligible ? (
        <View style={{ backgroundColor: t.dangerSoft, padding: 10, borderRadius: 10 }}>
          <Txt size="xs" tone="danger" weight="600">
            You are missing {result.failures.length} requirement{result.failures.length === 1 ? '' : 's'}:{' '}
            {result.failures.join(', ')}.
          </Txt>
        </View>
      ) : null}
    </Card>
  );
}

/** Tiny inline badge used on drive cards in the list. */
export function EligibilityPill({ result }: { result: EligibilityResult }) {
  if (result.isEligible) {
    return <Badge label="Eligible" tone="success" icon="✓" />;
  }
  return <Badge label={`${result.failures.length} issue${result.failures.length === 1 ? '' : 's'}`} tone="danger" icon="✕" />;
}