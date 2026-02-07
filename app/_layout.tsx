import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingScreen } from "@/components/LoadingScreen";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme matching our brand - Neon Green
const CoduelDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#39FF14", // Neon Green
    background: "#050508",
    card: "#0A0A0F",
    text: "#FFFFFF",
    border: "#1A1A24",
    notification: "#FF6B35",
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [showLoading, setShowLoading] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log("[RootLayout] Fonts loaded, hiding splash screen");
      SplashScreen.hideAsync();
      // Show custom loading screen for 1.5 seconds
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    console.log("[RootLayout] Waiting for fonts...");
    return null;
  }

  // Show loading screen with animations
  if (showLoading) {
    return <LoadingScreen />;
  }

  console.log("[RootLayout] Rendering RootLayoutNav");

  return <RootLayoutNav />;
}

function NotificationManager() {
  const { user, profile } = useAuth();
  useNotifications({
    userId: user?.id ?? null,
    lastBattleDate: profile?.last_battle_date ?? null,
    currentStreak: profile?.current_streak ?? 0,
  });
  return null;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={CoduelDarkTheme}>
      <StatusBar style="light" />
      <AuthProvider>
        <NotificationManager />
        <AuthGuard>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#050508",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            contentStyle: {
              backgroundColor: "#050508",
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="battle/[id]"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Settings",
            }}
          />
        </Stack>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
