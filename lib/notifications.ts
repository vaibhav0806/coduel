import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocalDateString, daysBetween } from "@/lib/streak";

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STREAK_REMINDER_ID = "streak-reminder";
const INACTIVITY_REMINDER_ID = "inactivity-reminder";
const LEAGUE_REMINDER_ID = "league-reminder";

// In-memory cache for notification setting
let _notifEnabled: boolean | null = null;

async function isNotificationsEnabled(): Promise<boolean> {
  if (_notifEnabled !== null) return _notifEnabled;
  const val = await AsyncStorage.getItem("setting_notifications");
  _notifEnabled = val !== "false"; // default true
  return _notifEnabled;
}

export function setNotificationsEnabled(enabled: boolean) {
  _notifEnabled = enabled;
}

export async function registerForPushNotifications(): Promise<string | null> {
  // Push tokens only work on physical devices
  if (!Device.isDevice) {
    console.log("[Notifications] Not a physical device, skipping token registration");
    return null;
  }

  // Check existing permission
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  // Request if not already granted
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission not granted");
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#39FF14",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  console.log("[Notifications] Push token:", token.data);
  return token.data;
}

export async function scheduleStreakReminder(
  lastBattleDate: string | null
): Promise<void> {
  // Cancel any existing streak reminder first
  await cancelStreakReminder();

  if (!(await isNotificationsEnabled())) return;

  const today = getLocalDateString();

  // If user already played today, no reminder needed
  if (lastBattleDate === today) {
    console.log("[Notifications] Played today, no reminder needed");
    return;
  }

  // Calculate 10 PM today
  const now = new Date();
  const tenPM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    22, // 10 PM
    0,
    0
  );

  // If it's already past 10 PM, don't schedule (too late)
  if (now >= tenPM) {
    console.log("[Notifications] Past 10 PM, too late to schedule");
    return;
  }

  const secondsUntilTenPM = Math.floor(
    (tenPM.getTime() - now.getTime()) / 1000
  );

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_REMINDER_ID,
    content: {
      title: "Your streak is about to expire! \uD83D\uDD25",
      body: "Play a quick battle to keep your streak alive!",
      data: { type: "streak_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilTenPM,
    },
  });

  console.log(
    `[Notifications] Streak reminder scheduled in ${secondsUntilTenPM}s (10 PM)`
  );
}

export async function cancelStreakReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID);
}

// --- Inactivity Comeback Reminder ---

export async function scheduleInactivityReminder(
  lastBattleDate: string | null
): Promise<void> {
  await cancelInactivityReminder();

  if (!(await isNotificationsEnabled())) return;

  const today = getLocalDateString();
  let seconds: number;

  if (lastBattleDate === today) {
    // Played today — remind in 48h
    seconds = 48 * 60 * 60;
  } else if (lastBattleDate) {
    const gap = daysBetween(lastBattleDate, today);
    if (gap === 1) {
      // Played yesterday — remind in 24h
      seconds = 24 * 60 * 60;
    } else {
      // 2+ days ago — remind in 2h
      seconds = 2 * 60 * 60;
    }
  } else {
    // Never played — remind in 2h
    seconds = 2 * 60 * 60;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: INACTIVITY_REMINDER_ID,
    content: {
      title: "We miss you!",
      body: "Your coding skills are getting rusty. Jump into a quick battle!",
      data: { type: "inactivity_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });

  console.log(
    `[Notifications] Inactivity reminder scheduled in ${seconds}s`
  );
}

export async function cancelInactivityReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(INACTIVITY_REMINDER_ID);
}

// --- Weekly League Reminder ---

export async function scheduleLeagueReminder(): Promise<void> {
  await cancelLeagueReminder();

  if (!(await isNotificationsEnabled())) return;

  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat

  // Sunday — too late, skip
  if (day === 0) {
    console.log("[Notifications] Sunday, skipping league reminder");
    return;
  }

  let title: string;
  let body: string;
  let trigger: Date;

  if (day === 6) {
    // Saturday
    const sixPM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      18,
      0,
      0
    );

    if (now < sixPM) {
      // Before 6 PM Saturday — schedule for 6 PM today
      trigger = sixPM;
      title = "League ends tomorrow!";
      body = "Check your position and play to climb higher!";
    } else {
      // Past 6 PM Saturday — schedule for Sunday 10 AM
      const sundayMorning = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        10,
        0,
        0
      );
      trigger = sundayMorning;
      title = "League ends tonight!";
      body = "Last chance to climb — play now!";
    }
  } else {
    // Mon-Fri — schedule for next Saturday 6 PM
    const daysUntilSat = 6 - day;
    trigger = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilSat,
      18,
      0,
      0
    );
    title = "League ends tomorrow!";
    body = "Check your position and play to climb higher!";
  }

  const seconds = Math.max(
    1,
    Math.floor((trigger.getTime() - now.getTime()) / 1000)
  );

  await Notifications.scheduleNotificationAsync({
    identifier: LEAGUE_REMINDER_ID,
    content: {
      title,
      body,
      data: { type: "league_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });

  console.log(
    `[Notifications] League reminder scheduled in ${seconds}s (${trigger.toLocaleString()})`
  );
}

export async function cancelLeagueReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(LEAGUE_REMINDER_ID);
}

// --- Cancel All Reminders ---

export async function cancelAllReminders(): Promise<void> {
  await Promise.all([
    cancelStreakReminder(),
    cancelInactivityReminder(),
    cancelLeagueReminder(),
  ]);
  console.log("[Notifications] All reminders cancelled");
}
