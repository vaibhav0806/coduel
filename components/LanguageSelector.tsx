import React, { useState } from "react";
import { View, Pressable, Modal } from "react-native";
import { Text, TextBold, TextSemibold } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
  Easing,
} from "react-native-reanimated";

export interface Language {
  id: string | null;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
}

export const LANGUAGES: Language[] = [
  { id: null, name: "All Languages", icon: "apps", color: "#39FF14", description: "Questions from all topics" },
  { id: "python", name: "Python", icon: "logo-python", color: "#3776AB", description: "Python programming" },
  { id: "javascript", name: "JavaScript", icon: "logo-javascript", color: "#F7DF1E", description: "JavaScript & ES6+" },
  { id: "typescript", name: "TypeScript", icon: "code-slash", color: "#3178C6", description: "TypeScript fundamentals" },
];

interface LanguageSelectorProps {
  selectedLanguage: string | null;
  onSelect: (language: string | null) => void;
}

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useSharedValue(1);

  const selectedLang = LANGUAGES.find(l => l.id === selectedLanguage) ?? LANGUAGES[0];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={animatedStyle}
          className="bg-dark-card border border-dark-border rounded-xl p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-dark-border rounded-full items-center justify-center">
              <Ionicons name={selectedLang.icon} size={20} color={selectedLang.color} />
            </View>
            <View className="ml-3 flex-1">
              <TextSemibold className="text-white">{selectedLang.name}</TextSemibold>
              <Text className="text-gray-500 text-xs mt-0.5">{selectedLang.description}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="bg-dark-border px-2 py-1 rounded-full mr-2">
              <Text className="text-gray-400 text-xs">Topic</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </View>
        </Animated.View>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={SlideInDown.duration(300).easing(Easing.out(Easing.cubic))}
              className="bg-dark-card border-t border-dark-border rounded-t-3xl"
            >
              {/* Handle bar */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 bg-dark-border rounded-full" />
              </View>

              {/* Header */}
              <View className="px-6 pb-4 border-b border-dark-border">
                <TextBold className="text-white text-xl">Select Topic</TextBold>
                <Text className="text-gray-500 text-sm mt-1">
                  Focus your practice on a specific language
                </Text>
              </View>

              {/* Options */}
              <View className="px-4 py-4">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <Pressable
                      key={lang.id ?? "all"}
                      onPress={() => {
                        onSelect(lang.id);
                        setModalVisible(false);
                      }}
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
                        <TextSemibold className={isSelected ? "text-primary" : "text-white"}>
                          {lang.name}
                        </TextSemibold>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          {lang.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={16} color="#050508" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Safe area padding */}
              <View className="h-8" />
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
