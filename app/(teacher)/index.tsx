import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  error: "#FF6B6B",
  background: "#F1F5FF",
  card: "#FFFFFF",
  surface: "#F7FAFF",
  text: "#1F2933",
  subtitle: "#6B7280",
};

export default function TeacherHomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const auth = useSelector(selectAuthLogin);

  const quickActions = useMemo(
    () => [
      {
        title: "Lịch giảng dạy",
        icon: "calendar-clock",
        gradient: ["#5FA8F5", "#3674B5"],
        onPress: () => {
          router.push("/(teacher)/schedule" as any);
        },
      },
      {
        title: "Điểm danh",
        icon: "account-check",
        gradient: ["#5FE3A1", "#31B679"],
        onPress: () => {
          // Navigate to attendance screen - cần có slotId từ lịch giảng dạy
          Alert.alert(
            "Thông báo",
            "Vui lòng chọn slot từ lịch giảng dạy để điểm danh"
          );
        },
      },
      {
        title: "Chấm điểm",
        icon: "file-document-edit",
        gradient: ["#FBCF6A", "#F7931A"],
        onPress: () => {
          Alert.alert("Thông báo", "Tính năng đang phát triển");
        },
      },
      {
        title: "Lớp giảng dạy",
        icon: "book-open-variant",
        gradient: ["#BC99FF", "#8155E5"],
        onPress: () => {
          Alert.alert("Thông báo", "Tính năng đang phát triển");
        },
      },
    ],
    []
  );

  const statsCards = useMemo(
    () => [
      {
        title: "Lớp đang dạy",
        value: "05",
        trend: "Học kỳ này",
        color: "#5FA8F5",
        icon: "book-open-page-variant",
      },
      {
        title: "Sinh viên",
        value: "120",
        trend: "Tổng số",
        color: "#53D769",
        icon: "account-group",
      },
      {
        title: "Ca dạy tuần",
        value: "12",
        trend: "Tuần này",
        color: "#FFB347",
        icon: "calendar-check",
      },
    ],
    []
  );

  const upcomingClasses = useMemo(
    () => [
      {
        id: "1",
        classCode: "CS101.W25.A",
        subjectName: "Programming Fundamentals",
        time: "07:30 - 09:20",
        date: "Hôm nay",
        status: "Sắp diễn ra",
        statusColor: palette.primary,
        icon: "clock-outline",
      },
      {
        id: "2",
        classCode: "CS102.W25.B",
        subjectName: "Data Structures",
        time: "09:30 - 11:20",
        date: "Hôm nay",
        status: "Sắp diễn ra",
        statusColor: palette.primary,
        icon: "clock-outline",
      },
      {
        id: "3",
        classCode: "CS101.W25.A",
        subjectName: "Programming Fundamentals",
        time: "12:30 - 14:20",
        date: "Ngày mai",
        status: "Chưa điểm danh",
        statusColor: palette.warning,
        icon: "alert-circle-outline",
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

  const handleClassPress = (classItem: (typeof upcomingClasses)[0]) => {
    // Navigate to schedule screen - user can select slot from there
    router.push("/(teacher)/schedule" as any);
  };

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
        <View style={styles.heroContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>Chào mừng trở lại</Text>
            <Text style={styles.heroName}>
              {auth?.userProfile?.userName || "Giảng viên"}
            </Text>
            <Text style={styles.heroSubtitle}>
              Quản lý lớp học, điểm danh và chấm điểm ngay tại đây.
            </Text>
            <View style={styles.heroChips}>
              <Chip
                textStyle={{ color: "#fff", fontWeight: "600" }}
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                {auth?.userProfile?.role || "TEACHER"}
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
            label={(auth?.userProfile?.userName || "GV")
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
          <Text style={styles.sectionTitle}>Thống kê</Text>
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
            <Text style={styles.sectionTitle}>Lớp sắp diễn ra</Text>
            <Chip compact>Hôm nay</Chip>
          </View>
          {upcomingClasses.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleClassPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.classRow}>
                <View style={styles.classIcon}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classTitle}>{item.classCode}</Text>
                  <Text style={styles.classSubject}>{item.subjectName}</Text>
                  <Text style={styles.classTime}>
                    {item.time} • {item.date}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: `${item.statusColor}20` }}
                  textStyle={{ color: item.statusColor, fontWeight: "600" }}
                >
                  {item.status}
                </Chip>
              </View>
              {index !== upcomingClasses.length - 1 && (
                <Divider style={{ marginVertical: 12 }} />
              )}
            </TouchableOpacity>
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
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(54,116,181,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  classTitle: {
    fontWeight: "600",
    color: palette.text,
    fontSize: 15,
  },
  classSubject: {
    color: palette.subtitle,
    fontSize: 13,
    marginTop: 2,
  },
  classTime: {
    color: palette.subtitle,
    fontSize: 12,
    marginTop: 4,
  },
});
