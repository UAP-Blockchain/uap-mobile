import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, router } from "expo-router";
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
  // const { notificationCount } = useNotification();
  const notificationCount = 0; // Temporary placeholder
  const navigation = useNavigation();

  // Custom tab bar components
  const renderTimeSheetTabIcon = useCallback(
    ({ focused }: { focused: boolean }) => (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 30,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={focused ? ["#3674B5", "#0d47a1"] : ["#e0e0e0", "#bdbdbd"]}
          style={{
            width: 40,
            height: 40,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AntDesign name="calendar" size={24} color={"white"} />
        </LinearGradient>
      </View>
    ),
    []
  );

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
          paddingBottom: 5,
          height: 65,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          bottom: 0,
          zIndex: 8,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 3,
          marginBottom: 5,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
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
          title: "Thời khóa biểu",
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
          title: "Điểm danh",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="checkcircle"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu-2"
        options={{
          title: "Menu 2",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="form"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu-3"
        options={{
          title: "Menu 3",
          tabBarIcon: renderTimeSheetTabIcon,
          tabBarButton: (props) => {
            const { onPress, ...touchableProps } = props;
            return (
              <TouchableOpacity
                style={touchableProps.style}
                accessibilityState={touchableProps.accessibilityState}
                accessibilityLabel={touchableProps.accessibilityLabel}
                testID={touchableProps.testID}
                onPress={() => {
                  router.push("/timesheet" as any);
                }}
              >
                {props.children}
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="menu-4"
        options={{
          title: "Menu 4",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="attach-money"
              color={color}
              size={size}
              iconType="MaterialIcons"
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
    </Tabs>
  );
}
