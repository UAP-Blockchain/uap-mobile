import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StudentServices } from "../../../services/student/studentServices";
import type { StudentDetailDto } from "../../../types/student";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  background: "#F1F5FF",
  card: "#FFFFFF",
  text: "#1F2933",
  subtitle: "#6B7280",
  muted: "#94a3b8",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
};

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState<StudentDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
      setError(null);
      try {
        const data = await StudentServices.getCurrentStudentProfile();
        setStudent(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải hồ sơ sinh viên.";
        setError(message);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: message,
      });
          } finally {
        setLoading(false);
      setRefreshing(false);
      }
    };

  useEffect(() => {
    void loadProfile();
  }, []);

  const onRefresh = () => {
    void loadProfile(true);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "SV";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={{ marginTop: 12, color: palette.subtitle, fontSize: 14 }}>
          Đang tải hồ sơ sinh viên...
        </Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View
        style={[
          styles.container,
    {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={styles.errorIconContainer}>
        <MaterialCommunityIcons
            name="account-alert-outline"
            size={64}
            color={palette.error}
        />
        </View>
        <Text
          style={{
            marginTop: 16,
            color: palette.text,
            fontSize: 16,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {error || "Không có dữ liệu sinh viên"}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => void loadProfile()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#4a90e2", "#2a6fba", "#1e5a9e"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.heroContent}>
          <LinearGradient
            colors={["#ffffff", "#f0f9ff"]}
            style={styles.heroAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroAvatarText}>
              {getInitials(student.fullName || auth?.userProfile?.userName)}
            </Text>
          </LinearGradient>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>
              {student.fullName}
            </Text>
            <View style={styles.heroMetaRow}>
              <MaterialCommunityIcons
                name="identifier"
                size={14}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.heroCode}>{student.studentCode}</Text>
          </View>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: student.isActive
                  ? "rgba(34, 197, 94, 0.25)"
                  : "rgba(239, 68, 68, 0.25)",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: student.isActive
                    ? palette.success
                    : palette.error,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {student.isActive ? "Đang học" : "Không hoạt động"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.primary]}
            tintColor={palette.primary}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={["#e0ecff", "#f0f9ff"]}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
            <MaterialCommunityIcons
              name="book-open-variant"
                size={28}
              color={palette.primary}
            />
            </View>
            <Text style={styles.statNumber}>{student.totalClasses || 0}</Text>
            <Text style={styles.statLabel}>Tổng số lớp</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#fef3c7", "#fffbeb"]}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.statIconContainer, { backgroundColor: "#fef3c7" }]}>
            <MaterialCommunityIcons
                name="star"
                size={28}
                color={palette.warning}
            />
            </View>
            <Text style={styles.statNumber}>
              {typeof student.gpa === "number" ? student.gpa.toFixed(2) : "—"}
            </Text>
            <Text style={styles.statLabel}>GPA</Text>
          </LinearGradient>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons
                name="account-circle"
                size={20}
                color={palette.primary}
              />
            </View>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <MaterialCommunityIcons
                  name="account"
                  size={18}
                  color={palette.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {student.fullName}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <MaterialCommunityIcons
                  name="email"
                  size={18}
                  color={palette.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {student.email}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={18}
                  color={palette.primary}
                />
          </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày nhập học</Text>
                <Text style={styles.infoValue}>
                  {new Date(student.enrollmentDate).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Current Classes Card */}
        {student.currentClasses && student.currentClasses.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                  <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={20}
                    color={palette.primary}
                  />
                </View>
              <Text style={styles.sectionTitle}>
                Lớp đang học ({student.currentClasses.length})
              </Text>
            </View>
            <View style={styles.classesList}>
              {student.currentClasses.slice(0, 5).map((cls, index) => (
                <View key={cls.classId}>
                  <View style={styles.classItem}>
                    <LinearGradient
                      colors={["#e0ecff", "#f0f9ff"]}
                      style={styles.classIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="book-open-variant"
                        size={20}
                        color={palette.primary}
                      />
                    </LinearGradient>
                    <View style={styles.classContent}>
                      <Text style={styles.classCode} numberOfLines={1}>
                        {cls.classCode}
                      </Text>
                      <Text style={styles.className} numberOfLines={1}>
                        {cls.subjectName}
                      </Text>
                      <View style={styles.classMetaRow}>
                        <View style={styles.classMetaItem}>
                          <MaterialCommunityIcons
                            name="account-tie"
                            size={12}
                            color={palette.subtitle}
                          />
                          <Text style={styles.classMeta}>{cls.teacherName}</Text>
                        </View>
                        <View style={styles.classMetaItem}>
                          <MaterialCommunityIcons
                            name="star-outline"
                            size={12}
                            color={palette.subtitle}
                          />
                  <Text style={styles.classMeta}>
                            {cls.credits} tín chỉ
                  </Text>
                </View>
                      </View>
                    </View>
                  </View>
                  {index < Math.min(student.currentClasses.length, 5) - 1 && (
                    <View style={styles.divider} />
                  )}
              </View>
            ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroContent: {
    alignItems: "center",
    gap: 16,
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroAvatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: palette.primary,
    letterSpacing: 1,
  },
  heroInfo: {
    alignItems: "center",
    gap: 6,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroCode: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "600",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
  },
  statLabel: {
    fontSize: 12,
    color: palette.subtitle,
    fontWeight: "600",
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f4ff",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  infoList: {
    gap: 0,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: palette.subtitle,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f4ff",
    marginLeft: 52,
  },
  classesList: {
    gap: 0,
  },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classContent: {
    flex: 1,
    gap: 4,
  },
  classCode: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.primary,
  },
  className: {
    fontSize: 14,
    color: palette.text,
    fontWeight: "500",
  },
  classMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  classMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classMeta: {
    fontSize: 12,
    color: palette.subtitle,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: palette.primary,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
