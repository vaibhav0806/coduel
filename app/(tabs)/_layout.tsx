import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#39FF14",
        tabBarInactiveTintColor: "#3A3A44",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#08080D",
          borderTopWidth: 0,
          height: 48 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        headerStyle: { backgroundColor: "#050508" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={focused ? "#39FF14" : "#3A3A44"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: "Topics",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "library" : "library-outline"}
              size={22}
              color={focused ? "#39FF14" : "#3A3A44"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranks",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={22}
              color={focused ? "#39FF14" : "#3A3A44"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={focused ? "#39FF14" : "#3A3A44"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
