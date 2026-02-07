import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const hasRedirected = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log("[AuthGuard] State:", {
      loading,
      user: !!user,
      profile: !!profile,
      profileUsername: profile?.username,
      isNavigationReady,
      segments,
      hasRedirected: hasRedirected.current
    });
  }, [loading, user, profile, isNavigationReady, segments]);

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
        console.log("[AuthGuard] No user, redirecting to auth");
        router.replace("/auth");
      }
      return;
    }

    // User is authenticated
    // Check if needs onboarding (no profile OR username starts with user_)
    const needsOnboarding = !profile || !profile.username || profile.username.startsWith("user_");

    if (needsOnboarding && !inOnboarding) {
      console.log("[AuthGuard] Needs onboarding, redirecting");
      router.replace("/onboarding");
    } else if (!needsOnboarding && (inAuthGroup || inOnboarding)) {
      console.log("[AuthGuard] Has valid profile, redirecting to tabs");
      router.replace("/(tabs)");
    }
  }, [user, profile, loading, segments, isNavigationReady]);

  // Show loading screen while checking auth
  if (loading || !isNavigationReady) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Text className="text-4xl mb-4">⚡</Text>
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  return <>{children}</>;
}
