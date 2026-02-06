import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme matching our brand
const CoduelDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#6366F1", // Indigo
    background: "#0F0F1A",
    card: "#1A1A2E",
    text: "#FFFFFF",
    border: "#2D2D44",
    notification: "#F59E0B",
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log("[RootLayout] Fonts loaded, hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    console.log("[RootLayout] Waiting for fonts...");
    return null;
  }

  console.log("[RootLayout] Rendering RootLayoutNav");

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={CoduelDarkTheme}>
      <StatusBar style="light" />
      <AuthProvider>
        <AuthGuard>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#0F0F1A",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            contentStyle: {
              backgroundColor: "#0F0F1A",
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
