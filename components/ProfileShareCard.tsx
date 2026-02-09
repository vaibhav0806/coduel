import { View, Text as RNText } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const tierThemes: Record<
  string,
  {
    label: string;
    colors: [string, string, string];
    accent: string;
  }
> = {
  bronze: {
    label: "BRONZE",
    colors: ["#CD7F32", "#A0522D", "#8B4513"],
    accent: "#CD7F32",
  },
  silver: {
    label: "SILVER",
    colors: ["#E8E8E8", "#A8A8A8", "#808080"],
    accent: "#C0C0C0",
  },
  gold: {
    label: "GOLD",
    colors: ["#FFD700", "#F0C040", "#DAA520"],
    accent: "#FFD700",
  },
  diamond: {
    label: "DIAMOND",
    colors: ["#B9F2FF", "#7EC8E3", "#4169E1"],
    accent: "#B9F2FF",
  },
};

interface ProfileShareCardProps {
  username: string;
  rating: number;
  tier: string;
  wins: number;
  winRate: number;
  currentStreak: number;
}

export function ProfileShareCard({
  username,
  rating,
  tier,
  wins,
  winRate,
  currentStreak,
}: ProfileShareCardProps) {
  const theme = tierThemes[tier] ?? tierThemes.bronze;

  return (
    <View
      style={{
        width: 360,
        backgroundColor: "#08080D",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* Top accent bar — tier gradient */}
      <LinearGradient
        colors={theme.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4 }}
      />

      <View style={{ padding: 28, paddingTop: 24, paddingBottom: 24 }}>
        {/* Header row: GITGUD + tier badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
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
            GITGUD
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

        {/* Username */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <RNText
            style={{
              fontFamily: "Outfit_500Medium",
              fontSize: 14,
              color: "#6B7280",
              letterSpacing: 0.5,
            }}
          >
            @{username}
          </RNText>
        </View>

        {/* Big rating */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <RNText
            style={{
              fontFamily: "Teko_700Bold",
              fontSize: 72,
              color: "#FFFFFF",
              lineHeight: 72,
            }}
          >
            {rating.toLocaleString()}
          </RNText>
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

        {/* Stats row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          {/* Wins */}
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            <RNText
              style={{
                fontFamily: "Outfit_700Bold",
                fontSize: 22,
                color: "#10B981",
                lineHeight: 26,
              }}
            >
              {wins}
            </RNText>
            <RNText
              style={{
                fontFamily: "Outfit_400Regular",
                fontSize: 10,
                color: "#4B5563",
                letterSpacing: 1.5,
                marginTop: 4,
              }}
            >
              WINS
            </RNText>
          </View>

          <View
            style={{
              width: 1,
              height: 32,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />

          {/* Win Rate */}
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            <RNText
              style={{
                fontFamily: "Outfit_700Bold",
                fontSize: 22,
                color: winRate >= 50 ? "#10B981" : "#EF4444",
                lineHeight: 26,
              }}
            >
              {winRate}%
            </RNText>
            <RNText
              style={{
                fontFamily: "Outfit_400Regular",
                fontSize: 10,
                color: "#4B5563",
                letterSpacing: 1.5,
                marginTop: 4,
              }}
            >
              WIN RATE
            </RNText>
          </View>

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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="flame"
                    size={18}
                    color="#FF6B35"
                    style={{ marginRight: 4 }}
                  />
                  <RNText
                    style={{
                      fontFamily: "Outfit_700Bold",
                      fontSize: 22,
                      color: "#FFFFFF",
                      lineHeight: 26,
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
            Can you beat me? — gitgud.app
          </RNText>
        </View>
      </View>
    </View>
  );
}
