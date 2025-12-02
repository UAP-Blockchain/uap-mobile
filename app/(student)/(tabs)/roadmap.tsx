import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RoadmapServices } from "@/services/student/roadmapServices";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  CurriculumRoadmapSubjectDto,
} from "@/types/roadmap";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  success: "#4CAF50",
  warning: "#FFB347",
  error: "#F44336",
  background: "#F1F5FF",
  card: "#FFFFFF",
  surface: "#F7FAFF",
  text: "#1F2933",
  subtitle: "#6B7280",
};

export default function RoadmapPage() {
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<CurriculumRoadmapSummaryDto | null>(
    null
  );
  const [semesterDetails, setSemesterDetails] = useState<
    Record<number, CurriculumRoadmapSubjectDto[]>
  >({});
  const [loadingSemesters, setLoadingSemesters] = useState<
    Record<number, boolean>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RoadmapServices.getMyCurriculumRoadmapSummary();
      setSummary(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải dữ liệu lộ trình học tập.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSemester = async (semesterNumber: number) => {
    if (semesterDetails[semesterNumber]) return;
    setLoadingSemesters((prev) => ({ ...prev, [semesterNumber]: true }));
    try {
      const data: CurriculumSemesterDto =
        await RoadmapServices.getMyCurriculumSemester(semesterNumber);
      setSemesterDetails((prev) => ({
        ...prev,
        [semesterNumber]: data.subjects,
      }));
    } catch (err) {
      // giữ nguyên, sẽ hiển thị rỗng nếu lỗi
    } finally {
      setLoadingSemesters((prev) => ({
        ...prev,
        [semesterNumber]: false,
      }));
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  // Tự động load dữ liệu cho tất cả các kỳ sau khi có summary (giống web)
  useEffect(() => {
    if (!summary || !summary.semesterSummaries.length) return;
    summary.semesterSummaries.forEach((sem) => {
      void loadSemester(sem.semesterNumber);
    });
  }, [summary]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSummary();
    } finally {
      setRefreshing(false);
    }
  };

  const completionStats = useMemo(() => {
    if (!summary) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        planned: 0,
        failed: 0,
        percentage: 0,
      };
    }

    const {
      totalSubjects,
      completedSubjects,
      inProgressSubjects,
      openSubjects,
      failedSubjects,
    } = summary;

    const percentage =
      totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;

    return {
      total: totalSubjects,
      completed: completedSubjects,
      inProgress: inProgressSubjects,
      planned: openSubjects,
      failed: failedSubjects,
      percentage,
    };
  }, [summary]);

  const semesters = useMemo(() => summary?.semesterSummaries || [], [summary]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Completed":
        return {
          label: "Đã hoàn thành",
          color: "#1d4ed8",
          background: "#dbeafe",
        };
      case "InProgress":
        return { label: "Đang học", color: "#0ea5e9", background: "#e0f2fe" };
      case "Planned":
        return { label: "Dự kiến", color: "#10b981", background: "#d1fae5" };
      case "Failed":
        return { label: "Không đạt", color: "#ef4444", background: "#fee2e2" };
      default:
        return {
          label: status,
          color: palette.subtitle,
          background: "#f5f5f5",
        };
    }
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
          Đang tải lộ trình học tập...
        </Text>
      </View>
    );
  }

  if (error) {
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
          name="alert-circle"
          size={48}
          color={palette.error}
        />
        <Text
          style={{ marginTop: 12, color: palette.text, textAlign: "center" }}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (!summary) {
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
          name="school-outline"
          size={48}
          color={palette.subtitle}
        />
        <Text style={{ marginTop: 12, color: palette.subtitle }}>
          Chưa có dữ liệu lộ trình học tập
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={[palette.primary, palette.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerEyebrow}>LỘ TRÌNH HỌC TẬP</Text>
        <Text style={styles.headerTitle}>Lộ trình học tập</Text>
        <Text style={styles.headerSubtitle}>
          Hoàn thành {completionStats.completed}/{completionStats.total} môn ·{" "}
          {completionStats.percentage.toFixed(1)}%
        </Text>

        <View style={styles.headerStatsRow}>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatLabel}>Đang học</Text>
            <Text style={styles.headerStatValue}>
              {completionStats.inProgress}
            </Text>
          </View>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatLabel}>Dự kiến</Text>
            <Text style={styles.headerStatValue}>
              {completionStats.planned}
            </Text>
          </View>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatLabel}>Không đạt</Text>
            <Text style={styles.headerStatValue}>{completionStats.failed}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.primary]}
            tintColor={palette.primary}
          />
        }
      >
        {semesters.map((semester) => (
          <View key={semester.semesterNumber} style={styles.semesterCard}>
            <View style={styles.semesterHeader}>
              <View>
                <Text style={styles.semesterName}>
                  Kỳ {semester.semesterNumber}
                </Text>
                <Text style={styles.semesterCode}>
                  {semester.semesterName || ""}
                </Text>
              </View>
              {semester.inProgressSubjects > 0 && (
                <View style={styles.currentBadge}>
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color="#f59e0b"
                  />
                  <Text style={styles.currentBadgeText}>Đang học</Text>
                </View>
              )}
            </View>

            <View style={styles.subjectList}>
              {(semesterDetails[semester.semesterNumber] || []).map(
                (subject) => {
                  const chip = getStatusChip(subject.status);
                  return (
                    <View
                      key={subject.subjectId + subject.subjectCode}
                      style={styles.subjectItem}
                    >
                      <View style={styles.subjectLeft}>
                        <View style={styles.subjectIcon}>
                          <Text style={styles.subjectIconText}>
                            {subject.subjectCode.slice(0, 2)}
                          </Text>
                        </View>
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subjectCode}>
                            {subject.subjectCode}
                          </Text>
                          <Text style={styles.subjectName}>
                            {subject.subjectName}
                          </Text>
                          <Text style={styles.subjectMeta}>
                            {subject.credits} tín chỉ
                            {subject.finalScore != null &&
                              ` · Điểm: ${subject.finalScore.toFixed(2)}`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.subjectRight}>
                        <View
                          style={[
                            styles.statusChip,
                            {
                              backgroundColor: chip.background,
                              borderColor: chip.color,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusChipText,
                              { color: chip.color },
                            ]}
                          >
                            {chip.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          </View>
        ))}
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
    paddingBottom: 24,
  },
  headerEyebrow: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  headerStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  headerStatCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 4,
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  semesterCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  semesterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  semesterName: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  semesterCode: {
    fontSize: 13,
    color: palette.subtitle,
    marginTop: 2,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
    gap: 6,
  },
  currentBadgeText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "600",
  },
  subjectList: {
    marginTop: 4,
    gap: 10,
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  subjectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  subjectIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  subjectIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.primary,
  },
  subjectInfo: {
    flex: 1,
    gap: 2,
  },
  subjectCode: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primary,
  },
  subjectName: {
    fontSize: 14,
    color: palette.text,
  },
  subjectMeta: {
    fontSize: 12,
    color: palette.subtitle,
  },
  subjectRight: {
    marginLeft: 12,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
