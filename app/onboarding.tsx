import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function OnboardingScreen() {
  const { refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Validate username format
  const validateUsername = (name: string): string | null => {
    if (name.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (name.length > 20) {
      return "Username must be less than 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return "Only letters, numbers, and underscores allowed";
    }
    if (/^[0-9]/.test(name)) {
      return "Username cannot start with a number";
    }
    return null;
  };

  // Check if username is available
  const checkAvailability = async (name: string) => {
    if (name.length < 3) {
      setIsAvailable(null);
      return;
    }

    const validationError = validateUsername(name);
    if (validationError) {
      setIsAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", name.toLowerCase())
        .maybeSingle();

      if (error) throw error;
      setIsAvailable(data === null);
    } catch (err) {
      console.error("Check availability error:", err);
      setIsAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  // Handle username input change
  const handleUsernameChange = (text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
    setError(null);

    // Debounce the availability check
    if (cleaned.length >= 3) {
      const timer = setTimeout(() => checkAvailability(cleaned), 500);
      return () => clearTimeout(timer);
    } else {
      setIsAvailable(null);
    }
  };

  // Save username and continue
  const handleContinue = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isAvailable) {
      setError("This username is taken");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Use upsert to create profile if it doesn't exist
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: username.toLowerCase(),
        }, {
          onConflict: "id",
        });

      if (upsertError) {
        console.error("Upsert error:", upsertError);
        if (upsertError.code === "23505") {
          throw new Error("This username is already taken");
        }
        throw upsertError;
      }

      // Refresh the profile in auth state before navigating
      await refreshProfile();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Save username error:", err);
      setError(err.message || "Failed to save username");
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = () => {
    if (error) return "border-lose";
    if (isAvailable === true) return "border-win";
    if (isAvailable === false) return "border-lose";
    return "border-dark-border";
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl mb-2">👤</Text>
            <Text className="text-2xl font-bold text-white">Choose your username</Text>
            <Text className="text-gray-400 mt-2 text-center">
              This is how other players will see you
            </Text>
          </View>

          {/* Username Input */}
          <View className="mb-6">
            <View
              className={`bg-dark-card rounded-xl p-4 border ${getInputBorderColor()}`}
            >
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-lg mr-1">@</Text>
                <TextInput
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="username"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  maxLength={20}
                  className="flex-1 text-white text-lg"
                />
                {checking && (
                  <ActivityIndicator size="small" color="#6B7280" />
                )}
                {!checking && isAvailable === true && (
                  <Text className="text-win text-lg">✓</Text>
                )}
                {!checking && isAvailable === false && (
                  <Text className="text-lose text-lg">✗</Text>
                )}
              </View>
            </View>

            {/* Availability Status */}
            <View className="mt-2 h-5">
              {error && <Text className="text-lose text-sm">{error}</Text>}
              {!error && isAvailable === true && (
                <Text className="text-win text-sm">Username is available!</Text>
              )}
              {!error && isAvailable === false && (
                <Text className="text-lose text-sm">Username is taken</Text>
              )}
            </View>
          </View>

          {/* Guidelines */}
          <View className="bg-dark-card rounded-xl p-4 border border-dark-border mb-6">
            <Text className="text-gray-400 text-sm mb-2">Username rules:</Text>
            <Text className="text-gray-500 text-sm">• 3-20 characters</Text>
            <Text className="text-gray-500 text-sm">
              • Letters, numbers, and underscores only
            </Text>
            <Text className="text-gray-500 text-sm">• Cannot start with a number</Text>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            disabled={loading || !isAvailable || username.length < 3}
            className={`rounded-xl p-4 ${
              isAvailable && username.length >= 3
                ? "bg-primary active:bg-primary-dark"
                : "bg-dark-card"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-center font-bold text-lg ${
                  isAvailable && username.length >= 3
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
