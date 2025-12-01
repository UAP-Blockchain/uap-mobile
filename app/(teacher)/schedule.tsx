import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TeacherServices } from "../../services/teacher/teacherServices";
import type {
  WeeklyScheduleDto,
  ScheduleItemDto,
  DailyScheduleDto,
} from "../../types/schedule";
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

interface ClassInfo {
  slotId: string;
  classId: string;
  classCode: string;
  subjectCode: string;
  subjectName: string;
  teacherName?: string;
  date: string;
  timeSlotName?: string;
  startTime?: string;
  endTime?: string;
  attendance?: "attended" | "absent" | "not_yet";
  status?: string;
  hasAttendance?: boolean;
  rawSlot: ScheduleItemDto;
}

const dayMappings: Record<
  string,
  { label: string; shortLabel: string; order: number }
> = {
  Monday: { label: "Thứ Hai", shortLabel: "T2", order: 0 },
  Tuesday: { label: "Thứ Ba", shortLabel: "T3", order: 1 },
  Wednesday: { label: "Thứ Tư", shortLabel: "T4", order: 2 },
  Thursday: { label: "Thứ Năm", shortLabel: "T5", order: 3 },
  Friday: { label: "Thứ Sáu", shortLabel: "T6", order: 4 },
  Saturday: { label: "Thứ Bảy", shortLabel: "T7", order: 5 },
  Sunday: { label: "Chủ Nhật", shortLabel: "CN", order: 6 },
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

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  } catch {
    return "—";
  }
};

