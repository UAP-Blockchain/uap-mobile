import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StudentServices } from "../../../services/student/studentServices";
import type { StudentDetailDto } from "../../../types/student";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  background: "#F1F5FF",
  card: "#FFFFFF",
  text: "#1F2933",
  subtitle: "#6B7280",
  success: "#16a34a",
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
      {/* Header gradient giống web */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ sinh viên</Text>
        <Text style={styles.headerSubtitle}>
          Quản lý thông tin cá nhân và trạng thái học tập
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(student.fullName || auth?.userProfile?.userName)}
              </Text>
            </View>
          </View>
          <Text style={styles.studentName}>{student.fullName}</Text>
          <Text style={styles.studentCode}>{student.studentCode}</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <MaterialCommunityIcons
                name="email-outline"
                size={14}
                color={palette.primary}
              />
              <Text style={styles.chipText}>{student.email}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GPA</Text>
              <Text style={styles.statValue}>
                {typeof student.gpa === "number" ? student.gpa.toFixed(2) : "—"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lớp hiện tại</Text>
              <Text style={styles.statValue}>{student.totalClasses}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Khóa học</Text>
              <Text style={styles.statValue}>
                {new Date(student.enrollmentDate).getFullYear()}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin chi tiết */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã sinh viên</Text>
            <Text style={styles.infoValue}>{student.studentCode}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{student.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{student.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày nhập học</Text>
            <Text style={styles.infoValue}>
              {new Date(student.enrollmentDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <Text style={styles.infoValue}>
              {student.isActive ? "Hoạt động" : "Không hoạt động"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tình trạng tốt nghiệp</Text>
            <Text style={styles.infoValue}>
              {student.isGraduated ? "Đã tốt nghiệp" : "Chưa tốt nghiệp"}
            </Text>
            </View>
          </View>

        {/* Hoạt động học tập tổng quan */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tổng quan học tập</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Lớp đã đăng ký</Text>
              <Text style={styles.summaryValue}>
                {student.totalEnrollments}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đã duyệt</Text>
              <Text style={styles.summaryValue}>
                {student.approvedEnrollments}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đang chờ</Text>
              <Text style={styles.summaryValue}>
                {student.pendingEnrollments}
          </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Bản ghi điểm</Text>
              <Text style={styles.summaryValue}>{student.totalGrades}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Bản ghi điểm danh</Text>
              <Text style={styles.summaryValue}>
                {student.totalAttendances}
          </Text>
            </View>
          </View>
        </View>

        {/* Lớp đang học (rút gọn) */}
        {student.currentClasses && student.currentClasses.length > 0 && (
          <View style={styles.sectionCard}>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: palette.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  overviewCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.primary,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  studentCode: {
    marginTop: 4,
    fontSize: 14,
    color: palette.subtitle,
    textAlign: "center",
  },
  chipRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    color: palette.primary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: palette.subtitle,
  },
  statValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  sectionCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: palette.subtitle,
  },
  infoValue: {
    fontSize: 13,
    color: palette.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryItem: {
    width: "48%",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f3f4ff",
  },
  summaryLabel: {
    fontSize: 12,
    color: palette.subtitle,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  classIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  classCode: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.primary,
  },
  className: {
    fontSize: 13,
    color: palette.text,
  },
  classMeta: {
    fontSize: 12,
    color: palette.subtitle,
  },
});
