import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface DashboardStats {
  totalCredentials: number;
  verifiedCredentials: number;
  pendingCredentials: number;
  recentVerifications: number;
}

export default function StudentHomePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);

  // Mock data - trong thực tế sẽ lấy từ API
  const dashboardStats: DashboardStats = {
    totalCredentials: 8,
    verifiedCredentials: 6,
    pendingCredentials: 2,
    recentVerifications: 15,
  };

  useEffect(() => {
    console.log("StudentHomePage mounted", auth);
    if (auth?.userProfile) {
      console.log("User from Redux:", auth.userProfile);
    }
  }, [auth]);

  const quickAccessItems = [
    {
      title: "My Degrees",
      icon: "Trophy",
      color: "#52c41a",
      backgroundColor: "#f6ffed",
      onPress: () => router.push("/(drawer)/credentials" as any),
    },
    {
      title: "Transcripts",
      icon: "Book",
      color: "#722ed1",
      backgroundColor: "#f0f5ff",
      onPress: () => router.push("/(drawer)/transcripts" as any),
    },
    {
      title: "Certificates",
      icon: "SafetyCertificate",
      color: "#1890ff",
      backgroundColor: "#e6f7ff",
      onPress: () => router.push("/(drawer)/certificates" as any),
    },
    {
      title: "Share Portal",
      icon: "ShareAlt",
      color: "#fa8c16",
      backgroundColor: "#fff7e6",
      onPress: () => router.push("/(drawer)/share" as any),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Welcome Header */}
      <LinearGradient colors={["#1890ff", "#40a9ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
            <Text style={styles.userName}>
              {auth?.userProfile?.userName || "Sinh viên"}
            </Text>
            <Text style={styles.userCode}>
              {auth?.userProfile?.code || "Mã sinh viên"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(drawer)/share" as any)}
            >
              <AntDesign name="ShareAlt" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => router.push("/(drawer)/qr-generator" as any)}
            >
              <AntDesign name="Qrcode" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="FileText1" size={24} color="#1890ff" />
              </View>
              <Text style={styles.statNumber}>
                {dashboardStats.totalCredentials}
              </Text>
              <Text style={styles.statLabel}>Tổng Credentials</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>+2 tháng này</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="checkcircleo" size={24} color="#52c41a" />
              </View>
              <Text style={styles.statNumber}>
                {dashboardStats.verifiedCredentials}
              </Text>
              <Text style={styles.statLabel}>Đã xác thực</Text>
              <View style={styles.statProgress}>
                <View
                  style={[
                    styles.statProgressBar,
                    {
                      width: `${
                        (dashboardStats.verifiedCredentials /
                          dashboardStats.totalCredentials) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="clockcircleo" size={24} color="#faad14" />
              </View>
              <Text style={styles.statNumber}>
                {dashboardStats.pendingCredentials}
              </Text>
              <Text style={styles.statLabel}>Chờ duyệt</Text>
              <View style={styles.statBadge}>
                <Text style={[styles.statBadgeText, { color: "#faad14" }]}>
                  Đang xử lý
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="eye" size={24} color="#722ed1" />
              </View>
              <Text style={styles.statNumber}>
                {dashboardStats.recentVerifications}
              </Text>
              <Text style={styles.statLabel}>Xác thực gần đây</Text>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <AntDesign name="Trophy" size={20} color="#fa541c" />
              <Text style={styles.sectionTitleText}>Truy Cập Nhanh</Text>
            </View>
          </View>

          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAccessItem}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.quickAccessIcon,
                    { backgroundColor: item.backgroundColor },
                  ]}
                >
                  <AntDesign
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                <Text style={styles.quickAccessTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  userCode: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    gap: 2,
  },
  primaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  content: {
    padding: 12,
    flex: 1,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#8c8c8c",
    textAlign: "center",
    marginBottom: 4,
  },
  statBadge: {
    backgroundColor: "#e6f7ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statBadgeText: {
    fontSize: 10,
    color: "#1890ff",
    fontWeight: "500",
  },
  statProgress: {
    width: "100%",
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  statProgressBar: {
    height: "100%",
    backgroundColor: "#52c41a",
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
  },
  sectionAction: {
    fontSize: 14,
    color: "#1890ff",
    fontWeight: "500",
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickAccessItem: {
    width: (width - 56) / 2,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#262626",
    textAlign: "center",
  },
});
