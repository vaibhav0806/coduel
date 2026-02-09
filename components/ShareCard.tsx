import { View, Text as RNText } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const tierThemes: Record<
  string,
  {
    label: string;
    colors: [string, string, string];
    accent: string;
    glow: string;
  }
> = {
  bronze: {
    label: "BRONZE",
    colors: ["#CD7F32", "#A0522D", "#8B4513"],
    accent: "#CD7F32",
    glow: "rgba(205,127,50,0.25)",
  },
  silver: {
    label: "SILVER",
    colors: ["#E8E8E8", "#A8A8A8", "#808080"],
    accent: "#C0C0C0",
    glow: "rgba(192,192,192,0.25)",
  },
  gold: {
    label: "GOLD",
    colors: ["#FFD700", "#F0C040", "#DAA520"],
    accent: "#FFD700",
    glow: "rgba(255,215,0,0.25)",
  },
  diamond: {
    label: "DIAMOND",
    colors: ["#B9F2FF", "#7EC8E3", "#4169E1"],
    accent: "#B9F2FF",
    glow: "rgba(185,242,255,0.25)",
  },
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
  const theme = tierThemes[tier] ?? tierThemes.bronze;
  const resultColor = isWinner ? "#39FF14" : "#EF4444";
  const resultBg = isWinner
    ? "rgba(57,255,20,0.06)"
    : "rgba(239,68,68,0.06)";

  return (
    <View
      style={{
        width: 360,
        backgroundColor: "#08080D",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* === Top accent bar — tier gradient === */}
      <LinearGradient
        colors={theme.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4 }}
      />

      {/* === Inner content === */}
      <View style={{ padding: 28, paddingTop: 24, paddingBottom: 24 }}>
        {/* Header row: CODUEL + tier badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <RNText
            style={{
              fontFamily: "Teko_700Bold",
              fontSize: 22,
              color: "#FFFFFF",
              letterSpacing: 6,
              lineHeight: 24,
            }}
          >
            CODUEL
          </RNText>
          <LinearGradient
            colors={theme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <RNText
              style={{
                fontFamily: "Outfit_700Bold",
                fontSize: 9,
                color: "#08080D",
                letterSpacing: 1.5,
              }}
            >
              {theme.label}
            </RNText>
          </LinearGradient>
        </View>

        {/* Result headline */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <RNText
            style={{
              fontFamily: "Teko_700Bold",
              fontSize: 52,
              color: resultColor,
              letterSpacing: 6,
              lineHeight: 56,
            }}
          >
            {isWinner ? "VICTORY" : "DEFEAT"}
          </RNText>

          {isComeback && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Ionicons name="flash" size={12} color="#F59E0B" />
              <RNText
                style={{
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 11,
                  color: "#F59E0B",
                  letterSpacing: 1.5,
                  marginLeft: 4,
                }}
              >
                CLUTCH COMEBACK
              </RNText>
            </View>
          )}
        </View>

        {/* Score block */}
        <View
          style={{
            backgroundColor: resultBg,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: isWinner
              ? "rgba(57,255,20,0.1)"
              : "rgba(239,68,68,0.1)",
            padding: 20,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {/* Username */}
          <RNText
            style={{
              fontFamily: "Outfit_500Medium",
              fontSize: 13,
              color: "#6B7280",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            @{playerUsername}
          </RNText>

          {/* Big score */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <RNText
              style={{
                fontFamily: "Teko_700Bold",
                fontSize: 72,
                color: "#FFFFFF",
                lineHeight: 72,
              }}
            >
              {playerScore}
            </RNText>
            <RNText
              style={{
                fontFamily: "Outfit_500Medium",
                fontSize: 20,
                color: "#3A3A44",
                marginHorizontal: 12,
                lineHeight: 72,
              }}
            >
              -
            </RNText>
            <RNText
              style={{
                fontFamily: "Teko_700Bold",
                fontSize: 72,
                color: "#3A3A44",
                lineHeight: 72,
              }}
            >
              {opponentScore}
            </RNText>
          </View>
        </View>

        {/* Stats row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          {/* Rating */}
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            <RNText
              style={{
                fontFamily: "Outfit_700Bold",
                fontSize: 26,
                color: "#FFFFFF",
                lineHeight: 30,
              }}
            >
              {rating.toLocaleString()}
            </RNText>
            {ratingChange !== 0 && (
              <RNText
                style={{
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 13,
                  color: ratingChange > 0 ? "#39FF14" : "#EF4444",
                  marginTop: 2,
                }}
              >
                {ratingChange > 0 ? "+" : ""}
                {ratingChange}
              </RNText>
            )}
            <RNText
              style={{
                fontFamily: "Outfit_400Regular",
                fontSize: 10,
                color: "#4B5563",
                letterSpacing: 1.5,
                marginTop: 4,
              }}
            >
              RATING
            </RNText>
          </View>

          {/* Divider */}
          {currentStreak > 0 && (
            <>
              <View
                style={{
                  width: 1,
                  height: 32,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              />

              {/* Streak */}
              <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="flame"
                    size={20}
                    color="#FF6B35"
                    style={{ marginRight: 4 }}
                  />
                  <RNText
                    style={{
                      fontFamily: "Outfit_700Bold",
                      fontSize: 26,
                      color: "#FFFFFF",
                      lineHeight: 30,
                    }}
                  >
                    {currentStreak}
                  </RNText>
                </View>
                <RNText
                  style={{
                    fontFamily: "Outfit_400Regular",
                    fontSize: 10,
                    color: "#4B5563",
                    letterSpacing: 1.5,
                    marginTop: 4,
                  }}
                >
                  STREAK
                </RNText>
              </View>
            </>
          )}
        </View>

        {/* Footer CTA */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.06)",
            paddingTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="code-slash"
            size={14}
            color="#3A3A44"
            style={{ marginRight: 8 }}
          />
          <RNText
            style={{
              fontFamily: "Outfit_500Medium",
              fontSize: 12,
              color: "#3A3A44",
              letterSpacing: 0.5,
            }}
          >
            Think you can beat me?
          </RNText>
        </View>
      </View>
    </View>
  );
}
