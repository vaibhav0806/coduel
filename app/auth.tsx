import { View, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase";
import { AnimatedLogo, Logo } from "@/components/AnimatedLogo";
import { Text, TextBold, TextSemibold } from "@/components/ui/Text";

// Configure Google Sign-In
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Animation values
  const logoTranslateY = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const handleAnimationComplete = () => {
    // Move logo up
    logoTranslateY.value = withTiming(-80, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    // Fade in content
    contentOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 500 })
    );
    setAnimationComplete(true);
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Sign in with Google token
  const handleGoogleToken = async (idToken: string) => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Check if user has a profile with custom username
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .maybeSingle<{ username: string }>();

        const username = profile?.username;

        if (!username || username.startsWith("user_")) {
          router.replace("/onboarding");
        } else {
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

  // Apple sign in (placeholder)
  const handleAppleSignIn = async () => {
    Alert.alert("Coming Soon", "Apple Sign In will be available soon!");
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-6 items-center justify-center">
        {/* Animated Logo */}
        <Animated.View style={logoAnimatedStyle} className="items-center">
          <AnimatedLogo
            size="large"
            animate={true}
            onAnimationComplete={handleAnimationComplete}
          />

          {/* Tagline - appears after logo */}
          {animationComplete && (
            <Animated.View entering={FadeIn.delay(100).duration(400)}>
              <Text className="text-gray-500 text-sm mt-3">
                Code. Battle. Win.
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Auth Content - appears after animation */}
        <Animated.View
          style={contentAnimatedStyle}
          className="w-full mt-12"
          pointerEvents={animationComplete ? "auto" : "none"}
        >
          {/* Error Message */}
          {error && (
            <View className="bg-lose/20 border border-lose rounded-xl p-3 mb-4">
              <Text className="text-lose text-center">{error}</Text>
            </View>
          )}

          {/* Google Sign In Button - Black background */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={loading || !animationComplete}
            className={`bg-dark-card border border-dark-border rounded-xl p-4 flex-row items-center justify-center mb-3 ${
              loading ? "opacity-50" : "active:bg-dark-elevated"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#39FF14" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                <TextSemibold className="text-white ml-3 text-base">
                  Continue with Google
                </TextSemibold>
              </>
            )}
          </Pressable>

          {/* Apple Sign In - Only show on iOS */}
          {Platform.OS === "ios" && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={loading || !animationComplete}
              className={`bg-dark-card border border-dark-border rounded-xl p-4 flex-row items-center justify-center ${
                loading ? "opacity-50" : "active:bg-dark-elevated"
              }`}
            >
              <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
              <TextSemibold className="text-white ml-3 text-base">
                Continue with Apple
              </TextSemibold>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
