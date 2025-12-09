import { Drawer } from "expo-router/drawer";
import React, { useCallback } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, selectAuthLogin } from "../../lib/features/loginSlice";
import { AuthenServices } from "../../services/auth/authenServices";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const palette = {
  primary: "#3674B5",
  subtitle: "#6B7280",
  text: "#1F2933",
  danger: "#ff4d4f",
};

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
      <View style={styles.drawerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Student Portal</Text>
          <Text style={styles.headerSubtitle}>
            {auth?.userProfile?.userName || "Sinh viên"}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(student)/(tabs)" as any)}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="home"
            size={22}
            color={palette.primary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Home</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(student)/(tabs)/timetable" as any)}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-clock"
            size={22}
            color={palette.primary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Thời khóa biểu</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(student)/(tabs)/my-credentials" as any)}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="certificate"
            size={22}
            color={palette.primary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Chứng chỉ của tôi</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push("/(student)/(tabs)/attendance-report" as any)
          }
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="account-check"
            size={22}
            color={palette.primary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Báo cáo điểm danh</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(student)/(tabs)/mark-report" as any)}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="chart-box"
            size={22}
            color={palette.primary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Bảng điểm</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(student)/(tabs)/roadmap" as any)}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="map-marker-path"
            size={22}
            color={palette.primary}
            style={styles.menuIcon}
          />
          <Text style={styles.menuItemText}>Lộ trình học</Text>
        </Pressable>

        <View style={styles.logoutContainer}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <MaterialCommunityIcons name="logout" size={22} color={palette.danger} />
            <Text style={styles.logoutText}>Logout</Text>
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
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.subtitle,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  menuIcon: {
    color: palette.primary,
    marginRight: 12,
  },
  menuItemPressed: {
    backgroundColor: "#f0f5ff",
  },
  menuItemText: {
    fontSize: 16,
    color: palette.text,
    fontWeight: "500",
  },
  logoutContainer: {
    marginTop: "auto",
    padding: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ffccc7",
  },
  logoutButtonPressed: {
    backgroundColor: "#fff4f0",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.danger,
  },
});
