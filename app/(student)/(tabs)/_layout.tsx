import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React, { memo, useCallback } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

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
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: -8,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#3674B5",
          }}
        />
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
  const notificationCount = 0; // Temporary placeholder
  const navigation = useNavigation();

  const renderMenuButton = useCallback(
    (props: any) => (
      <TouchableOpacity
        {...props}
        onPress={() => {
          navigation.dispatch(DrawerActions.openDrawer());
        }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TabBarIcon
          focused={false}
          name="menu"
          color="#888"
          size={24}
          iconType="Entypo"
          badgeCount={notificationCount}
        />
        <Text
          style={{
            color: "#888",
            fontSize: 12,
            fontWeight: "500",
            marginTop: 3,
          }}
        >
          Menu
        </Text>
      </TouchableOpacity>
    ),
    [navigation, notificationCount]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3674B5",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          position: "absolute",
          bottom: 0,
          zIndex: 8,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
          marginBottom: 2,
          fontWeight: "500",
          textAlign: "center",
        },
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
        name="menu-tab"
        options={{
          title: "Menu",
          tabBarButton: renderMenuButton,
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
    </Tabs>
  );
}
