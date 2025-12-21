import { Drawer } from "expo-router/drawer";
import React, { useCallback } from "react";
import { Alert, Pressable, Text, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, selectAuthLogin } from "../../lib/features/loginSlice";
import { AuthenServices } from "../../services/auth/authenServices";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "react-native-paper";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  background: "#F1F5FF",
  card: "#FFFFFF",
  text: "#1F2933",
  subtitle: "#6B7280",
};

export default function DrawerLayout() {
  const auth = useSelector(selectAuthLogin);
  const dispatch = useDispatch();

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await AuthenServices.logout();
    } catch (error: any) {
      const status = error?.response?.status;
      // Nếu token hết hạn (401) coi như đã đăng xuất thành công
      if (status !== 401) {
        console.error("Error during logout:", error);
        Toast.show({
          type: "error",
          text1: "Không thể gọi API. Đã đăng xuất khỏi thiết bị.",
          text1Style: { textAlign: "center", fontSize: 16 },
        });
      }
    } finally {
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      dispatch(clearAuthData());
      await AsyncStorage.clear();
      router.replace("/(auth)/login" as any);
    }
  }, [dispatch]);

  // Custom drawer content
  const renderDrawerContent = useCallback(() => {
    return (
      <View style={styles.drawerContainer}>
        {/* Drawer Header */}
        <LinearGradient
          colors={[palette.primary, palette.secondary]}
          style={styles.drawerHeader}
        >
          <Avatar.Text
            size={64}
            label={(auth?.userProfile?.userName || "SV")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            labelStyle={{ color: "#fff", fontWeight: "600" }}
          />
          <Text style={styles.drawerUserName}>
            {auth?.userProfile?.userName || "Sinh viên"}
          </Text>
          <Text style={styles.drawerUserCode}>
            {auth?.userProfile?.code || ""}
          </Text>
          <View style={styles.drawerRoleBadge}>
            <Text style={styles.drawerRoleText}>
              {auth?.userProfile?.role || "STUDENT"}
            </Text>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Pressable
            onPress={() => router.push("/(student)/(tabs)" as any)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="home"
              size={24}
              color={palette.primary}
            />
            <Text style={styles.menuItemText}>Trang chủ</Text>
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
              size={24}
              color={palette.primary}
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
              size={24}
              color={palette.primary}
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
              size={24}
              color={palette.primary}
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
              size={24}
              color={palette.primary}
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
              size={24}
              color={palette.primary}
            />
            <Text style={styles.menuItemText}>Lộ trình học</Text>
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={() => router.push("/(student)/(tabs)/profile" as any)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={palette.primary}
            />
            <Text style={styles.menuItemText}>Thông tin cá nhân</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert("Thông báo", "Tính năng đang phát triển");
            }}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color={palette.subtitle}
            />
            <Text style={[styles.menuItemText, { color: palette.subtitle }]}>
              Cài đặt
            </Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#ff4d4f" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </Pressable>
        </View>
      </View>
    );
  }, [auth, handleLogout]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: palette.card,
            width: 280,
          },
          drawerActiveTintColor: palette.primary,
          drawerInactiveTintColor: palette.subtitle,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Trang chủ",
            title: "Trang chủ",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: palette.card,
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: "center",
  },
  drawerUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  drawerUserCode: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  drawerRoleBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  drawerRoleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  menuItemPressed: {
    backgroundColor: palette.background,
  },
  menuItemText: {
    fontSize: 16,
    color: palette.text,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
    marginHorizontal: 20,
  },
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff1f0",
    borderWidth: 1,
    borderColor: "#ffccc7",
    gap: 12,
  },
  logoutButtonPressed: {
    backgroundColor: "#ffe7e5",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff4d4f",
  },
});
