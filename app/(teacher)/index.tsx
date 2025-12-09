import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DrawerActions, useNavigation } from "@react-navigation/native";
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
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, selectAuthLogin } from "../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthenServices } from "../../services/auth/authenServices";
import { TeacherServices } from "@/services/teacher/teacherServices";
import type { WeeklyScheduleDto, ScheduleItemDto } from "@/types/schedule";
import Toast from "react-native-toast-message";
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
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeeklyScheduleDto | null>(null);
  const auth = useSelector(selectAuthLogin);
  const dispatch = useDispatch();

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
          // Đưa về lịch giảng dạy để chọn slot và mở điểm danh (tương tự web)
          router.push("/(teacher)/schedule" as any);
        },
      },
      {
        title: "Chấm điểm",
        icon: "file-document-edit",
        gradient: ["#FBCF6A", "#F7931A"],
        onPress: () => {
          router.push("/(teacher)/grading" as any);
        },
      },
      {
        title: "Lớp giảng dạy",
        icon: "book-open-variant",
        gradient: ["#BC99FF", "#8155E5"],
        onPress: () => {
          router.push("/(teacher)/classes" as any);
        },
      },
    ],
    []
  );

  const allSlots = useMemo<ScheduleItemDto[]>(() => {
    if (!schedule?.days) return [];
    return schedule.days.flatMap((d) => d.slots || []);
  }, [schedule]);

  const statsCards = useMemo(() => {
    const classMap = new Map<string, number>();
    allSlots.forEach((slot) => {
      if (!slot.classId) return;
      const current = classMap.get(slot.classId) ?? 0;
      const students = slot.totalStudents ?? 0;
      classMap.set(slot.classId, Math.max(current, students));
    });
    const totalClasses = classMap.size;
    const totalStudents = Array.from(classMap.values()).reduce(
      (sum, v) => sum + v,
      0
    );
    const totalSlots = schedule?.totalSlots ?? allSlots.length;

    return [
      {
        title: "Lớp đang dạy",
        value: totalClasses.toString(),
        trend: schedule?.weekLabel || "Tuần hiện tại",
        color: "#5FA8F5",
        icon: "book-open-page-variant",
      },
      {
        title: "Sinh viên",
        value: totalStudents.toString(),
        trend: "Ước tính theo lịch",
        color: "#53D769",
        icon: "account-group",
      },
      {
        title: "Ca dạy tuần",
        value: totalSlots.toString(),
        trend: "Theo lịch tuần",
        color: "#FFB347",
        icon: "calendar-check",
      },
    ];
  }, [allSlots, schedule]);

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    const parsed = allSlots
      .map((slot) => {
        const startIso = slot.startTime
          ? `${slot.date}T${slot.startTime}`
          : `${slot.date}T00:00`;
        const dt = new Date(startIso);
        return { slot, dt };
      })
      .filter((item) => !Number.isNaN(item.dt.getTime()) && item.dt >= now)
      .sort((a, b) => a.dt.getTime() - b.dt.getTime())
      .slice(0, 3)
      .map(({ slot, dt }) => ({
        id: slot.slotId || `${slot.classId}-${slot.timeSlotId}-${slot.date}`,
        classCode: slot.classCode || "Lớp",
        subjectName: slot.subjectName || "Môn học",
        time:
          slot.startTime && slot.endTime
            ? `${slot.startTime} - ${slot.endTime}`
            : slot.timeSlotName || "Chưa rõ ca",
        date: new Date(slot.date).toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        }),
        status: slot.hasAttendance
          ? "Đã điểm danh"
          : dt > now
          ? "Sắp diễn ra"
          : "Chưa điểm danh",
        statusColor: slot.hasAttendance ? palette.success : palette.primary,
        icon: slot.hasAttendance ? "check-circle-outline" : "clock-outline",
      }));
    return parsed;
  }, [allSlots]);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TeacherServices.getMyWeeklySchedule();
      setSchedule(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Không thể tải lịch.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSchedule();
      if (!error) {
        Alert.alert("Thành công", "Dashboard đã được cập nhật.");
      }
    } catch {
      Alert.alert("Lỗi", "Không thể làm mới dữ liệu. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  }, [loadSchedule, error]);

  const handleLogout = useCallback(() => {
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
            await AuthenServices.logout();
            Toast.show({
              type: "success",
              text1: "Đăng xuất thành công",
              text1Style: { textAlign: "center", fontSize: 16 },
            });
          } catch (error) {
            console.error("Error during logout:", error);
            Toast.show({
              type: "error",
              text1: "Không thể đăng xuất. Đăng xuất khỏi thiết bị.",
              text1Style: { textAlign: "center", fontSize: 16 },
            });
          } finally {
            dispatch(clearAuthData());
            await AsyncStorage.clear();
            router.replace("/(auth)/login" as any);
          }
        },
      },
    ]);
  }, [dispatch]);

  const handleClassPress = (classItem: (typeof upcomingClasses)[0]) => {
    // Điều hướng tới schedule để chọn slot và tiếp tục điểm danh / chấm điểm
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
        <View style={styles.heroHeader}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuButton}
      >
            <MaterialCommunityIcons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
