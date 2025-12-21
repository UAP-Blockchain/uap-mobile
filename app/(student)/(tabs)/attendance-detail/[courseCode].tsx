import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../../lib/features/loginSlice";
import BackHeader from "@/components/BackHeader";
import { StudentAttendanceServices } from "../../../../services/student/attendanceServices";
import type { AttendanceDto, AttendanceStatisticsDto } from "../../../../types/attendance";
import Toast from "react-native-toast-message";

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

interface AttendanceRecord {
  id: string;
  date: string;
  timeSlotName: string;
  startTime?: string;
  endTime?: string;
  teacherName?: string;
  status: "present" | "absent" | "future" | "excused";
  isPresent: boolean;
  isExcused: boolean;
  notes?: string | null;
  excuseReason?: string | null;
}

export default function AttendanceDetailPage() {
  const params = useLocalSearchParams();
  const courseCode = params.courseCode as string;
  const classId = params.classId as string;
  const classCode = (params.classCode as string) || courseCode;
  const subjectCode = (params.subjectCode as string) || courseCode;
  const subjectName = (params.subjectName as string) || courseCode;
  const teacherName = (params.teacherName as string) || "";

  const auth = useSelector(selectAuthLogin);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStatisticsDto | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const formatTimeRange = (start?: string, end?: string): string => {
    if (!start || !end) return "—";

    try {
      let startTime = start;
      let endTime = end;

      if (start.includes("T")) {
        const date = new Date(start);
        startTime = `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`;
      } else if (start.includes(":")) {
        const parts = start.split(":");
        startTime = `${parts[0]}:${parts[1]}`;
      }

      if (end.includes("T")) {
        const date = new Date(end);
        endTime = `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`;
      } else if (end.includes(":")) {
        const parts = end.split(":");
        endTime = `${parts[0]}:${parts[1]}`;
      }

      return `${startTime} - ${endTime}`;
    } catch {
      return "—";
    }
  };

  const convertAttendanceToRecord = useCallback((attendance: AttendanceDto): AttendanceRecord => {
    // Nếu API đã trả về bản ghi điểm danh (có id), thì đã được điểm danh rồi
    // Không thể là "future" nữa. Chỉ dựa vào isPresent và isExcused
    let status: "present" | "absent" | "future" | "excused";
    
    if (attendance.isPresent) {
      status = "present";
    } else if (attendance.isExcused) {
      status = "excused";
    } else {
      // Nếu không có mặt và không có phép, thì là vắng mặt
      status = "absent";
    }

    return {
      id: attendance.id,
      date: attendance.date,
      timeSlotName: attendance.timeSlotName,
      startTime: undefined,
      endTime: undefined,
      teacherName: undefined,
      status,
      isPresent: attendance.isPresent,
      isExcused: attendance.isExcused,
      notes: attendance.notes,
      excuseReason: attendance.excuseReason,
    };
  }, []);

  const fetchAttendanceData = useCallback(
    async (isRefresh = false) => {
      if (!classId) {
        setError("Không tìm thấy thông tin lớp học");
        setIsLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Fetch attendance statistics
        const stats = await StudentAttendanceServices.getMyAttendanceStatistics(classId);
        setAttendanceStats(stats);

        // Fetch attendance records
        const records = await StudentAttendanceServices.getMyAttendance({
          ClassId: classId,
        });

        // Convert and sort by date
        const convertedRecords = records
          .map(convertAttendanceToRecord)
          .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // Newest first
          });

        setAttendanceRecords(convertedRecords);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải dữ liệu điểm danh.";
        setError(message);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: message,
          text1Style: { textAlign: "center", fontSize: 16 },
        });
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [classId, convertAttendanceToRecord]
  );

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const onRefresh = useCallback(() => {
    fetchAttendanceData(true);
  }, [fetchAttendanceData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return palette.success;
      case "absent":
        return palette.error;
      case "excused":
        return palette.warning;
      case "future":
        return palette.subtitle;
      default:
        return palette.subtitle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Đã tham gia";
      case "absent":
        return "Vắng mặt";
      case "excused":
        return "Có phép";
      case "future":
        return "Chưa đến";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return "check-circle";
      case "absent":
        return "close-circle";
      case "excused":
        return "alert-circle";
      case "future":
        return "clock-outline";
      default:
        return "help-circle";
    }
  };

  const renderProgressCircle = (percentage: number, size: number = 80) => {
    const color =
      percentage >= 80
        ? palette.success
        : percentage >= 50
        ? palette.warning
        : palette.error;

    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressCircle, { width: size, height: size }]}>
          <View
            style={[
              styles.progressBackground,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 8,
                borderColor: "#f0f0f0",
              },
            ]}
          />
          <View
            style={[
              styles.progressArc,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 8,
                borderColor: color,
                borderTopColor: color,
                borderRightColor: percentage > 25 ? color : "#f0f0f0",
                borderBottomColor: percentage > 50 ? color : "#f0f0f0",
                borderLeftColor: percentage > 75 ? color : "#f0f0f0",
                transform: [{ rotate: "-90deg" }],
              },
            ]}
          />
          <View style={styles.progressTextContainer}>
            <Text style={[styles.progressText, { color, fontSize: size * 0.2 }]}>
              {percentage}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAttendanceRecord = (record: AttendanceRecord) => {
    const statusColor = getStatusColor(record.status);
    const statusIcon = getStatusIcon(record.status);
    const statusText = getStatusText(record.status);

    return (
      <View key={record.id} style={styles.recordCard}>
        <View style={[styles.recordLeftBorder, { backgroundColor: statusColor }]} />
        <View style={styles.recordContent}>
          <View style={styles.recordHeader}>
            <View style={styles.recordDateInfo}>
              <Text style={styles.dateText}>{formatDate(record.date)}</Text>
              <Text style={styles.slotText}>{record.timeSlotName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <MaterialCommunityIcons
                name={statusIcon as any}
                size={16}
                color="#fff"
              />
            </View>
          </View>

          <View style={styles.recordDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={palette.subtitle}
              />
              <Text style={styles.detailText}>
                {record.timeSlotName || "—"}
              </Text>
            </View>
            {(teacherName || record.teacherName) && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={14}
                  color={palette.subtitle}
                />
                <Text style={styles.detailText}>
                  {teacherName || record.teacherName}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name={statusIcon as any}
                size={14}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
            {record.notes && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={14}
                  color={palette.subtitle}
                />
                <Text style={styles.detailText}>{record.notes}</Text>
              </View>
            )}
            {record.excuseReason && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={14}
                  color={palette.warning}
                />
                <Text style={[styles.detailText, { color: palette.warning }]}>
                  Lý do: {record.excuseReason}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <BackHeader
          title="Chi Tiết Điểm Danh"
          subtitle={`${subjectCode} - ${subjectName}`}
          subtitleSmall={`Lớp: ${classCode}`}
          gradientColors={[palette.primary, palette.secondary]}
          fallbackRoute="/(student)/(tabs)/timetable"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  if (error && !attendanceStats) {
    return (
      <View style={styles.container}>
        <BackHeader
          title="Chi Tiết Điểm Danh"
          subtitle={`${subjectCode} - ${subjectName}`}
          subtitleSmall={`Lớp: ${classCode}`}
          gradientColors={[palette.primary, palette.secondary]}
          fallbackRoute="/(student)/(tabs)/timetable"
        />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={palette.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchAttendanceData()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const percentage = attendanceStats?.attendanceRate || 0;
  const totalSlots = attendanceStats?.totalSlots || 0;
  const presentCount = attendanceStats?.presentCount || 0;
  const absentCount = attendanceStats?.absentCount || 0;
  const excusedCount = attendanceStats?.excusedCount || 0;

  return (
    <View style={styles.container}>
      <BackHeader
        title="Chi Tiết Điểm Danh"
        subtitle={`${subjectCode} - ${subjectName}`}
        subtitleSmall={`Lớp: ${classCode}`}
        gradientColors={[palette.primary, palette.secondary]}
        fallbackRoute="/(student)/(tabs)/timetable"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 20 }}
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
        {/* Course Info Card */}
        <View style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>
              {subjectCode} - {subjectName}
            </Text>
            <Text style={styles.className}>Lớp: {classCode}</Text>
            {teacherName && (
              <View style={styles.teacherRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={16}
                  color={palette.subtitle}
                />
                <Text style={styles.teacherText}>{teacherName}</Text>
              </View>
            )}
          </View>

          {/* Attendance Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.progressSection}>
              {renderProgressCircle(percentage)}
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.attendedText}>
                Đã tham gia: {presentCount}/{totalSlots} buổi
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View
                    style={[styles.statDot, { backgroundColor: palette.success }]}
                  />
                  <Text style={styles.statText}>
                    {presentCount} Có mặt
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <View
                    style={[styles.statDot, { backgroundColor: palette.error }]}
                  />
                  <Text style={styles.statText}>
                    {absentCount} Vắng mặt
                  </Text>
                </View>
                {excusedCount > 0 && (
                  <View style={styles.statItem}>
                    <View
                      style={[styles.statDot, { backgroundColor: palette.warning }]}
                    />
                    <Text style={styles.statText}>
                      {excusedCount} Có phép
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Attendance Records */}
        <View style={styles.recordsContainer}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>Lịch Sử Điểm Danh</Text>
            <Text style={styles.recordsCount}>
              {attendanceRecords.length} bản ghi
            </Text>
          </View>
          {attendanceRecords.length > 0 ? (
            attendanceRecords.map((record) => renderAttendanceRecord(record))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={48}
                color={palette.subtitle}
              />
              <Text style={styles.emptyText}>Chưa có bản ghi điểm danh</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: palette.subtitle,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: palette.text,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  courseCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  courseHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.primary,
    marginBottom: 8,
  },
  className: {
    fontSize: 14,
    color: palette.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  teacherText: {
    fontSize: 13,
    color: palette.subtitle,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progressSection: {
    marginRight: 8,
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircle: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBackground: {
    position: "absolute",
  },
  progressArc: {
    position: "absolute",
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontWeight: "bold",
  },
  summaryInfo: {
    flex: 1,
  },
  attendedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.primary,
    marginBottom: 12,
  },
  statsContainer: {
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statText: {
    fontSize: 14,
    color: palette.text,
    fontWeight: "500",
  },
  recordsContainer: {
    marginTop: 8,
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.text,
  },
  recordsCount: {
    fontSize: 14,
    color: palette.subtitle,
  },
  recordCard: {
    flexDirection: "row",
    backgroundColor: palette.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordLeftBorder: {
    width: 4,
  },
  recordContent: {
    flex: 1,
    padding: 16,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recordDateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.text,
    marginBottom: 4,
  },
  slotText: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: "600",
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  recordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: palette.subtitle,
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: palette.card,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: palette.subtitle,
    textAlign: "center",
  },
});
