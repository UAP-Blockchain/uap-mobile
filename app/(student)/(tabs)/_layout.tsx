import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { memo } from "react";
import { Animated, Text, View } from "react-native";

// import { useNotification } from '@/contexts/NotificationContext';

// Animated Tab Bar Icon component
interface TabBarIconProps {
  focused: boolean;
  name: string;
  color: string;
  size: number;
  iconType?: "AntDesign" | "MaterialIcons" | "Entypo";
  badgeCount?: number;
}

const TabBarIcon = memo(function TabBarIcon({
  focused,
  name,
  color,
  size,
  iconType = "AntDesign",
  badgeCount,
}: TabBarIconProps) {
  const animatedValue = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValue, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, animatedValue]);

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          justifyContent: "center",
          alignItems: "center",
          width: 40,
          height: 25,
        },
      ]}
    >
      {iconType === "AntDesign" && name && (
        <AntDesign name={name as any} size={size} color={color} />
      )}
      {iconType === "MaterialIcons" && name && (
        <MaterialIcons name={name as any} size={size} color={color} />
      )}
      {iconType === "Entypo" && name && (
        <Entypo name={name as any} size={size} color={color} />
      )}
      {badgeCount != null && badgeCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            backgroundColor: "#FF4444",
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            {badgeCount > 99 ? "99+" : badgeCount.toString()}
          </Text>
        </View>
      )}
    </Animated.View>
  );
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="home"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: "Timetable",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="calendar"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="user"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="student-home"
        options={{
          href: null, // Ẩn tab này khỏi tab bar nhưng vẫn có thể điều hướng từ code
        }}
      />
      <Tabs.Screen
        name="attendance-detail"
        options={{
          href: null, // Ẩn tab này khỏi tab bar nhưng vẫn có thể điều hướng từ code
        }}
      />
      <Tabs.Screen
        name="mark-report"
        options={{
          href: null, // Ẩn tab này khỏi tab bar, chỉ truy cập được từ home
        }}
      />
      <Tabs.Screen
        name="mark-report-detail"
        options={{
          href: null, // Ẩn tab này khỏi tab bar, chỉ truy cập được từ mark-report
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          href: null, // Ẩn tab, truy cập từ quick action trên Home
        }}
      />
      <Tabs.Screen
        name="attendance-report"
        options={{
          href: null, // Ẩn tab, chỉ mở từ Home hoặc nơi khác
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="menu-tab"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
