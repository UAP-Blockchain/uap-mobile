import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TeacherServices, type TeacherProfileDto } from "@/services/teacher/teacherServices";
import Toast from "react-native-toast-message";
import {
  Avatar,
  Card,
  Chip,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
// Date formatting helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

export default function TeacherProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TeacherProfileDto | null>(null);
  const auth = useSelector(selectAuthLogin);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TeacherServices.getMyProfile();
      setProfile(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Không thể tải hồ sơ.";
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: message,
        text1Style: { textAlign: "center", fontSize: 16 },
        text2Style: { textAlign: "center" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile]);

  if (loading && !profile) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: palette.background },
          styles.centerContent,
        ]}
      >
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: palette.background },
          styles.centerContent,
        ]}
      >
        <MaterialCommunityIcons
          name="account-alert"
          size={64}
          color={palette.subtitle}
        />
        <Text style={styles.errorText}>Không có dữ liệu hồ sơ</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadProfile}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        </View>
        <View style={styles.heroContent}>
          <Avatar.Text
            size={96}
            label={profile.fullName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            labelStyle={{ color: "#fff", fontWeight: "600", fontSize: 32 }}
          />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{profile.fullName}</Text>
            <Text style={styles.heroCode}>{profile.teacherCode}</Text>
            <View style={styles.heroChips}>
              <Chip
                textStyle={{ color: "#fff", fontWeight: "600" }}
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                {profile.isActive ? "Đang giảng dạy" : "Ngưng hoạt động"}
              </Chip>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.section}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard} elevation={2}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={32}
                color={palette.primary}
              />
              <Text style={styles.statValue}>{profile.totalClasses}</Text>
              <Text style={styles.statLabel}>Tổng số lớp</Text>
            </View>
          </Card>
          <Card style={styles.statCard} elevation={2}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons
                name="account-group"
                size={32}
                color={palette.success}
              />
              <Text style={styles.statValue}>{profile.totalStudents}</Text>
              <Text style={styles.statLabel}>Tổng sinh viên</Text>
            </View>
          </Card>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Card style={styles.infoCard} elevation={2}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <Divider style={{ marginVertical: 12 }} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="email"
                size={20}
                color={palette.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>

          {profile.phoneNumber && (
            <View>
              <Divider style={{ marginVertical: 12 }} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={20}
                    color={palette.success}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Điện thoại</Text>
                  <Text style={styles.infoValue}>{profile.phoneNumber}</Text>
                </View>
              </View>
            </View>
          )}

          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={palette.warning}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày vào trường</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile.hireDate)}
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={palette.subtitle}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày tạo tài khoản</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(profile.createdAt)}
              </Text>
            </View>
          </View>

          {(profile.specialization ||
            (profile.specializations && profile.specializations.length > 0)) && (
            <View>
              <Divider style={{ marginVertical: 12 }} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="school"
                    size={20}
                    color={palette.secondary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Chuyên môn</Text>
                  <View style={styles.specializationsContainer}>
                    {profile.specializations && profile.specializations.length > 0
                      ? profile.specializations.map((spec) => (
                          <Chip
                            key={spec.id}
                            style={styles.specChip}
                            textStyle={{ color: palette.primary }}
                          >
                            {spec.name}
                          </Chip>
                        ))
                      : profile.specialization && (
                          <Chip
                            style={styles.specChip}
                            textStyle={{ color: palette.primary }}
                          >
                            {profile.specialization}
                          </Chip>
                        )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </Card>
      </View>

      {/* Classes List */}
      <View style={styles.section}>
        <Card style={styles.classesCard} elevation={2}>
          <Text style={styles.sectionTitle}>Danh sách lớp giảng dạy</Text>
          <Divider style={{ marginVertical: 12 }} />

          {profile.classes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="book-off"
                size={48}
                color={palette.subtitle}
              />
              <Text style={styles.emptyText}>Không có lớp nào</Text>
            </View>
          ) : (
            profile.classes.map((cls, index) => (
              <TouchableOpacity
                key={cls.classId}
                onPress={() => {
                  router.push({
                    pathname: "/(teacher)/classes",
                    params: { classId: cls.classId },
                  } as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.classRow}>
                  <View style={styles.classIcon}>
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={24}
                      color={palette.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.classHeader}>
                      <Text style={styles.classCode}>{cls.classCode}</Text>
                      <Chip
                        compact
                        style={styles.semesterChip}
                        textStyle={{ color: palette.primary, fontSize: 11 }}
                      >
                        {cls.semesterName}
                      </Chip>
                    </View>
                    <Text style={styles.classSubject}>{cls.subjectName}</Text>
                    <View style={styles.classMeta}>
                      <View style={styles.classMetaItem}>
                        <MaterialCommunityIcons
                          name="credit-card"
                          size={14}
                          color={palette.subtitle}
                        />
                        <Text style={styles.classMetaText}>
                          {cls.credits} tín chỉ
                        </Text>
                      </View>
                      <View style={styles.classMetaItem}>
                        <MaterialCommunityIcons
                          name="account-group"
                          size={14}
                          color={palette.subtitle}
                        />
                        <Text style={styles.classMetaText}>
                          {cls.totalStudents} SV
                        </Text>
                      </View>
                      <View style={styles.classMetaItem}>
                        <MaterialCommunityIcons
                          name="calendar-clock"
                          size={14}
                          color={palette.subtitle}
                        />
                        <Text style={styles.classMetaText}>
                          {cls.totalSlots} ca
                        </Text>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={palette.subtitle}
                  />
                </View>
                {index !== profile.classes.length - 1 && (
                  <Divider style={{ marginVertical: 12 }} />
                )}
              </TouchableOpacity>
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: palette.subtitle,
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: palette.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    marginBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
    gap: 16,
  },
  heroInfo: {
    alignItems: "center",
    gap: 8,
  },
  heroName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  heroCode: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    textAlign: "center",
  },
  heroChips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.card,
  },
  statContent: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text,
  },
  statLabel: {
    color: palette.subtitle,
    fontSize: 13,
    textAlign: "center",
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: palette.card,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${palette.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: palette.subtitle,
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "500",
  },
  specializationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  specChip: {
    backgroundColor: `${palette.primary}15`,
  },
  classesCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: palette.card,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    color: palette.subtitle,
    fontSize: 15,
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
    backgroundColor: `${palette.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  classCode: {
    fontWeight: "700",
    color: palette.text,
    fontSize: 16,
  },
  semesterChip: {
    backgroundColor: `${palette.primary}15`,
    height: 20,
  },
  classSubject: {
    color: palette.subtitle,
    fontSize: 14,
    marginBottom: 8,
  },
  classMeta: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  classMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classMetaText: {
    color: palette.subtitle,
    fontSize: 12,
  },
});

