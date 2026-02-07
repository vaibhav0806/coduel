import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getLocalDateString } from "@/lib/streak";

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
      lightColor: "#6366F1",
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
