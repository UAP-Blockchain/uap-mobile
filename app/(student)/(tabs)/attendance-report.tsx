import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RoadmapServices } from "@/services/student/roadmapServices";
import { StudentAttendanceServices } from "@/services/student/attendanceServices";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "@/lib/features/loginSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  CurriculumRoadmapSubjectDto,
} from "@/types/roadmap";
import type { AttendanceDto } from "@/types/attendance";
import BackHeader from "@/components/BackHeader";
import { router } from "expo-router";

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

export default function AttendanceReportPage() {
  const auth = useSelector(selectAuthLogin);
  const [summary, setSummary] = useState<CurriculumRoadmapSummaryDto | null>(
    null
  );
  const [semesterDetails, setSemesterDetails] = useState<
    Record<number, CurriculumSemesterDto>
  >({});
  const [loadingSemesters, setLoadingSemesters] = useState<
    Record<number, boolean>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [selectedSubject, setSelectedSubject] =
    useState<CurriculumRoadmapSubjectDto | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDto[]>(
    []
  );
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
  const [expandedSemesters, setExpandedSemesters] = useState<
    Record<number, boolean>
  >({});
  const [isStudent, setIsStudent] = useState<boolean>(true);

  const loadSemester = useCallback(
    async (
      semesterNumber: number,
      currentSummary?: CurriculumRoadmapSummaryDto | null
    ) => {
      if (semesterDetails[semesterNumber]) return;
      setLoadingSemesters((prev) => ({ ...prev, [semesterNumber]: true }));
      try {
        const data: CurriculumSemesterDto =
          await RoadmapServices.getMyCurriculumSemester(semesterNumber);
        setSemesterDetails((prev) => ({
          ...prev,
          [semesterNumber]: data,
        }));

        // Nếu chưa chọn môn nào, chọn luôn môn đầu tiên của kỳ đầu tiên
        const baseSummary = currentSummary ?? summary;
        if (!selectedSubjectId && baseSummary) {
          const firstSemester = baseSummary.semesterSummaries[0];
          if (firstSemester.semesterNumber === semesterNumber) {
            const subjects = getFilteredSubjects(data.subjects);
            if (subjects.length > 0) {
              handleSubjectSelect(subjects[0]);
            }
          }
        }
      } catch (err) {
        // giữ nguyên, sẽ hiển thị rỗng nếu lỗi
      } finally {
        setLoadingSemesters((prev) => ({
          ...prev,
          [semesterNumber]: false,
        }));
      }
    },
    [semesterDetails, summary, selectedSubjectId]
  );

  const redirectLogin = () => {
    router.replace("/(auth)/login" as any);
  };

  const loadSummary = useCallback(async () => {
    if (!isStudent) {
      setError("Chức năng này chỉ dành cho sinh viên.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await RoadmapServices.getMyCurriculumRoadmapSummary();
      setSummary(data);
      if (data.semesterSummaries.length > 0) {
        const firstSemester = data.semesterSummaries[0].semesterNumber;
        setExpandedSemesters({ [firstSemester]: true });
        await loadSemester(firstSemester, data);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        redirectLogin();
        return;
      }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải dữ liệu lộ trình.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isStudent, loadSemester]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isStudent) {
        setError("Chức năng này chỉ dành cho sinh viên.");
        return;
      }
      setSemesterDetails({});
      setSelectedSubjectId(null);
      setSelectedSubject(null);
      setAttendanceRecords([]);
      await loadSummary();
    } finally {
      setRefreshing(false);
    }
  };

  const semesters = useMemo(() => summary?.semesterSummaries || [], [summary]);

  const toggleSemester = useCallback(
    (semesterNumber: number) => {
      // Luôn đảm bảo đã load dữ liệu cho kỳ đó (hàm có guard sẵn)
      void loadSemester(semesterNumber);
      setExpandedSemesters((prev) => ({
        ...prev,
        [semesterNumber]: !prev[semesterNumber],
      }));
    },
    [loadSemester]
  );

  const getFilteredSubjects = (
    subjects: CurriculumRoadmapSubjectDto[]
  ): CurriculumRoadmapSubjectDto[] => {
    // Giống web: chỉ hiển thị môn Đang học + Đã hoàn thành
    return subjects.filter(
      (subject) =>
        subject.status === "InProgress" || subject.status === "Completed"
    );
  };

  const handleSubjectSelect = useCallback(
    (subject: CurriculumRoadmapSubjectDto) => {
      setSelectedSubjectId(subject.subjectId);
      setSelectedSubject(subject);
      void loadAttendance(subject.subjectId);
    },
    []
  );

  const loadAttendance = useCallback(
    async (subjectId: string) => {
      if (!isStudent) {
        setError("Chức năng này chỉ dành cho sinh viên.");
        setAttendanceRecords([]);
        return;
      }
      setLoadingAttendance(true);
      setError(null);
      try {
        const records = await StudentAttendanceServices.getMyAttendance({
          SubjectId: subjectId,
        });
        setAttendanceRecords(records);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          setAttendanceRecords([]);
          redirectLogin();
          return;
        }
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải dữ liệu điểm danh.";
        setError(message);
        setAttendanceRecords([]);
      } finally {
        setLoadingAttendance(false);
      }
    },
    [isStudent]
  );

  useEffect(() => {
    const init = async () => {
      const role = (
        (await AsyncStorage.getItem("role")) ||
        auth?.userProfile?.role ||
        ""
      )
        .toString()
        .toUpperCase();
      const student = role === "STUDENT";
      setIsStudent(student);
      if (!student) {
        setError("Chức năng này chỉ dành cho sinh viên.");
        setLoading(false);
        return;
      }
      await loadSummary();
    };
    void init();

    // ❗ Cố ý không để dependency để tránh vòng lặp vô hạn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const attendanceSummary = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r) => r.isPresent).length;
    const excused = attendanceRecords.filter(
      (r) => !r.isPresent && r.isExcused
    ).length;
    const absent = attendanceRecords.filter(
      (r) => !r.isPresent && !r.isExcused
    ).length;
    const percentage = total ? Math.round((present / total) * 100) : 0;

    return { total, present, excused, absent, percentage };
  }, [attendanceRecords]);

  const getStatusChip = (record: AttendanceDto) => {
    if (record.isPresent) {
      return {
        label: "Có mặt",
        color: "#16a34a",
        background: "#dcfce7",
      };
    }
    if (record.isExcused) {
      return {
        label: "Miễn điểm danh",
        color: "#2563eb",
        background: "#dbeafe",
      };
    }
    return {
      label: "Vắng mặt",
      color: "#ef4444",
      background: "#fee2e2",
    };
  };

  const headerSubtitle =
    "Xem chi tiết lịch sử điểm danh theo từng môn học và học kỳ";
  const headerMeta =
    semesters.length > 0 ? `Tổng học kỳ: ${semesters.length}` : undefined;

  const renderHeader = () => (
    <BackHeader
      title="Báo cáo điểm danh"
      subtitle={headerSubtitle}
      subtitleSmall={headerMeta}
      gradientColors={[palette.primary, palette.secondary]}
      fallbackRoute="/(student)/(tabs)"
    />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={{ color: palette.subtitle }}>
            Đang tải báo cáo điểm danh...
          </Text>
        </View>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.stateContainer}>
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
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons
            name="calendar-blank"
            size={48}
            color={palette.subtitle}
          />
          <Text style={{ marginTop: 12, color: palette.subtitle }}>
            Chưa có dữ liệu lộ trình học tập
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

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
        {/* Left: danh sách kỳ + môn */}
        <View style={styles.semesterContainer}>
          {semesters.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={40}
                color={palette.subtitle}
              />
              <Text style={styles.emptyText}>Chưa có dữ liệu học kỳ</Text>
            </View>
          ) : (
            semesters.map((sem) => {
              const semesterData = semesterDetails[sem.semesterNumber];
              const isLoading = loadingSemesters[sem.semesterNumber] ?? false;
              const subjects = semesterData
                ? getFilteredSubjects(semesterData.subjects)
                : [];
              const isExpanded = expandedSemesters[sem.semesterNumber];

              return (
                <View key={sem.semesterNumber} style={styles.semesterBlock}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleSemester(sem.semesterNumber)}
                  >
                    <View style={styles.semesterHeader}>
                      <View style={styles.semesterHeaderLeft}>
                        <MaterialCommunityIcons
                          name={isExpanded ? "chevron-down" : "chevron-right"}
                          size={20}
                          color={palette.subtitle}
                        />
                        <View>
                          <Text style={styles.semesterName}>
                            Kỳ {sem.semesterNumber}
                          </Text>
                          {sem.semesterName ? (
                            <Text style={styles.semesterCode}>
                              {sem.semesterName}
                            </Text>
                          ) : null}
                          <Text style={styles.semesterCount}>
                            {sem.subjectCount} môn học
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <>
                      {isLoading && (
                        <View style={styles.smallLoading}>
                          <ActivityIndicator
                            size="small"
                            color={palette.primary}
                          />
                        </View>
                      )}
                      {!isLoading && subjects.length === 0 && (
                        <Text style={styles.emptySemesterText}>
                          Chưa có môn học đang học hoặc đã hoàn thành
                        </Text>
                      )}
                      {!isLoading &&
                        subjects.map((subject) => (
                          <TouchableOpacity
                            key={subject.subjectId}
                            style={[
                              styles.courseItem,
                              selectedSubjectId === subject.subjectId &&
                                styles.courseItemActive,
                            ]}
                            onPress={() => handleSubjectSelect(subject)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.courseIcon}>
                              <Text style={styles.courseIconText}>
                                {subject.subjectCode.slice(0, 2)}
                              </Text>
                            </View>
                            <View style={styles.courseInfo}>
                              <Text style={styles.courseCode}>
                                {subject.subjectCode}
                              </Text>
                              <Text style={styles.courseName}>
                                {subject.subjectName}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                    </>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Right: chi tiết điểm danh */}
        <View style={styles.reportContainer}>
          {!selectedSubjectId ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={40}
                color={palette.subtitle}
              />
              <Text style={styles.emptyText}>
                Chọn một môn học ở bên trái để xem báo cáo điểm danh
              </Text>
            </View>
          ) : (
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportLabel}>Môn học</Text>
                <Text style={styles.reportTitle}>
                  {selectedSubject?.subjectCode} ·{" "}
                  {selectedSubject?.subjectName}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View
                  style={[styles.summaryChip, { backgroundColor: "#dcfce7" }]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#16a34a"
                  />
                  <Text style={[styles.summaryChipText, { color: "#16a34a" }]}>
                    Có mặt: {attendanceSummary.present}
                  </Text>
                </View>
                <View
                  style={[styles.summaryChip, { backgroundColor: "#dbeafe" }]}
                >
                  <MaterialCommunityIcons
                    name="information"
                    size={16}
                    color="#2563eb"
                  />
                  <Text style={[styles.summaryChipText, { color: "#2563eb" }]}>
                    Miễn: {attendanceSummary.excused}
                  </Text>
                </View>
                <View
                  style={[styles.summaryChip, { backgroundColor: "#fee2e2" }]}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color="#ef4444"
                  />
                  <Text style={[styles.summaryChipText, { color: "#ef4444" }]}>
                    Vắng: {attendanceSummary.absent}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRateBox}>
                <Text style={styles.summaryRateText}>
                  Tỉ lệ tham gia: {attendanceSummary.percentage}% · Tổng số
                  buổi: {attendanceSummary.total}
                </Text>
              </View>

              {loadingAttendance ? (
                <View style={styles.smallLoading}>
                  <ActivityIndicator size="small" color={palette.primary} />
                  <Text style={styles.smallLoadingText}>
                    Đang tải dữ liệu điểm danh...
                  </Text>
                </View>
              ) : attendanceRecords.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons
                    name="calendar-remove"
                    size={40}
                    color={palette.subtitle}
                  />
                  <Text style={styles.emptyText}>
                    Chưa có dữ liệu điểm danh cho môn này
                  </Text>
                </View>
              ) : (
                <View style={styles.attendanceList}>
                  {attendanceRecords.map((record) => {
                    const chip = getStatusChip(record);
                    return (
                      <View key={record.id} style={styles.attendanceItem}>
                        <View style={styles.attendanceLeft}>
                          <Text style={styles.attendanceDate}>
                            {new Date(record.date).toLocaleDateString("vi-VN")}
                          </Text>
                          <Text style={styles.attendanceSlot}>
                            {record.timeSlotName} · {record.classCode}
                          </Text>
                          {record.notes && (
                            <Text style={styles.attendanceNotes}>
                              Ghi chú: {record.notes}
                            </Text>
                          )}
                        </View>
                        <View style={styles.attendanceRight}>
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
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  semesterContainer: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  semesterBlock: {
    marginBottom: 12,
  },
  semesterHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  semesterHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  semesterName: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.text,
  },
  semesterCode: {
    fontSize: 13,
    color: palette.subtitle,
  },
  semesterCount: {
    fontSize: 12,
    color: palette.subtitle,
    marginTop: 2,
  },
  smallLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  smallLoadingText: {
    fontSize: 13,
    color: palette.subtitle,
  },
  emptySemesterText: {
    fontSize: 13,
    color: palette.subtitle,
    fontStyle: "italic",
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  courseItemActive: {
    backgroundColor: "#e0f2fe",
  },
  courseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  courseIconText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.primary,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primary,
  },
  courseName: {
    fontSize: 13,
    color: palette.text,
  },
  reportContainer: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  reportCard: {
    gap: 12,
  },
  reportHeader: {
    gap: 4,
  },
  reportLabel: {
    fontSize: 12,
    color: palette.subtitle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  summaryChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryRateBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: palette.surface,
  },
  summaryRateText: {
    fontSize: 13,
    color: palette.text,
    fontWeight: "600",
  },
  attendanceList: {
    marginTop: 8,
    gap: 8,
  },
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attendanceLeft: {
    flex: 1,
    gap: 2,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.text,
  },
  attendanceSlot: {
    fontSize: 13,
    color: palette.subtitle,
  },
  attendanceNotes: {
    fontSize: 12,
    color: palette.subtitle,
    fontStyle: "italic",
  },
  attendanceRight: {
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
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: palette.subtitle,
    textAlign: "center",
  },
});
