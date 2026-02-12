import { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, TextMedium, TextSemibold } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSupport } from "@/hooks/useSupport";
import { SupportMessage } from "@/types/database";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return time;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;

  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const isUser = message.sender === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
        marginBottom: 8,
      }}
    >
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 18,
          ...(isUser
            ? {
                backgroundColor: "rgba(57, 255, 20, 0.12)",
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: "#0A0A0F",
                borderWidth: 1,
                borderColor: "#1A1A24",
                borderBottomLeftRadius: 4,
              }),
        }}
      >
        <Text style={{ fontSize: 15, color: "#FFFFFF", lineHeight: 21 }}>
          {message.body}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: "#4B5563",
          marginTop: 4,
          alignSelf: isUser ? "flex-end" : "flex-start",
          marginHorizontal: 4,
        }}
      >
        {formatTime(message.created_at)}
      </Text>
    </View>
  );
}

export default function SupportScreen() {
  const { questionId, questionType, language, codeSnippet, questionText, roundNumber, totalRounds } =
    useLocalSearchParams<{
      questionId?: string;
      questionType?: string;
      language?: string;
      codeSnippet?: string;
      questionText?: string;
      roundNumber?: string;
      totalRounds?: string;
    }>();

  const { messages, loading, sending, sendMessage } = useSupport();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const prefilled = useRef(false);

  // Pre-fill input with report template when navigated with question params
  useEffect(() => {
    if (questionId && !prefilled.current) {
      prefilled.current = true;
      const lines = [
        "[Question Report]",
        `Question ID: ${questionId}`,
        `Type: ${questionType ?? "mcq"} | Language: ${language ?? "Unknown"}`,
        roundNumber ? `Round: ${roundNumber}/${totalRounds ?? "?"}` : null,
        "",
        questionText ? `Question: ${questionText}` : null,
        codeSnippet ? `Code: ${codeSnippet}` : null,
        "",
        "Issue: ",
      ].filter((l) => l !== null).join("\n");
      setInput(lines);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [questionId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#39FF14" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      {messages.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#3B82F6" />
          </View>
          <TextSemibold
            style={{ fontSize: 18, color: "#FFFFFF", textAlign: "center", marginBottom: 8 }}
          >
            How can we help?
          </TextSemibold>
          <Text
            style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20 }}
          >
            Send us a message and we'll get back to you within 24 hours.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      {/* Input bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: 12,
          paddingVertical: 8,
          paddingBottom: Platform.OS === "ios" ? 4 : 8,
          borderTopWidth: 1,
          borderTopColor: "#1A1A24",
          backgroundColor: "#050508",
        }}
      >
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#4B5563"
          multiline
          maxLength={2000}
          style={{
            flex: 1,
            color: "#FFFFFF",
            fontSize: 15,
            fontFamily: "Outfit_400Regular",
            backgroundColor: "#0A0A0F",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10,
            maxHeight: 100,
            borderWidth: 1,
            borderColor: "#1A1A24",
          }}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: input.trim() ? "#39FF14" : "#1A1A24",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#050508" />
          ) : (
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() ? "#050508" : "#4B5563"}
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
