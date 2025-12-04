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
  const auth = useSelector(selectAuthLogin);

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

  const quickActions = useMemo(
    () => [
      {
        title: "Thời khóa biểu",
        icon: "calendar-blank",
        gradient: ["#5FA8F5", "#3674B5"],
        onPress: () => router.push("/(student)/(tabs)/timetable" as any),
      },
      {
        title: "Chứng chỉ của tôi",
        icon: "shield-check",
        gradient: ["#BC99FF", "#8155E5"],
        onPress: () => router.push("/(student)/(tabs)/my-credentials" as any),
      },
      {
        title: "Báo cáo điểm danh",
        icon: "clipboard-text-outline",
        gradient: ["#f9a8d4", "#ec4899"],
        onPress: () =>
          router.push("/(student)/(tabs)/attendance-report" as any),
      },
      {
        title: "Bảng điểm",
        icon: "file-document",
        gradient: ["#FBCF6A", "#F7931A"],
        onPress: () => router.push("/(student)/(tabs)/mark-report" as any),
      },
      {
        title: "Lộ trình học",
        icon: "route",
        gradient: ["#34d399", "#059669"],
        onPress: () => router.push("/(student)/(tabs)/roadmap" as any),
      },
    ],
    []
  );

  const statsCards = useMemo(
    () => [
      {
        title: "Tổng chứng chỉ",
        value: "08",
        trend: "+2 tháng này",
        color: "#5FA8F5",
        icon: "file-document",
      },
      {
        title: "Đã xác thực",
        value: "06",
        trend: "75% hợp lệ",
        color: "#53D769",
        icon: "check-circle",
      },
      {
        title: "Đang chờ xử lý",
        value: "02",
        trend: "Cần xem lại",
        color: "#FFB347",
        icon: "clock-outline",
      },
    ],
    []
  );

  const recentCredentials = useMemo(
    () => [
      {
        id: "deg_01",
        title: "Bachelor of Software Engineering",
        issuer: "FPT University",
        status: "Hoạt động",
        statusColor: palette.success,
        issueDate: "15/06/2024",
        icon: "medal-outline",
      },
      {
        id: "cert_02",
        title: "React Advanced Certification",
        issuer: "Meta",
        status: "Đang chờ",
        statusColor: palette.warning,
        issueDate: "28/02/2024",
        icon: "shield-check-outline",
      },
      {
        id: "trans_03",
        title: "Academic Transcript - Spring 2024",
        issuer: "FPT University",
        status: "Hoạt động",
        statusColor: palette.secondary,
        issueDate: "10/01/2024",
        icon: "book-open-variant",
      },
    ],
    []
  );

  const recentActivities = useMemo(
    () => [
      {
        id: 1,
        title: "Chứng chỉ được xác thực",
        description: "Bằng cử nhân đã được xác thực bởi TechCorp Vietnam",
        time: "2 giờ trước",
        icon: "check-circle",
        color: palette.success,
      },
      {
        id: 2,
        title: "Mã QR được tạo",
        description: "AWS Cloud Practitioner đã sẵn sàng chia sẻ",
        time: "1 ngày trước",
        icon: "qrcode",
        color: palette.primary,
      },
      {
        id: 3,
        title: "Chứng chỉ mới được cấp",
        description: "Bảng điểm học kỳ Spring 2024 vừa cập nhật",
        time: "3 ngày trước",
        icon: "file-document",
        color: palette.secondary,
      },
    ],
    []
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Thành công", "Dashboard đã được cập nhật.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể làm mới dữ liệu. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  }, []);

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
                {auth?.userProfile?.role || "STUDENT"}
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
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push("/(student)/(tabs)/student-home" as any)}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color="#fff"
            />
            <Text style={styles.heroButtonText}>Chia sẻ chứng chỉ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroButton, styles.heroButtonOutline]}
            onPress={() => router.push("/public-portal" as any)}
          >
            <MaterialCommunityIcons
              name="qrcode"
              size={20}
              color={palette.primary}
            />
            <Text style={[styles.heroButtonText, { color: palette.primary }]}>
              Tạo mã QR
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hiệu suất học tập</Text>
          <Chip
            compact
            onPress={() => router.push("/(student)/(tabs)/mark-report" as any)}
          >
            Xem chi tiết
          </Chip>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
        >
          {statsCards.map((card) => (
            <Card key={card.title} style={styles.statCard} elevation={2}>
              <View style={styles.statCardHeader}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: `${card.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={card.icon as any}
                    size={22}
                    color={card.color}
                  />
                </View>
                <Text style={[styles.statTrend, { color: card.color }]}>
                  {card.trend}
                </Text>
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.title}</Text>
              <ProgressBar
                progress={0.75}
                color={card.color}
                style={{ marginTop: 12, borderRadius: 4 }}
              />
            </Card>
          ))}
        </ScrollView>
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
                router.push("/(student)/(tabs)/student-home" as any)
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
                    name={item.icon as any}
                    size={22}
                    color={palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.credentialTitle}>{item.title}</Text>
                  <Text style={styles.credentialIssuer}>{item.issuer}</Text>
                  <Text style={styles.credentialDate}>{item.issueDate}</Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: `${item.statusColor}20` }}
                  textStyle={{ color: item.statusColor, fontWeight: "600" }}
                >
                  {item.status}
                </Chip>
              </View>
              {index !== recentCredentials.length - 1 && (
                <Divider style={{ marginVertical: 12 }} />
              )}
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Card style={styles.sectionCard} elevation={2}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động mới nhất</Text>
            <Chip compact>Nhật ký</Chip>
          </View>
          {recentActivities.map((activity) => (
            <List.Item
              key={activity.id}
              title={activity.title}
              description={activity.description}
              descriptionNumberOfLines={2}
              titleStyle={styles.activityTitle}
              descriptionStyle={styles.activityDescription}
              right={() => (
                <Text style={styles.activityTime}>{activity.time}</Text>
              )}
              left={() => (
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${activity.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={activity.icon as any}
                    size={20}
                    color={activity.color}
                  />
                </View>
              )}
            />
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
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  heroButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroButtonOutline: {
    backgroundColor: "#fff",
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  statCard: {
    width: 220,
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.surface,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statTrend: {
    fontWeight: "600",
    fontSize: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 12,
    color: palette.text,
  },
  statLabel: {
    color: palette.subtitle,
    marginTop: 4,
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