const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatWeekRange = (date: Date): string => {
  const monday = getMondayOfWeek(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${formatDate(monday.toISOString())} - ${formatDate(
    sunday.toISOString()
  )}`;
};

export default function TeacherScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklyScheduleDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapAttendance = useCallback(
    (slot: ScheduleItemDto): ClassInfo["attendance"] => {
      // Backend semantics:
      // - hasAttendance === true  => lớp đã được điểm danh (ĐÃ DẠY)
      // - hasAttendance === false => lớp chưa điểm danh (CHƯA DẠY)
      if (slot.hasAttendance === true) {
        return "attended";
      }
      return "not_yet";
    },
    []
  );

  const convertSlotToClassInfo = useCallback(
    (slot: ScheduleItemDto): ClassInfo => {
      return {
        slotId: slot.slotId,
        classId: slot.classId,
        classCode: slot.classCode,
        subjectCode: slot.subjectCode,
        subjectName: slot.subjectName,
        teacherName: slot.teacherName,
        date: slot.date,
        timeSlotName: slot.timeSlotName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        attendance: mapAttendance(slot),
        status: slot.status,
        hasAttendance: slot.hasAttendance,
        rawSlot: slot,
      };
    },
    [mapAttendance]
  );

  const fetchWeeklySchedule = useCallback(
    async (week: Date, isRefresh = false) => {
      const monday = getMondayOfWeek(week);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await TeacherServices.getMyWeeklySchedule(
          monday.toISOString()
        );
        setWeeklySchedule(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải lịch giảng dạy.";
        setError(message);
        setWeeklySchedule(null);
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
    []
  );

  useEffect(() => {
    fetchWeeklySchedule(selectedWeek);
  }, [selectedWeek, fetchWeeklySchedule]);

  const handleWeekChange = useCallback((direction: "prev" | "next") => {
    setSelectedWeek((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  }, []);

  const handleCurrentWeek = useCallback(() => {
    setSelectedWeek(new Date());
  }, []);

  const onRefresh = useCallback(() => {
    fetchWeeklySchedule(selectedWeek, true);
  }, [selectedWeek, fetchWeeklySchedule]);

  const organizedDays = useMemo(() => {
    if (!weeklySchedule) return [];

    const days = weeklySchedule.days
      .map((day) => {
        const meta = dayMappings[day.dayOfWeek];
        if (!meta) return null;

        const classes = day.slots.map(convertSlotToClassInfo);

        return {
          ...meta,
          date: day.date,
          classes: classes.sort((a, b) => {
            const timeA = a.startTime || "00:00";
            const timeB = b.startTime || "00:00";
            return timeA.localeCompare(timeB);
          }),
        };
      })
      .filter((day): day is NonNullable<typeof day> => day !== null)
      .sort((a, b) => a.order - b.order);

    return days;
  }, [weeklySchedule, convertSlotToClassInfo]);

  const getAttendanceColor = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return palette.success;
      case "absent":
        return palette.error;
      case "not_yet":
        return palette.warning;
      default:
        return palette.subtitle;
    }
  };

  const getAttendanceText = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return "Đã dạy";
      case "absent":
        return "Vắng";
      case "not_yet":
        return "Chưa dạy";
      default:
        return "";
    }
  };

  const getAttendanceIcon = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return "check-circle";
      case "absent":
        return "close-circle";
      case "not_yet":
        return "clock-outline";
      default:
        return "help-circle";
    }
  };

  const handleClassPress = useCallback((classInfo: ClassInfo) => {
    if (!classInfo.slotId) {
      Alert.alert("Thông báo", "Không tìm thấy thông tin slot.");
      return;
    }

    // Navigate to attendance screen với slotId và các thông tin cần thiết
    router.push({
      pathname: "/(teacher)/attendance",
      params: {
        slotId: classInfo.slotId,
        classCode: classInfo.classCode,
        subjectName: classInfo.subjectName,
        date: formatDate(classInfo.date),
        timeSlotName: classInfo.timeSlotName || formatTimeRange(classInfo.startTime, classInfo.endTime),
      },
    } as any);
  }, []);

  const renderClassCard = useCallback(
    (classInfo: ClassInfo) => {
      const timeRange = formatTimeRange(
        classInfo.startTime,
        classInfo.endTime
      );

      return (
        <TouchableOpacity
          key={`${classInfo.slotId}-${classInfo.date}`}
          style={styles.classCard}
          onPress={() => handleClassPress(classInfo)}
          activeOpacity={0.7}
        >
          <View style={styles.classCardContent}>
            <View style={styles.classHeader}>
              <View style={styles.classInfo}>
                <Text style={styles.courseCode}>{classInfo.subjectCode}</Text>
                <Text style={styles.courseName} numberOfLines={2}>
                  {classInfo.subjectName}
                </Text>
              </View>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>
                  {classInfo.timeSlotName || timeRange}
                </Text>
              </View>
            </View>

            <View style={styles.classDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={14}
                  color={palette.subtitle}
                />
                <Text style={styles.detailText}>{classInfo.classCode}</Text>
              </View>
              {classInfo.rawSlot.notes && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={palette.subtitle}
                  />
                  <Text style={styles.detailText}>
                    {classInfo.rawSlot.notes}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.classFooter}>
              {classInfo.attendance && (
                <View style={styles.attendanceContainer}>
                  <MaterialCommunityIcons
                    name={getAttendanceIcon(classInfo.attendance) as any}
                    size={14}
                    color={getAttendanceColor(classInfo.attendance)}
                  />
                  <Text
                    style={[
                      styles.attendanceText,
                      { color: getAttendanceColor(classInfo.attendance) },
                    ]}
                  >
                    {getAttendanceText(classInfo.attendance)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => handleClassPress(classInfo)}
              >
                <Text style={styles.detailsButtonText}>Điểm danh</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color={palette.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleClassPress]
  );

  const renderDaySchedule = useCallback(
    (day: {
      label: string;
      shortLabel: string;
      date: string;
      classes: ClassInfo[];
    }) => {
      return (
        <View key={day.label} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayName}>{day.label}</Text>
              <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
            </View>
            <View style={styles.classCount}>
              <Text style={styles.classCountText}>{day.classes.length} ca</Text>
            </View>
          </View>

          {day.classes.length > 0 ? (
            <View style={styles.classesContainer}>
              {day.classes.map((classInfo) => renderClassCard(classInfo))}
            </View>
          ) : (
            <View style={styles.emptyDay}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={40}
                color={palette.subtitle}
              />
              <Text style={styles.emptyDayText}>Không có ca dạy</Text>
            </View>
          )}
        </View>
      );
    },
    [renderClassCard]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[palette.primary, palette.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Lịch Giảng Dạy</Text>
            <Text style={styles.headerSubtitle}>
              {weeklySchedule?.weekLabel ||
                `Tuần: ${formatWeekRange(selectedWeek)}`}
            </Text>
            {weeklySchedule && (
              <Text style={styles.headerMeta}>
                Tổng số ca: {weeklySchedule.totalSlots}
              </Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleWeekChange("prev")}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleCurrentWeek}
            >
              <Text style={styles.currentWeekText}>Hôm nay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleWeekChange("next")}
            >
              <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Đang tải lịch giảng dạy...</Text>
        </View>
      ) : error && !weeklySchedule ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={palette.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchWeeklySchedule(selectedWeek)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scheduleContainer}
          contentContainerStyle={{ paddingBottom: 16 }}
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
          {organizedDays.map((day) => renderDaySchedule(day))}

          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Chú thích:</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={14}
                  color={palette.success}
                />
                <Text style={styles.legendText}>Đã dạy</Text>
              </View>
              <View style={styles.legendItem}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={14}
                  color={palette.error}
                />
                <Text style={styles.legendText}>Vắng</Text>
              </View>
              <View style={styles.legendItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={palette.warning}
                />
                <Text style={styles.legendText}>Chưa dạy</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
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
  headerContent: {
    gap: 16,
  },
  backButton: {
    padding: 4,
    marginBottom: 8,
  },
  headerInfo: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.95,
  },
  headerMeta: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.85,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  navButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  currentWeekText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  scheduleContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: palette.card,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: palette.surface,
  },
  dayInfo: {
    gap: 4,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.text,
  },
  dayDate: {
    fontSize: 14,
    color: palette.subtitle,
  },
  classCount: {
    backgroundColor: palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  classCountText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  classesContainer: {
    padding: 16,
    gap: 12,
  },
  emptyDay: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyDayText: {
    fontSize: 14,
    color: palette.subtitle,
  },
  classCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
    overflow: "hidden",
  },
  classCardContent: {
    padding: 16,
    gap: 12,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  classInfo: {
    flex: 1,
    gap: 4,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.primary,
  },
  courseName: {
    fontSize: 14,
    color: palette.text,
    lineHeight: 20,
  },
  timeBadge: {
    backgroundColor: "rgba(54, 116, 181, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 11,
    color: palette.primary,
    fontWeight: "600",
  },
  classDetails: {
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
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  attendanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: "600",
  },
  legendContainer: {
    backgroundColor: palette.card,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: palette.text,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: palette.subtitle,
  },
});

