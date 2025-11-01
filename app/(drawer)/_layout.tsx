import { Drawer } from "expo-router/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../lib/features/loginSlice";

export default function DrawerLayout() {
  const auth = useSelector(selectAuthLogin);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem("role");
      setUserRole(role);
    };
    loadRole();
  }, [auth]);

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
  const renderDrawerContent = useCallback(
    (props: any) => {
      const role = userRole || auth?.userProfile?.role;
      const isVerifier = role === "VERIFIER" || role === "GUEST";

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
            {isVerifier ? "Verifier Portal" : "Student Portal"}
          </Text>

          {isVerifier ? (
            // Verifier Menu
            <>
              <Pressable
                onPress={() => router.push("/(drawer)/(tabs)/verifier" as any)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0f0f0" : "transparent",
                  borderRadius: 8,
                  padding: 16,
                })}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>
                  Verification Portal
                </Text>
              </Pressable>
            </>
          ) : (
            // Student Menu
            <>
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
                onPress={() =>
                  router.push("/(drawer)/(tabs)/student-home" as any)
                }
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
                onPress={() =>
                  router.push("/(drawer)/(tabs)/attendance" as any)
                }
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
            </>
          )}

          {/* Logout button for both */}
          <View style={{ marginTop: "auto", padding: 16 }}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#ffebee" : "#fff",
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: "#ff4d4f",
              })}
            >
              <Text
                style={{ fontSize: 16, color: "#ff4d4f", fontWeight: "600" }}
              >
                Logout
              </Text>
            </Pressable>
          </View>
        </View>
      );
    },
    [userRole, auth, handleLogout]
  );

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
