import { Drawer } from "expo-router/drawer";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthData,
  selectAuthLogin,
} from "../../lib/features/loginSlice";
import { AuthenServices } from "../../services/auth/authenServices";
import Toast from "react-native-toast-message";

export default function DrawerLayout() {
  const auth = useSelector(selectAuthLogin);
  const dispatch = useDispatch();

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await AuthenServices.logout();
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } catch (error: any) {
      console.error("Error during logout:", error);
      Toast.show({
        type: "error",
        text1: "Không thể gọi API. Đã đăng xuất khỏi thiết bị.",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } finally {
      dispatch(clearAuthData());
      await AsyncStorage.clear();
      router.replace("/(auth)/login" as any);
    }
  }, [dispatch]);

  // Custom drawer content
  const renderDrawerContent = useCallback(() => {
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
          Student Portal
          </Text>

              <Pressable
          onPress={() => router.push("/(student)/(tabs)" as any)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0f0f0" : "transparent",
                  borderRadius: 8,
                  padding: 16,
                })}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>Home</Text>
              </Pressable>

              <Pressable
          onPress={() => router.push("/(student)/(tabs)/student-home" as any)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0f0f0" : "transparent",
                  borderRadius: 8,
                  padding: 16,
                })}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>Profile</Text>
              </Pressable>

              <Pressable
          onPress={() => router.push("/(student)/(tabs)/timetable" as any)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0f0f0" : "transparent",
                  borderRadius: 8,
                  padding: 16,
                })}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>Timetable</Text>
              </Pressable>

              <Pressable
          onPress={() => router.push("/(student)/(tabs)/attendance" as any)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0f0f0" : "transparent",
                  borderRadius: 8,
                  padding: 16,
                })}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>Attendance</Text>
              </Pressable>

              <Pressable
          onPress={() => router.push("/(student)/chat" as any)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0f0f0" : "transparent",
                  borderRadius: 8,
                  padding: 16,
                })}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>Chat App</Text>
              </Pressable>

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
  }, [handleLogout]);

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
