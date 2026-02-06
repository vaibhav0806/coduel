import { View, Text, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase";

// Configure Google Sign-In
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
console.log("[Auth] Web Client ID:", WEB_CLIENT_ID);

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign in with Google token
  const handleGoogleToken = async (idToken: string) => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Check if user has a profile with custom username
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .maybeSingle<{ username: string }>();

        const username = profile?.username;

        if (!username || username.startsWith("user_")) {
          // New user - needs to set username
          router.replace("/onboarding");
        } else {
          // Existing user - go to home
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      console.error("Supabase sign in error:", err);
      throw err;
    }
  };

  // Trigger Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (idToken) {
          await handleGoogleToken(idToken);
        } else {
          throw new Error("No ID token received from Google");
        }
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);

      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.IN_PROGRESS:
            setError("Sign in already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services not available");
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled, don't show error
            break;
          default:
            setError(err.message || "Failed to sign in with Google");
        }
      } else {
        setError(err.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  // Apple sign in (placeholder for now)
  const handleAppleSignIn = async () => {
    Alert.alert("Coming Soon", "Apple Sign In will be available soon!");
  };

  // Guest play - anonymous sign in
  const handleGuestPlay = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInAnonymously();

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Guest sign in error:", err);
      setError(err.message || "Failed to continue as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-6 justify-center">
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-5xl mb-4">⚡</Text>
          <Text className="text-4xl font-bold text-white">CODUEL</Text>
          <Text className="text-gray-400 mt-2 text-center">
            Duel coders worldwide.{"\n"}Prove your skills.
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-lose/20 border border-lose rounded-xl p-3 mb-4">
            <Text className="text-lose text-center">{error}</Text>
          </View>
        )}

        {/* Auth Buttons */}
        <View>
          {/* Google Sign In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={loading}
            className={`bg-white rounded-xl p-4 flex-row items-center justify-center mb-3 ${
              loading ? "opacity-50" : "active:bg-gray-100"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <>
                <FontAwesome name="google" size={20} color="#4285F4" />
                <Text className="text-gray-800 font-semibold ml-3 text-lg">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Apple Sign In - Only show on iOS */}
          {Platform.OS === "ios" && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={loading}
              className={`bg-white rounded-xl p-4 flex-row items-center justify-center mb-3 ${
                loading ? "opacity-50" : "active:bg-gray-100"
              }`}
            >
              <FontAwesome name="apple" size={22} color="#000000" />
              <Text className="text-gray-800 font-semibold ml-3 text-lg">
                Continue with Apple
              </Text>
            </Pressable>
          )}

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-dark-border" />
            <Text className="text-gray-500 mx-4">or</Text>
            <View className="flex-1 h-px bg-dark-border" />
          </View>

          {/* Guest Play */}
          <Pressable
            onPress={handleGuestPlay}
            disabled={loading}
            className={`bg-dark-card border border-dark-border rounded-xl p-4 flex-row items-center justify-center ${
              loading ? "opacity-50" : "active:bg-dark-border"
            }`}
          >
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text className="text-gray-400 font-semibold ml-3 text-lg">
              Play as Guest
            </Text>
          </Pressable>
        </View>

        {/* Terms */}
        <Text className="text-gray-500 text-xs text-center mt-8 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}
