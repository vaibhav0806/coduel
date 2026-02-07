import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/AnimatedLogo";
import { Text } from "@/components/ui/Text";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady) return;
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    // Not authenticated - redirect to auth
    if (!user) {
      if (!inAuthGroup) {
        router.replace("/auth");
      }
      return;
    }

    // User is authenticated
    // Check if needs onboarding (no profile OR username starts with user_)
    const needsOnboarding = !profile || !profile.username || profile.username.startsWith("user_");

    if (needsOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (!needsOnboarding && (inAuthGroup || inOnboarding)) {
      // Has valid profile, go to tabs immediately
      router.replace("/(tabs)");
    }
  }, [user, profile, loading, segments, isNavigationReady]);

  // Show loading screen while checking auth
  if (loading || !isNavigationReady) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Logo size="medium" />
        <ActivityIndicator size="small" color="#39FF14" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return <>{children}</>;
}
