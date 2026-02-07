import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface Language {
  id: string | null;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const LANGUAGES: Language[] = [
  { id: null, name: "All", icon: "apps", color: "#39FF14" },
  { id: "python", name: "Python", icon: "logo-python", color: "#3776AB" },
  { id: "javascript", name: "JavaScript", icon: "logo-javascript", color: "#F7DF1E" },
  { id: "typescript", name: "TypeScript", icon: "code-slash", color: "#3178C6" },
];

interface LanguageSelectorProps {
  selectedLanguage: string | null;
  onSelect: (language: string | null) => void;
}

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-sm mb-2 ml-1">Battle Topic</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {LANGUAGES.map((lang) => (
          <LanguageChip
            key={lang.id ?? "all"}
            language={lang}
            isSelected={selectedLanguage === lang.id}
            onPress={() => onSelect(lang.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface LanguageChipProps {
  language: Language;
  isSelected: boolean;
  onPress: () => void;
}

function LanguageChip({ language, isSelected, onPress }: LanguageChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={animatedStyle}
        className={`flex-row items-center px-4 py-2 mr-2 rounded-full border ${
          isSelected
            ? "bg-primary/20 border-primary"
            : "bg-dark-card border-dark-border"
        }`}
      >
        <Ionicons
          name={language.icon}
          size={16}
          color={isSelected ? "#39FF14" : language.color}
        />
        <Text
          className={`ml-2 font-medium ${
            isSelected ? "text-primary" : "text-white"
          }`}
        >
          {language.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={14} color="#39FF14" className="ml-1" />
        )}
      </Animated.View>
    </Pressable>
  );
}

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage: string | null;
  onSelect: (language: string | null) => void;
}

export function LanguageModal({
  visible,
  onClose,
  selectedLanguage,
  onSelect,
}: LanguageModalProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
      <View className="bg-dark-card border border-dark-border rounded-2xl w-11/12 max-w-sm p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-xl font-bold">Select Topic</Text>
          <Pressable onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <View className="space-y-2">
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.id ?? "all"}
              onPress={() => {
                onSelect(lang.id);
                onClose();
              }}
              className={`flex-row items-center p-4 rounded-xl border ${
                selectedLanguage === lang.id
                  ? "bg-primary/20 border-primary"
                  : "bg-dark border-dark-border"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  selectedLanguage === lang.id ? "bg-primary/30" : "bg-dark-border"
                }`}
              >
                <Ionicons
                  name={lang.icon}
                  size={20}
                  color={selectedLanguage === lang.id ? "#39FF14" : lang.color}
                />
              </View>
              <Text
                className={`ml-3 font-semibold flex-1 ${
                  selectedLanguage === lang.id ? "text-primary" : "text-white"
                }`}
              >
                {lang.name}
              </Text>
              {selectedLanguage === lang.id && (
                <Ionicons name="checkmark-circle" size={24} color="#39FF14" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
