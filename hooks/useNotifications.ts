import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import {
  registerForPushNotifications,
  scheduleStreakReminder,
  cancelStreakReminder,
  scheduleInactivityReminder,
  scheduleLeagueReminder,
} from "@/lib/notifications";

interface UseNotificationsParams {
  userId: string | null;
  lastBattleDate: string | null;
  currentStreak: number;
}

export function useNotifications({
  userId,
  lastBattleDate,
  currentStreak,
}: UseNotificationsParams) {
  const tokenRegistered = useRef(false);

  // Effect 1: Register push token once per session
  useEffect(() => {
    if (!userId || tokenRegistered.current) return;

    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        tokenRegistered.current = true;
        const { error } = await supabase
          .from("profiles")
          .update({ push_token: token })
          .eq("id", userId);
        if (error) {
          console.warn("[useNotifications] Failed to save push token:", error);
        } else {
          console.log("[useNotifications] Push token saved to profile");
        }
      }
    })();
  }, [userId]);

  // Effect 2: Schedule/cancel reminders reactively
  useEffect(() => {
    if (!userId) return;

    if (currentStreak > 0) {
      scheduleStreakReminder(lastBattleDate);
    } else {
      cancelStreakReminder();
    }

    scheduleInactivityReminder(lastBattleDate);
    scheduleLeagueReminder();
  }, [userId, lastBattleDate, currentStreak]);

  // Effect 3: Handle notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (
          data?.type === "streak_reminder" ||
          data?.type === "inactivity_reminder" ||
          data?.type === "league_reminder"
        ) {
          router.navigate("/(tabs)");
        } else if (
          data?.type === "support_reply" ||
          data?.type === "support_resolved"
        ) {
          router.navigate("/support");
        } else if (data?.type === "follow" && data?.follower_id) {
          router.navigate({ pathname: "/user/[id]", params: { id: data.follower_id } });
        }
      }
    );

    return () => subscription.remove();
  }, []);
}
