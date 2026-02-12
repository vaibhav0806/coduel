const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        sound: "default",
        ...(data && { data }),
      }),
    });

    if (!res.ok) {
      console.error("[push] Expo API error:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("[push] Failed to send notification:", err);
    return false;
  }
}
