import { Drawer } from "expo-router/drawer";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
// import { useNotification } from '@/contexts/NotificationContext';

export default function DrawerLayout() {
  // const { notificationCount } = useNotigation();
  const notificationCount = 0; // Temporary placeholder

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login" as any);
    } catch (error: any) {
      console.error("Error clearing AsyncStorage during logout:", error);
      router.replace("/login" as any);
    }
  }, []);

  // Custom drawer content
  const renderDrawerContent = useCallback((props: any) => {
    return (
      <View style={{ flex: 1, paddingTop: 50 }}>
        <Text
          style={{
            padding: 16,
            fontSize: 20,
            fontWeight: "bold",
            color: "#3674B5",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            marginTop: 30,
          }}
        >
          Student ...
        </Text>

        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)" as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
            borderRadius: 8,
            padding: 16,
          })}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>Home</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/student-home" as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
            borderRadius: 8,
            padding: 16,
          })}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>Profile</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/timetable" as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
            borderRadius: 8,
            padding: 16,
          })}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>Timetable</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/attendance" as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
            borderRadius: 8,
            padding: 16,
          })}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>Attendance</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/timesheet" as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
            borderRadius: 8,
            padding: 16,
          })}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>Timesheet</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(drawer)/chat" as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
            borderRadius: 8,
            padding: 16,
          })}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>Chat App</Text>
        </Pressable>
      </View>
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#fff",
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
            title: "Home",
          }}
        />
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: "Chat App",
            title: "Chat App",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
