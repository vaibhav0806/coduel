import { useState, useEffect } from "react";
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import Animated, {
  SlideInDown,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LANGUAGES } from "@/components/LanguageSelector";

// --- Countries list ---
const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "CN", flag: "🇨🇳", name: "China" },
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "TR", flag: "🇹🇷", name: "Turkey" },
];

// --- SettingsRow component ---
function SettingsRow({
  icon,
  iconColor = "#6B7280",
  label,
  value,
  onPress,
  rightElement,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      className="flex-row items-center py-3.5 px-4"
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: destructive
            ? "rgba(239,68,68,0.12)"
            : "rgba(255,255,255,0.05)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={icon}
          size={17}
          color={destructive ? "#EF4444" : iconColor}
        />
      </View>
      <TextMedium
        style={{
          fontSize: 15,
          color: destructive ? "#EF4444" : "#FFFFFF",
          marginLeft: 12,
          flex: 1,
        }}
      >
        {label}
      </TextMedium>
      {rightElement}
      {!rightElement && value !== undefined && (
        <Text style={{ fontSize: 14, color: "#6B7280", marginRight: 4 }}>
          {value}
        </Text>
      )}
      {!rightElement && onPress && (
        <Ionicons name="chevron-forward" size={16} color="#4B5563" />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <TextSemibold
      style={{
        fontSize: 11,
        color: "#6B7280",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginLeft: 16,
        marginTop: 24,
        marginBottom: 8,
      }}
    >
      {title}
    </TextSemibold>
  );
}

export default function SettingsScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();

  // Profile fields
  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(
    profile?.display_name ?? ""
  );
  const [country, setCountry] = useState<string | null>(
    profile?.country ?? null
  );
  const [preferredLanguage, setPreferredLanguage] = useState<string | null>(
    profile?.preferred_language ?? null
  );

  // UI state
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid" | "saved"
  >("idle");
  const [displayNameSaved, setDisplayNameSaved] = useState(false);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Load device-local preferences
  useEffect(() => {
    (async () => {
      const sound = await AsyncStorage.getItem("setting_sound");
      const haptic = await AsyncStorage.getItem("setting_haptic");
      if (sound !== null) setSoundEnabled(sound === "true");
      if (haptic !== null) setHapticEnabled(haptic === "true");
    })();
  }, []);

  // Sync profile fields when profile loads/changes
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile?.display_name ?? "");
      setCountry(profile?.country ?? null);
      setPreferredLanguage(profile?.preferred_language ?? null);
    }
  }, [profile]);

  // --- Username validation (reusing rules from onboarding) ---
  const validateUsername = (name: string): string | null => {
    if (name.length < 3) return "Must be at least 3 characters";
    if (name.length > 20) return "Must be less than 20 characters";
    if (!/^[a-z0-9_]+$/.test(name)) return "Only lowercase letters, numbers, underscores";
    if (/^[0-9]/.test(name)) return "Cannot start with a number";
    return null;
  };

  const handleUsernameBlur = async () => {
    const cleaned = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);

    // No change
    if (cleaned === profile?.username) {
      setUsernameStatus("idle");
      return;
    }

    const error = validateUsername(cleaned);
    if (error) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    // Check availability
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", cleaned)
      .maybeSingle();

    if (data) {
      setUsernameStatus("taken");
      return;
    }

    // Save
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ username: cleaned })
      .eq("id", user!.id);

    if (updateErr) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("saved");
    refreshProfile();
    setTimeout(() => setUsernameStatus("idle"), 2000);
  };

  // --- Display name ---
  const handleDisplayNameBlur = async () => {
    const trimmed = displayName.trim();
    if (trimmed === (profile?.display_name ?? "")) return;

    await supabase
      .from("profiles")
      .update({ display_name: trimmed || null })
      .eq("id", user!.id);

    setDisplayNameSaved(true);
    refreshProfile();
    setTimeout(() => setDisplayNameSaved(false), 2000);
  };

  // --- Country ---
  const handleCountrySelect = async (code: string) => {
    setCountry(code);
    setCountryPickerVisible(false);
    await supabase
      .from("profiles")
      .update({ country: code })
      .eq("id", user!.id);
    refreshProfile();
  };

  // --- Preferred language ---
  const handleLanguageSelect = async (langId: string | null) => {
    setPreferredLanguage(langId);
    setLanguagePickerVisible(false);
    await supabase
      .from("profiles")
      .update({ preferred_language: langId })
      .eq("id", user!.id);
    refreshProfile();
  };

  // --- Device preferences ---
  const toggleSound = async (val: boolean) => {
    setSoundEnabled(val);
    await AsyncStorage.setItem("setting_sound", String(val));
  };

  const toggleHaptic = async (val: boolean) => {
    setHapticEnabled(val);
    await AsyncStorage.setItem("setting_haptic", String(val));
  };

  // --- Sign out ---
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth");
        },
      },
    ]);
  };

  // --- Delete account ---
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              "All your matches, ratings, and progress will be lost forever.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      const session = await supabase.auth.getSession();
                      const token =
                        session.data.session?.access_token;
                      if (!token) throw new Error("Not authenticated");

                      const res = await supabase.functions.invoke(
                        "delete-account",
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      if (res.error) throw res.error;

                      await signOut();
                      router.replace("/auth");
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err.message ?? "Failed to delete account"
                      );
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const selectedLang =
    LANGUAGES.find((l) => l.id === preferredLanguage) ?? LANGUAGES[0];

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      className="flex-1 bg-dark"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* PROFILE section */}
      <SectionHeader title="Profile" />
      <View className="mx-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {/* Username */}
        <View className="flex-row items-center py-3.5 px-4 border-b border-dark-border">
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="at" size={17} color="#39FF14" />
          </View>
          <TextMedium
            style={{ fontSize: 15, color: "#FFFFFF", marginLeft: 12, width: 80 }}
          >
            Username
          </TextMedium>
          <TextInput
            value={username}
            onChangeText={(t) =>
              setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            onBlur={handleUsernameBlur}
            placeholder="username"
            placeholderTextColor="#4B5563"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            style={{
              flex: 1,
              color: "#FFFFFF",
              fontSize: 15,
              fontFamily: "Outfit_400Regular",
              textAlign: "right",
              paddingVertical: 0,
            }}
          />
          <View style={{ width: 24, alignItems: "center", marginLeft: 4 }}>
            {usernameStatus === "checking" && (
              <ActivityIndicator size="small" color="#6B7280" />
            )}
            {usernameStatus === "saved" && (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            )}
            {usernameStatus === "available" && (
              <Ionicons name="checkmark" size={18} color="#10B981" />
            )}
            {(usernameStatus === "taken" || usernameStatus === "invalid") && (
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            )}
          </View>
        </View>

        {/* Display name */}
        <View className="flex-row items-center py-3.5 px-4 border-b border-dark-border">
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={17} color="#6B7280" />
          </View>
          <TextMedium
            style={{ fontSize: 15, color: "#FFFFFF", marginLeft: 12, width: 80 }}
          >
            Display
          </TextMedium>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={handleDisplayNameBlur}
            placeholder="Optional name"
            placeholderTextColor="#4B5563"
            maxLength={30}
            style={{
              flex: 1,
              color: "#FFFFFF",
              fontSize: 15,
              fontFamily: "Outfit_400Regular",
              textAlign: "right",
              paddingVertical: 0,
            }}
          />
          {displayNameSaved && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#10B981"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        {/* Country */}
        <SettingsRow
          icon="flag-outline"
          iconColor="#6B7280"
          label="Country"
          value={
            selectedCountry
              ? `${selectedCountry.flag} ${selectedCountry.name}`
              : "Not set"
          }
          onPress={() => setCountryPickerVisible(true)}
        />
      </View>

      {/* PREFERENCES section */}
      <SectionHeader title="Preferences" />
      <View className="mx-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {/* Default language */}
        <SettingsRow
          icon="code-slash"
          iconColor="#3178C6"
          label="Default Language"
          value={selectedLang.name}
          onPress={() => setLanguagePickerVisible(true)}
        />

        <View className="border-b border-dark-border mx-4" />

        {/* Sound effects */}
        <SettingsRow
          icon="volume-medium-outline"
          iconColor="#6B7280"
          label="Sound Effects"
          rightElement={
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: "#1A1A24", true: "rgba(57,255,20,0.3)" }}
              thumbColor={soundEnabled ? "#39FF14" : "#6B7280"}
            />
          }
        />

        <View className="border-b border-dark-border mx-4" />

        {/* Haptic feedback */}
        <SettingsRow
          icon="phone-portrait-outline"
          iconColor="#6B7280"
          label="Haptic Feedback"
          rightElement={
            <Switch
              value={hapticEnabled}
              onValueChange={toggleHaptic}
              trackColor={{ false: "#1A1A24", true: "rgba(57,255,20,0.3)" }}
              thumbColor={hapticEnabled ? "#39FF14" : "#6B7280"}
            />
          }
        />
      </View>

      {/* ACCOUNT section */}
      <SectionHeader title="Account" />
      <View className="mx-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <SettingsRow
          icon="log-out-outline"
          iconColor="#6B7280"
          label="Sign Out"
          onPress={handleSignOut}
        />

        <View className="border-b border-dark-border mx-4" />

        <SettingsRow
          icon="trash-outline"
          label="Delete Account"
          destructive
          onPress={handleDeleteAccount}
        />
      </View>

      {deleting && (
        <View className="items-center mt-4">
          <ActivityIndicator color="#EF4444" />
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 8 }}>
            Deleting account...
          </Text>
        </View>
      )}

      {/* ABOUT section */}
      <SectionHeader title="About" />
      <View className="mx-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <SettingsRow
          icon="information-circle-outline"
          iconColor="#6B7280"
          label="App Version"
          value={appVersion}
        />

        <View className="border-b border-dark-border mx-4" />

        <SettingsRow
          icon="document-text-outline"
          iconColor="#6B7280"
          label="Terms of Service"
          onPress={() =>
            WebBrowser.openBrowserAsync("https://coduel.app/terms")
          }
        />

        <View className="border-b border-dark-border mx-4" />

        <SettingsRow
          icon="shield-checkmark-outline"
          iconColor="#6B7280"
          label="Privacy Policy"
          onPress={() =>
            WebBrowser.openBrowserAsync("https://coduel.app/privacy")
          }
        />
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setCountryPickerVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={SlideInDown.duration(300).easing(
                Easing.out(Easing.cubic)
              )}
              className="bg-dark-card border-t border-dark-border rounded-t-3xl"
              style={{ maxHeight: "70%" }}
            >
              {/* Handle bar */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 bg-dark-border rounded-full" />
              </View>

              {/* Header */}
              <View className="px-6 pb-4 border-b border-dark-border">
                <TextBold className="text-white text-xl">
                  Select Country
                </TextBold>
              </View>

              {/* List */}
              <ScrollView className="px-4 py-4">
                {/* None option */}
                <Pressable
                  onPress={() => {
                    setCountry(null);
                    setCountryPickerVisible(false);
                    supabase
                      .from("profiles")
                      .update({ country: null })
                      .eq("id", user!.id)
                      .then(() => refreshProfile());
                  }}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${
                    country === null
                      ? "bg-primary/15 border border-primary/50"
                      : "bg-dark-elevated border border-transparent"
                  }`}
                >
                  <View style={{ marginRight: 12 }}>
                  <Ionicons name="globe-outline" size={24} color="#6B7280" />
                </View>
                  <TextMedium
                    style={{
                      fontSize: 15,
                      color: country === null ? "#39FF14" : "#FFFFFF",
                      flex: 1,
                    }}
                  >
                    Not set
                  </TextMedium>
                  {country === null && (
                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="#050508" />
                    </View>
                  )}
                </Pressable>

                {COUNTRIES.map((c) => {
                  const isSelected = country === c.code;
                  return (
                    <Pressable
                      key={c.code}
                      onPress={() => handleCountrySelect(c.code)}
                      className={`flex-row items-center p-4 rounded-xl mb-2 ${
                        isSelected
                          ? "bg-primary/15 border border-primary/50"
                          : "bg-dark-elevated border border-transparent"
                      }`}
                    >
                      <Text style={{ fontSize: 24, marginRight: 12 }}>
                        {c.flag}
                      </Text>
                      <TextMedium
                        style={{
                          fontSize: 15,
                          color: isSelected ? "#39FF14" : "#FFFFFF",
                          flex: 1,
                        }}
                      >
                        {c.name}
                      </TextMedium>
                      {isSelected && (
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#050508"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
                <View className="h-8" />
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Language Picker Modal */}
      <Modal
        visible={languagePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguagePickerVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setLanguagePickerVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={SlideInDown.duration(300).easing(
                Easing.out(Easing.cubic)
              )}
              className="bg-dark-card border-t border-dark-border rounded-t-3xl"
            >
              {/* Handle bar */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 bg-dark-border rounded-full" />
              </View>

              {/* Header */}
              <View className="px-6 pb-4 border-b border-dark-border">
                <TextBold className="text-white text-xl">
                  Default Language
                </TextBold>
                <Text className="text-gray-500 text-sm mt-1">
                  Pre-selects this language on the home screen
                </Text>
              </View>

              {/* Options */}
              <View className="px-4 py-4">
                {LANGUAGES.map((lang) => {
                  const isSelected = preferredLanguage === lang.id;
                  return (
                    <Pressable
                      key={lang.id ?? "all"}
                      onPress={() => handleLanguageSelect(lang.id)}
                      className={`flex-row items-center p-4 rounded-xl mb-2 ${
                        isSelected
                          ? "bg-primary/15 border border-primary/50"
                          : "bg-dark-elevated border border-transparent active:bg-dark-border"
                      }`}
                    >
                      <View
                        className={`w-12 h-12 rounded-xl items-center justify-center ${
                          isSelected ? "bg-primary/20" : "bg-dark-border"
                        }`}
                      >
                        <Ionicons
                          name={lang.icon}
                          size={24}
                          color={isSelected ? "#39FF14" : lang.color}
                        />
                      </View>
                      <View className="ml-4 flex-1">
                        <TextSemibold
                          className={
                            isSelected ? "text-primary" : "text-white"
                          }
                        >
                          {lang.name}
                        </TextSemibold>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          {lang.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#050508"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View className="h-8" />
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
