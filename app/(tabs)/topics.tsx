import { View, ScrollView, Pressable, RefreshControl } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, createBotMatch } from "@/lib/supabase";
import { TOPICS, Topic } from "@/lib/topics";
import { LANGUAGES, Language } from "@/components/LanguageSelector";

interface TopicWithCount extends Topic {
  questionCount: number;
}

interface LanguageSection {
  language: Language;
  topics: TopicWithCount[];
}

export default function TopicsScreen() {
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<LanguageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTopic, setStartingTopic] = useState<string | null>(null);

  const fetchTopicCounts = useCallback(async () => {
    // Get question counts per language and topic
    const { data: questions } = await supabase
      .from("questions")
      .select("language, topic");

    if (!questions) {
      setSections([]);
      return;
    }

    // Count questions by language and topic
    const counts: Record<string, Record<string, number>> = {};
    for (const q of questions) {
      const lang = q.language?.toLowerCase() ?? "unknown";
      const topic = q.topic ?? "fun";
      if (!counts[lang]) counts[lang] = {};
      counts[lang][topic] = (counts[lang][topic] ?? 0) + 1;
    }

    // Build sections for each language (excluding "All Languages")
    const languageSections: LanguageSection[] = LANGUAGES
      .filter((l) => l.id !== null)
      .map((language) => {
        const langCounts = counts[language.id!] ?? {};
        const topicsWithCount: TopicWithCount[] = TOPICS.map((t) => ({
          ...t,
          questionCount: langCounts[t.id] ?? 0,
        }));
        return { language, topics: topicsWithCount };
      });

    setSections(languageSections);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTopicCounts();
    }, [fetchTopicCounts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTopicCounts();
    setRefreshing(false);
  }, [fetchTopicCounts]);

  const handleStartPractice = async (language: string, topic: string) => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStartingTopic(`${language}-${topic}`);

    try {
      const result = await createBotMatch(user.id, false, language, topic);
      router.push({
        pathname: "/battle/[id]",
        params: {
          id: result.match_id,
          opponentName: result.opponent_username,
          opponentRating: result.opponent_rating.toString(),
          isBotMatch: "true",
        },
      });
    } catch (err) {
      console.error("Failed to start practice:", err);
    } finally {
      setStartingTopic(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <TextBold className="text-white text-2xl">Topics</TextBold>
        <Text className="text-gray-500 text-sm mt-1">
          Practice specific topics to improve your skills
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#39FF14"
          />
        }
      >
        {sections.map((section, sectionIndex) => (
          <Animated.View
            key={section.language.id}
            entering={FadeInDown.delay(sectionIndex * 100).duration(400)}
            className="mb-6"
          >
            {/* Language Header */}
            <View className="px-6 flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: `${section.language.color}20` }}
              >
                <Ionicons
                  name={section.language.icon}
                  size={18}
                  color={section.language.color}
                />
              </View>
              <TextSemibold className="text-white text-lg">
                {section.language.name}
              </TextSemibold>
            </View>

            {/* Topic Cards */}
            <View className="px-4">
              {section.topics.map((topic, topicIndex) => {
                const isStarting =
                  startingTopic === `${section.language.id}-${topic.id}`;
                const hasQuestions = topic.questionCount > 0;

                return (
                  <Animated.View
                    key={topic.id}
                    entering={FadeIn.delay(
                      sectionIndex * 100 + topicIndex * 50
                    ).duration(300)}
                  >
                    <Pressable
                      onPress={() =>
                        hasQuestions &&
                        handleStartPractice(section.language.id!, topic.id)
                      }
                      disabled={isStarting || !hasQuestions}
                      className={`mx-2 mb-3 rounded-xl overflow-hidden ${
                        !hasQuestions ? "opacity-50" : ""
                      }`}
                    >
                      <View className="bg-dark-card border border-dark-border rounded-xl p-4 flex-row items-center">
                        {/* Icon */}
                        <View
                          className="w-12 h-12 rounded-xl items-center justify-center"
                          style={{ backgroundColor: `${topic.color}20` }}
                        >
                          <Ionicons
                            name={topic.icon}
                            size={24}
                            color={topic.color}
                          />
                        </View>

                        {/* Content */}
                        <View className="flex-1 ml-4">
                          <TextSemibold className="text-white text-base">
                            {topic.name}
                          </TextSemibold>
                          <Text
                            className="text-gray-500 text-xs mt-0.5"
                            numberOfLines={1}
                          >
                            {topic.description}
                          </Text>
                          <View className="flex-row items-center mt-1.5">
                            <Ionicons
                              name="help-circle-outline"
                              size={12}
                              color="#6B7280"
                            />
                            <Text className="text-gray-500 text-xs ml-1">
                              {topic.questionCount} questions
                            </Text>
                          </View>
                        </View>

                        {/* Action */}
                        <View className="ml-2">
                          {isStarting ? (
                            <View className="w-10 h-10 rounded-full bg-dark-border items-center justify-center">
                              <Ionicons
                                name="hourglass-outline"
                                size={18}
                                color="#6B7280"
                              />
                            </View>
                          ) : hasQuestions ? (
                            <View
                              className="w-10 h-10 rounded-full items-center justify-center"
                              style={{ backgroundColor: `${topic.color}20` }}
                            >
                              <Ionicons
                                name="play"
                                size={18}
                                color={topic.color}
                              />
                            </View>
                          ) : (
                            <View className="w-10 h-10 rounded-full bg-dark-border items-center justify-center">
                              <Ionicons
                                name="lock-closed-outline"
                                size={16}
                                color="#4B5563"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        ))}

        {/* Empty state */}
        {!loading && sections.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="library-outline" size={48} color="#3A3A44" />
            <Text className="text-gray-500 text-center mt-4">
              No topics available yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
