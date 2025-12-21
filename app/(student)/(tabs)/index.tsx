import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Avatar,
  Card,
  Chip,
  Divider,
  List,
  ProgressBar,
} from "react-native-paper";
import { StudentCredentialServices } from "@/services/student/credentialServices";
import { StudentAttendanceServices } from "@/services/student/attendanceServices";
import { RoadmapServices } from "@/services/student/roadmapServices";
import type { StudentCredentialDto } from "@/types/credential";
import type { AttendanceStatisticsDto } from "@/types/attendance";
import type { CurriculumRoadmapSummaryDto } from "@/types/roadmap";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  success: "#4CAF50",
  warning: "#FFB347",
  background: "#F1F5FF",
  card: "#FFFFFF",
  surface: "#F7FAFF",
  text: "#1F2933",
  subtitle: "#6B7280",
};

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const auth = useSelector(selectAuthLogin);
  const [credentials, setCredentials] = useState<StudentCredentialDto[]>([]);
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStatisticsDto | null>(null);
  const [roadmapSummary, setRoadmapSummary] =
    useState<CurriculumRoadmapSummaryDto | null>(null);

  useEffect(() => {
    const ensureStudentRole = async () => {
      const role =
        (await AsyncStorage.getItem("role")) || auth?.userProfile?.role;
      if (role === "VERIFIER" || role === "GUEST") {
        router.replace("/public-portal" as any);
      }
    };
    ensureStudentRole();
  }, [auth]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const role = (
        (await AsyncStorage.getItem("role")) ||
        auth?.userProfile?.role ||
        ""
      )
        .toString()
        .toUpperCase();
      const isStudent = role === "STUDENT";

      const [creds, attendance, roadmap] = await Promise.all([
        StudentCredentialServices.getMyCredentials().catch((err) => {
          console.warn("Failed to load credentials", err);
          return [] as StudentCredentialDto[];
        }),
        isStudent
          ? StudentAttendanceServices.getMyAttendanceStatistics().catch(
              (err) => {
                console.warn("Failed to load attendance stats", err);
                return null as AttendanceStatisticsDto | null;
              }
            )
          : Promise.resolve(null as AttendanceStatisticsDto | null),
        isStudent
          ? RoadmapServices.getMyCurriculumRoadmapSummary().catch((err) => {
              console.warn("Failed to load roadmap summary", err);
              return null as CurriculumRoadmapSummaryDto | null;
            })
          : Promise.resolve(null as CurriculumRoadmapSummaryDto | null),
      ]);
      setCredentials(creds);
      setAttendanceStats(attendance);
      setRoadmapSummary(roadmap);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const quickActions = useMemo(
    () => [
      {
        title: "Thời khóa biểu",
        icon: "calendar-clock",
        gradient: ["#5FA8F5", "#3674B5"],
        onPress: () => router.push("/(student)/(tabs)/timetable" as any),
      },
      {
        title: "Chứng chỉ của tôi",
        icon: "certificate",
        gradient: ["#BC99FF", "#8155E5"],
        onPress: () => router.push("/(student)/(tabs)/my-credentials" as any),
      },
      {
        title: "Báo cáo điểm danh",
        icon: "account-check",
        gradient: ["#f9a8d4", "#ec4899"],
        onPress: () =>
          router.push("/(student)/(tabs)/attendance-report" as any),
      },
      {
        title: "Bảng điểm",
        icon: "chart-box",
        gradient: ["#FBCF6A", "#F7931A"],
        onPress: () => router.push("/(student)/(tabs)/mark-report" as any),
      },
      {
        title: "Lộ trình học",
        icon: "map-marker-path",
        gradient: ["#34d399", "#059669"],
        onPress: () => router.push("/(student)/(tabs)/roadmap" as any),
      },
    ],
    []
  );

  const statsCards = useMemo(() => {
    const totalCredentials = credentials.length;
    const issued = credentials.filter((c) => c.status === "Issued").length;
    const blockchain = credentials.filter((c) => c.isOnBlockchain).length;
    const attendanceRate =
      attendanceStats?.attendanceRate != null
        ? Math.round(attendanceStats.attendanceRate)
        : null;
    const issuedPercentage =
      totalCredentials > 0
        ? Math.round((issued / Math.max(totalCredentials, 1)) * 100)
        : 0;

    return [
      {
        title: "Tổng chứng chỉ",
        value: totalCredentials.toString(),
        badge:
          blockchain > 0
            ? `${blockchain} trên blockchain`
            : "Chưa có blockchain",
        color: "#5FA8F5",
        icon: "file-document",
        progress: totalCredentials > 0 ? blockchain / totalCredentials : 0,
        gradient: ["#e0ecff", "#f0f9ff"],
      },
      {
        title: "Đã phát hành",
        value: issued.toString(),
        badge: totalCredentials > 0 ? `${issuedPercentage}% tổng số` : "—",
        color: "#22c55e",
        icon: "check-circle",
        progress: issuedPercentage / 100,
        gradient: ["#dcfce7", "#f0fdf4"],
      },
    ];
  }, [credentials, attendanceStats]);

  const recentCredentials = useMemo(() => {
    const sorted = [...credentials].sort(
      (a, b) =>
        new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
    );
    return sorted.slice(0, 3);
  }, [credentials]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch {
      Alert.alert("Lỗi", "Không thể làm mới dữ liệu. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData]);

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: palette.background },
      ]}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[palette.primary]}
          tintColor={palette.primary}
        />
      }
    >
      <LinearGradient
        colors={[palette.primary, palette.secondary]}
        style={styles.hero}
      >
        <View style={styles.heroHeader}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(student)/(tabs)/profile" as any)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.heroContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>Chào mừng trở lại</Text>
            <Text style={styles.heroName}>
              {auth?.userProfile?.userName || "Sinh viên UAP"}
            </Text>
            <Text style={styles.heroSubtitle}>
              Quản lý chứng chỉ & hoạt động học tập của bạn ngay tại đây.
            </Text>
            <View style={styles.heroChips}>
              <Chip
                textStyle={{ color: "#fff", fontWeight: "600" }}
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                Học sinh
              </Chip>
              {auth?.userProfile?.code && (
                <Chip
                  textStyle={{ color: "#fff" }}
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  {auth.userProfile.code}
                </Chip>
              )}
            </View>
          </View>
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
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons
              name="chart-line"
              size={20}
              color={palette.primary}
            />
            <Text style={styles.sectionTitle}>Hiệu suất học tập</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(student)/(tabs)/mark-report" as any)}
          >
            <Text style={styles.viewDetailText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.performanceGrid}>
          {statsCards.map((card) => (
            <LinearGradient
              key={card.title}
              colors={card.gradient as [string, string]}
              style={styles.performanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.performanceCardHeader}>
                <View
                  style={[styles.performanceIcon, { backgroundColor: "#fff" }]}
                >
                  <MaterialCommunityIcons
                    name={card.icon as any}
                    size={20}
                    color={card.color}
                  />
                </View>
                <View style={styles.performanceBadge}>
                  <Text
                    style={[styles.performanceBadgeText, { color: card.color }]}
                  >
                    {card.badge}
                  </Text>
                </View>
              </View>
              <Text style={styles.performanceValue}>{card.value}</Text>
              <Text style={styles.performanceLabel}>{card.title}</Text>
              <View style={styles.performanceProgressContainer}>
                <View
                  style={[
                    styles.performanceProgressBar,
                    {
                      width: `${card.progress * 100}%`,
                      backgroundColor: card.color,
                    },
                  ]}
                />
              </View>
            </LinearGradient>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lối tắt nhanh</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={styles.quickActionCard}
              onPress={action.onPress}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={action.gradient as [string, string]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialCommunityIcons
                    name={action.icon as any}
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Card style={styles.sectionCard} elevation={2}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chứng chỉ gần đây</Text>
            <Chip
              compact
              onPress={() =>
                router.push("/(student)/(tabs)/my-credentials" as any)
              }
            >
              Xem tất cả
            </Chip>
          </View>
          {recentCredentials.map((item, index) => (
            <View key={item.id}>
              <View style={styles.credentialRow}>
                <View style={styles.credentialIcon}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={22}
                    color={palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.credentialTitle}>
                    {item.subjectName ||
                      item.roadmapName ||
                      item.certificateType}
                  </Text>
                  <Text style={styles.credentialIssuer}>
                    {item.semesterName || item.studentName || ""}
                  </Text>
                  <Text style={styles.credentialDate}>
                    {new Date(item.issuedDate).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: "rgba(54,116,181,0.12)" }}
                  textStyle={{ color: palette.primary, fontWeight: "600" }}
                >
                  {item.status === "Issued"
                    ? "Đã phát hành"
                    : item.status === "Pending"
                    ? "Đang xử lý"
                    : item.status === "Revoked"
                    ? "Đã thu hồi"
                    : item.status}
                </Chip>
              </View>
              {index !== recentCredentials.length - 1 && (
                <Divider style={{ marginVertical: 12 }} />
              )}
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroGreeting: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
  },
  heroName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    lineHeight: 20,
  },
  heroChips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  viewDetailText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.primary,
  },
  performanceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  performanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  performanceBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    maxWidth: "60%",
  },
  performanceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: "800",
    color: palette.text,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 13,
    color: palette.subtitle,
    fontWeight: "600",
    marginBottom: 12,
  },
  performanceProgressContainer: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  performanceProgressBar: {
    height: "100%",
    borderRadius: 3,
  },
  quickActionCard: {
    width: 160,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: palette.surface,
  },
  quickActionGradient: {
    padding: 16,
    minHeight: 110,
    justifyContent: "space-between",
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 20,
    padding: 12,
    backgroundColor: palette.card,
  },
  credentialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  credentialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(54,116,181,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  credentialTitle: {
    fontWeight: "600",
    color: palette.text,
  },
  credentialIssuer: {
    color: palette.subtitle,
    fontSize: 13,
  },
  credentialDate: {
    color: palette.subtitle,
    fontSize: 12,
    marginTop: 4,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  activityTitle: {
    fontWeight: "600",
    color: palette.text,
  },
  activityDescription: {
    color: palette.subtitle,
  },
  activityTime: {
    color: palette.subtitle,
    fontSize: 12,
    alignSelf: "center",
  },
});
