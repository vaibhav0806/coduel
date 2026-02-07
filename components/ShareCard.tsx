import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const tierColors: Record<string, [string, string]> = {
  bronze: ["#CD7F32", "#8B4513"],
  silver: ["#C0C0C0", "#808080"],
  gold: ["#FFD700", "#DAA520"],
  diamond: ["#B9F2FF", "#4169E1"],
};

const tierNames: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond",
};

interface ShareCardProps {
  isWinner: boolean;
  playerUsername: string;
  playerScore: number;
  opponentScore: number;
  rating: number;
  ratingChange: number;
  tier: string;
  currentStreak: number;
  isComeback: boolean;
}

export function ShareCard({
  isWinner,
  playerUsername,
  playerScore,
  opponentScore,
  rating,
  ratingChange,
  tier,
  currentStreak,
  isComeback,
}: ShareCardProps) {
  return (
    <View
      style={{
        width: 360,
        height: 480,
        backgroundColor: "#0F0F1A",
        borderRadius: 24,
        padding: 24,
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            color: "#6366F1",
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: 4,
          }}
        >
          CODUEL
        </Text>
      </View>

      {/* Result */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 48, marginBottom: 4 }}>
          {isWinner ? "🏆" : "😢"}
        </Text>
        <Text
          style={{
            fontSize: 36,
            fontWeight: "800",
            color: isWinner ? "#10B981" : "#EF4444",
            marginBottom: 8,
          }}
        >
          {isWinner ? "VICTORY" : "DEFEAT"}
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "600",
          }}
        >
          {playerUsername}
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 32,
            fontWeight: "700",
            marginTop: 4,
          }}
        >
          {playerScore} - {opponentScore}
        </Text>

        {isComeback && (
          <View
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              paddingHorizontal: 16,
              paddingVertical: 4,
              borderRadius: 999,
              marginTop: 8,
            }}
          >
            <Text
              style={{ color: "#F59E0B", fontWeight: "700", fontSize: 14 }}
            >
              Clutch!
            </Text>
          </View>
        )}
      </View>

      {/* Rating & Tier */}
      <View style={{ alignItems: "center" }}>
        <LinearGradient
          colors={tierColors[tier] ?? tierColors.bronze}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 4,
            borderRadius: 999,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
            {tierNames[tier] ?? "Bronze"}
          </Text>
        </LinearGradient>

        <Text
          style={{ color: "#FFFFFF", fontSize: 40, fontWeight: "800" }}
        >
          {rating}
        </Text>

        {ratingChange !== 0 && (
          <Text
            style={{
              color: ratingChange > 0 ? "#10B981" : "#EF4444",
              fontSize: 18,
              fontWeight: "700",
              marginTop: 4,
            }}
          >
            {ratingChange > 0 ? "+" : ""}
            {ratingChange} Rating
          </Text>
        )}

        {currentStreak > 0 && (
          <Text
            style={{
              color: "#F59E0B",
              fontSize: 16,
              fontWeight: "600",
              marginTop: 8,
            }}
          >
            🔥 {currentStreak} day streak
          </Text>
        )}
      </View>

      {/* Footer CTA */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#6B7280", fontSize: 14, fontWeight: "500" }}>
          Think you can beat me?
        </Text>
      </View>
    </View>
  );
}
