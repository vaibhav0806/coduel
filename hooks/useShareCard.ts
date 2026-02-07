import { useRef, useState, useCallback } from "react";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export function useShareCard() {
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async () => {
    if (!viewShotRef.current?.capture) return;

    setIsSharing(true);
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share your battle result",
      });
    } catch (err) {
      console.warn("[ShareCard] Share failed:", err);
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { viewShotRef, isSharing, share };
}
