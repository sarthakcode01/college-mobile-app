import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { formatDateTime } from '@/components/pipeline-stepper';
import {
    Badge,
    Button,
    Card,
    Chip,
    EmptyState,
    Input,
    Screen,
    Section,
    Toast,
    Txt,
} from '@/components/ui-kit';
import { Radius, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BRANCHES } from '@/lib/demo-data';
import { sendImmediateNotification } from '@/lib/notifications';
import { useStore } from '@/lib/store';
import type { AnnouncementPriority } from '@/lib/types';

export default function BroadcastsScreen() {
  const t = useTheme();
  const { announcements, postAnnouncement, deleteAnnouncement, user } = useStore();

  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [targetBranch, setTargetBranch] = useState('All Branches');
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null);

  function handlePublish() {
    if (title.trim().length < 3 || message.trim().length < 5) {
      setToast({ message: 'Add a title and a message before publishing.', tone: 'danger' });
      return;
    }

    postAnnouncement({ title: title.trim(), message: message.trim(), priority, targetBranch });

    sendImmediateNotification(title.trim(), message.trim(), { priority, targetBranch }).catch(() => false);

    setToast({ message: 'Broadcast published to all students.', tone: 'success' });
    setTitle('');
    setMessage('');
    setPriority('normal');
    setComposing(false);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.three, paddingBottom: Spacing.six + TabBarClearance + TabBarClearance + TabBarClearance, gap: Spacing.four }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size="xl" weight="700" family="display">
              Broadcasts
            </Txt>
            <Txt size="sm" tone="secondary">
              Campus notices · {announcements.length} sent
            </Txt>
          </View>
          <Button
            label={composing ? 'Cancel' : '+ New'}
            variant={composing ? 'ghost' : 'primary'}
            onPress={() => setComposing((c) => !c)}
          />
        </View>

        {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}

        {composing ? (
          <Section title="Compose announcement">
            <Card>
              <Input
                label="Title"
                placeholder="Google OA delayed by 30 minutes"
                value={title}
                onChangeText={setTitle}
              />
              <Input
                label="Message"
                placeholder="Details about the update…"
                value={message}
                onChangeText={setMessage}
                multiline
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />

              <View style={{ gap: 6 }}>
                <Txt size="sm" weight="600" tone="secondary">
                  Priority
                </Txt>
                <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                  <Chip label="Normal" active={priority === 'normal'} onPress={() => setPriority('normal')} />
                  <Chip label="High" active={priority === 'high'} onPress={() => setPriority('high')} />
                  <Chip label="Urgent" active={priority === 'urgent'} onPress={() => setPriority('urgent')} />
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Txt size="sm" weight="600" tone="secondary">
                  Target branch
                </Txt>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {['All Branches', ...BRANCHES].map((b) => (
                    <Pressable
                      key={b}
                      onPress={() => setTargetBranch(b)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                        borderRadius: Radius.full,
                        borderWidth: 1,
                        borderColor: targetBranch === b ? t.brand : t.border,
                        backgroundColor: targetBranch === b ? t.brand : t.backgroundElement,
                      }}
                    >
                      <Txt size="xs" weight="600" style={{ color: targetBranch === b ? '#fff' : t.textSecondary }}>
                        {b}
                      </Txt>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Button label="Publish to students" onPress={handlePublish} size="lg" />
            </Card>
          </Section>
        ) : null}

        <Section title="Notice board">
          {announcements.length === 0 ? (
            <EmptyState icon="📣" title="No broadcasts yet" message="Publish your first campus notice." />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {announcements.map((a) => (
                <Card
                  key={a.id}
                  accent={
                    a.priority === 'urgent'
                      ? t.danger
                      : a.priority === 'high'
                        ? t.warning
                        : t.brand
                  }
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

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTopWidth: 1,
                      borderTopColor: t.border,
                      paddingTop: Spacing.two,
                    }}
                  >
                    <Txt size="xs" tone="muted">
                      {a.postedBy} · {formatDateTime(a.createdAt)}
                    </Txt>
                    <Pressable
                      onPress={() => deleteAnnouncement(a.id)}
                      hitSlop={8}
                      disabled={a.postedBy !== user?.fullName && a.postedBy !== 'Placement Cell'}
                    >
                      <Txt size="xs" weight="700" tone="danger">
                        Delete
                      </Txt>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}