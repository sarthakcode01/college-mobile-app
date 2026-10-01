/**
 * Application Pipeline Stepper (ATS)
 * Visual progress tracker: Applied → OA → Tech → HR → Selected.
 * Each node reflects completed / current / pending / rejected state.
 */

import { View } from 'react-native';

import { Badge, Txt } from '@/components/ui-kit';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { APPLICATION_STAGES, type Application, type ApplicationStage } from '@/lib/types';

const STAGE_LABELS: Record<ApplicationStage, string> = {
  Applied: 'Applied',
  OA: 'Online Assessment',
  Tech_1: 'Technical Round 1',
  Tech_2: 'Technical Round 2',
  HR: 'HR Interview',
  Selected: 'Offer',
};

export const STAGE_DISPLAY = STAGE_LABELS;

export function PipelineStepper({
  application,
  orientation = 'vertical',
}: {
  application: Application;
  orientation?: 'vertical' | 'horizontal';
}) {
  const t = useTheme();
  const stages = APPLICATION_STAGES;
  const currentIndex = stages.indexOf(application.currentStage);
  const isRejected = application.status === 'rejected';
  const isOffered = application.status === 'offered';

  return (
    <View
      style={
        orientation === 'vertical'
          ? { gap: 0 }
          : { flexDirection: 'row', alignItems: 'flex-start' }
      }
    >
      {stages.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        const circleBg = isOffered
          ? t.success
          : isCurrent
            ? isRejected
              ? t.danger
              : t.brand
            : isDone
              ? t.success
              : t.backgroundElement;

        const circleFg = isDone || isCurrent ? '#fff' : t.textMuted;

        const label = STAGE_LABELS[stage];
        const detail = application.schedule.find((s) => s.stage === stage);

        const node = (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: Radius.full,
              backgroundColor: circleBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: isCurrent ? 3 : 0,
              borderColor: isRejected ? t.danger : t.brand,
            }}
          >
            <Txt size="xs" weight="700" style={{ color: circleFg }}>
              {isDone || isOffered ? '✓' : index + 1}
            </Txt>
          </View>
        );

        if (orientation === 'horizontal') {
          return (
            <View key={stage} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                {index > 0 ? (
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: isDone || isCurrent ? t.success : t.border,
                    }}
                  />
                ) : null}
                {node}
                {index < stages.length - 1 ? (
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: index < currentIndex ? t.success : t.border,
                    }}
                  />
                ) : null}
              </View>
              <Txt size="xs" weight={isCurrent ? '700' : '500'} tone={isCurrent ? 'brand' : 'muted'} numberOfLines={2} style={{ textAlign: 'center' }}>
                {label}
              </Txt>
            </View>
          );
        }

        return (
          <View key={stage} style={{ flexDirection: 'row', gap: Spacing.three }}>
            <View style={{ alignItems: 'center', width: 28 }}>
              {node}
              {index < stages.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: index < currentIndex ? t.success : t.border,
                    marginVertical: 2,
                    minHeight: 28,
                  }}
                />
              ) : null}
            </View>

            <View style={{ flex: 1, paddingBottom: index < stages.length - 1 ? Spacing.three : 0, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                <Txt size="md" weight={isCurrent ? '700' : '600'} tone={isCurrent ? 'brand' : isPending ? 'muted' : 'default'}>
                  {label}
                </Txt>
                {isCurrent ? (
                  <Badge
                    label={isRejected ? 'Not Selected' : isOffered ? 'Offer Received' : 'In Progress'}
                    tone={isRejected ? 'danger' : isOffered ? 'success' : 'brand'}
                  />
                ) : null}
                {isDone && !isRejected ? <Badge label="Cleared" tone="success" /> : null}
              </View>

              {detail?.date ? (
                <Txt size="xs" tone="secondary">
                  {formatDateTime(detail.date)}
                </Txt>
              ) : isPending ? (
                <Txt size="xs" tone="muted">
                  Pending
                </Txt>
              ) : null}

              {detail?.venue ? (
                <Txt size="xs" tone="secondary">
                  📍 {detail.venue}
                  {detail.reportingTime ? `  ·  Report by ${detail.reportingTime}` : ''}
                </Txt>
              ) : null}

              {detail?.link ? (
                <Txt size="xs" tone="brand" weight="600">
                  🔗 Test link available
                </Txt>
              ) : null}

              {detail?.feedback ? (
                <Txt size="xs" tone="secondary">
                  {detail.feedback}
                </Txt>
              ) : null}

              {isRejected && application.rejectionReason && isCurrent ? (
                <View style={{ backgroundColor: t.dangerSoft, padding: 8, borderRadius: Radius.sm }}>
                  <Txt size="xs" tone="danger">
                    {application.rejectionReason}
                  </Txt>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}