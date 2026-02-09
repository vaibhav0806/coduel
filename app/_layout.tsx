import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { Teko_700Bold } from "@expo-google-fonts/teko";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { useNotifications } from "@/hooks/useNotifications";

export {
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme matching our brand - Neon Green
const GitGudDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#39FF14",
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
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Teko_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

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
    <ThemeProvider value={GitGudDarkTheme}>
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
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: false,
                gestureEnabled: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="match/[id]"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="user/[id]"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
                title: "Settings",
                headerStyle: { backgroundColor: "#0A0A0F" },
                headerTintColor: "#FFFFFF",
                headerTitleStyle: {
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 17,
                },
              }}
            />
          </Stack>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
