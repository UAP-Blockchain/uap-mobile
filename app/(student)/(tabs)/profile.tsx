import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StudentServices } from "../../../services/student/studentServices";
import type { StudentDetailDto } from "../../../types/student";
import { LinearGradient } from "expo-linear-gradient";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  background: "#F1F5FF",
  card: "#FFFFFF",
  text: "#1F2933",
  subtitle: "#6B7280",
  muted: "#94a3b8",
};

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
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
          } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "SV";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  if (loading) {
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
        <Text style={{ marginTop: 8, color: palette.subtitle }}>
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
          },
        ]}
      >
        <MaterialCommunityIcons
          name="account-alert"
          size={48}
          color={palette.primary}
        />
        <Text style={{ marginTop: 8, color: palette.subtitle }}>
          {error || "Không có dữ liệu sinh viên"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#4a90e2", "#2a6fba"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.heroHeader}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>
              {getInitials(student.fullName || auth?.userProfile?.userName)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{student.fullName}</Text>
            <Text style={styles.heroCode}>{student.studentCode}</Text>
          </View>
          <View style={styles.statusPill}>
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
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color={palette.primary}
            />
            <Text style={styles.statNumber}>{student.totalClasses}</Text>
            <Text style={styles.statLabel}>Tổng số lớp</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="account-check"
              size={24}
              color={palette.primary}
            />
            <Text style={styles.statNumber}>
              {typeof student.gpa === "number" ? student.gpa.toFixed(2) : "—"}
            </Text>
            <Text style={styles.statLabel}>GPA</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ và tên</Text>
            <Text style={styles.value}>{student.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{student.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày nhập học</Text>
            <Text style={styles.value}>
              {new Date(student.enrollmentDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>

        {student.currentClasses && student.currentClasses.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Lớp đang học</Text>
            {student.currentClasses.slice(0, 3).map((cls) => (
              <View key={cls.classId} style={styles.classRow}>
                <View style={styles.classIcon}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={18}
                    color={palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classCode}>{cls.classCode}</Text>
                  <Text style={styles.className}>{cls.subjectName}</Text>
                  <Text style={styles.classMeta}>
                    GV: {cls.teacherName} · {cls.credits} tín chỉ
                  </Text>
                </View>
              </View>
            ))}
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
    paddingVertical: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  heroName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  heroCode: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: "700", color: palette.text },
  statLabel: { fontSize: 12, color: palette.subtitle },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2ff",
  },
  label: { fontSize: 13, color: palette.subtitle },
  value: { fontSize: 13, fontWeight: "600", color: palette.text },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  classIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  classCode: { fontSize: 13, fontWeight: "700", color: palette.primary },
  className: { fontSize: 13, color: palette.text },
  classMeta: { fontSize: 12, color: palette.subtitle },
});
