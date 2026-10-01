/**
 * Local notification helpers.
 * expo-notifications requires a development build (it does not work in Expo Go),
 * so every call is wrapped defensively — the app must never crash on a device
 * where notifications are unavailable.
 */

import { Platform } from 'react-native';

type Reminder = {
  id: string;
  title: string;
  body: string;
  trigger: { date: number } | number;
};

let cached: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (cached) return cached;
  try {
    const mod = await import('expo-notifications');
    cached = mod;
    return mod;
  } catch {
    return null;
  }
}

let configured = false;

async function ensureConfigured() {
  if (configured) return true;
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  try {
    if (Platform.OS === 'android') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    configured = true;
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  return ensureConfigured();
}

/** Schedules a reminder a day before a drive's registration deadline. */
export async function scheduleDeadlineReminder(
  driveId: string,
  companyId: string,
  deadlineIso: string,
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  if (!(await ensureConfigured())) return;

  const deadline = new Date(deadlineIso).getTime();
  const remindAt = deadline - 24 * 60 * 60 * 1000;
  if (remindAt <= Date.now()) return;

  try {
    const triggerType = Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Registration closing tomorrow',
        body: 'A placement drive you are eligible for closes in 24 hours. Apply now.',
        data: { driveId, companyId },
      },
      trigger: { type: triggerType, date: remindAt, channelId: 'default' },
    });
  } catch {
    // Notifications are a progressive enhancement — ignore scheduling failures.
  }
}

/** Schedules a reminder shortly before an interview slot. */
export async function scheduleInterviewReminder(
  applicationId: string,
  driveId: string,
  companyName: string,
  stageLabel: string,
  whenIso: string,
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  if (!(await ensureConfigured())) return;

  const when = new Date(whenIso).getTime();
  const remindAt = when - 2 * 60 * 60 * 1000;
  if (remindAt <= Date.now()) return;

  try {
    const triggerType = Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${companyName} ${stageLabel} soon`,
        body: `Your interview starts in about 2 hours. Check the venue and reporting time in CampusHire.`,
        data: { applicationId, driveId },
      },
      trigger: { type: triggerType, date: remindAt, channelId: 'default' },
    });
  } catch {
    // ignore
  }
}

/** Fires an immediate notification — used when the TPO publishes an announcement. */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  if (!(await ensureConfigured())) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  } catch {
    // ignore
  }
}

export async function cancelAll(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}