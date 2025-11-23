import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { AntDesign } from "@expo/vector-icons";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);

  useEffect(() => {
    console.log("ProfilePage mounted", auth);
  }, [auth]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace("/login" as any);
          } catch (error) {
            console.error("Error during logout:", error);
            router.replace("/login" as any);
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: "Thông tin cá nhân",
      icon: "user",
      onPress: () => {
        // Navigate to personal info
        Alert.alert("Thông tin", "Tính năng đang phát triển");
      },
    },
    {
      title: "Thời khóa biểu",
      icon: "calendar",
      onPress: () => router.push("/(drawer)/(tabs)/timetable" as any),
    },
    {
      title: "Điểm danh",
      icon: "checkcircle",
      onPress: () => router.push("/(drawer)/(tabs)/attendance" as any),
    },
    {
      title: "Bảng điểm",
      icon: "barschart",
      onPress: () => {
        Alert.alert("Bảng điểm", "Tính năng đang phát triển");
      },
    },
    {
      title: "Cài đặt",
      icon: "setting",
      onPress: () => {
        Alert.alert("Cài đặt", "Tính năng đang phát triển");
      },
    },
    {
      title: "Đăng xuất",
      icon: "logout",
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <AntDesign name="user" size={40} color="#FF6600" />
            </View>
          </View>
          <Text style={styles.userName}>
            {auth?.userProfile?.userName || "Sinh viên"}
          </Text>
          <Text style={styles.userCode}>
            {auth?.userProfile?.code || "Mã sinh viên"}
          </Text>
          {auth?.userProfile?.email && (
            <Text style={styles.userEmail}>{auth.userProfile.email}</Text>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIconContainer,
                    item.isDestructive && styles.destructiveIconContainer,
                  ]}
                >
                  <AntDesign
                    name={item.icon as any}
                    size={20}
                    color={item.isDestructive ? "#ff4d4f" : "#FF6600"}
                  />
                </View>
                <Text
                  style={[
                    styles.menuItemText,
                    item.isDestructive && styles.destructiveText,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <AntDesign
                name="right"
                size={16}
                color={item.isDestructive ? "#ff4d4f" : "#8c8c8c"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>FPT University</Text>
          <Text style={styles.appVersionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 65, // Space for bottom nav
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF7F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF6600",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  userCode: {
    fontSize: 14,
    color: "#8c8c8c",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#595959",
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF7F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destructiveIconContainer: {
    backgroundColor: "#FFF1F0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#262626",
    flex: 1,
  },
  destructiveText: {
    color: "#ff4d4f",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: "#8c8c8c",
    marginBottom: 4,
  },
  appVersionText: {
    fontSize: 12,
    color: "#bfbfbf",
  },
});
