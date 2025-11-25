import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../../lib/features/loginSlice";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface AttendanceRecord {
  id: string;
  date: string;
  slot: number;
  lecturer: string;
  status: "present" | "absent" | "future";
  time: string;
}

interface CourseDetails {
  courseCode: string;
  courseName: string;
  className: string;
  totalSessions: number;
  attendedSessions: number;
  percentage: number;
  presentCount: number;
  absentCount: number;
  futureCount: number;
}

export default function AttendanceDetailPage() {
  const insets = useSafeAreaInsets();
  const { courseCode } = useLocalSearchParams();
  const auth = useSelector(selectAuthLogin);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  useEffect(() => {
    // Mock data - in real app, fetch from API based on courseCode
    const mockCourseDetails: CourseDetails = {
      courseCode: courseCode as string,
      courseName: "Ho Chi Minh Ideology",
      className: "Half1_GD1705",
      totalSessions: 10,
      attendedSessions: 10,
      percentage: 100,
      presentCount: 10,
      absentCount: 0,
      futureCount: 0,
    };

    const mockAttendanceRecords: AttendanceRecord[] = [
      {
        id: "1",
        date: "09/09/2025",
        slot: 1,
        lecturer: "GV001",
        status: "present",
        time: "08:00 - 10:00",
      },
      {
        id: "2",
        date: "12/09/2025",
        slot: 2,
        lecturer: "GV001",
        status: "present",
        time: "10:30 - 12:30",
      },
      {
        id: "3",
        date: "16/09/2025",
        slot: 3,
        lecturer: "GV001",
        status: "present",
        time: "14:00 - 16:00",
      },
      {
        id: "4",
        date: "19/09/2025",
        slot: 4,
        lecturer: "GV001",
        status: "present",
        time: "08:00 - 10:00",
      },
      {
        id: "5",
        date: "23/09/2025",
        slot: 5,
        lecturer: "GV001",
        status: "present",
        time: "10:30 - 12:30",
      },
      {
        id: "6",
        date: "26/09/2025",
        slot: 6,
        lecturer: "GV001",
        status: "present",
        time: "14:00 - 16:00",
      },
      {
        id: "7",
        date: "30/09/2025",
        slot: 7,
        lecturer: "GV001",
        status: "present",
        time: "08:00 - 10:00",
      },
      {
        id: "8",
        date: "03/10/2025",
        slot: 8,
        lecturer: "GV001",
        status: "present",
        time: "10:30 - 12:30",
      },
      {
        id: "9",
        date: "07/10/2025",
        slot: 9,
        lecturer: "GV001",
        status: "present",
        time: "14:00 - 16:00",
      },
      {
        id: "10",
        date: "10/10/2025",
        slot: 10,
        lecturer: "GV001",
        status: "present",
        time: "08:00 - 10:00",
      },
    ];

    setCourseDetails(mockCourseDetails);
    setAttendanceRecords(mockAttendanceRecords);
  }, [courseCode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "#52c41a";
      case "absent":
        return "#ff4d4f";
      case "future":
        return "#faad14";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return "check";
      case "absent":
        return "close";
      case "future":
        return "check";
      default:
        return "check";
    }
  };

  const renderProgressCircle = (percentage: number, size: number = 60) => {
    const color =
      percentage >= 80 ? "#52c41a" : percentage >= 50 ? "#faad14" : "#ff4d4f";
    const radius = size / 2;
    const strokeWidth = 6;

    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressCircle, { width: size, height: size }]}>
          <View
            style={[
              styles.progressBackground,
              {
                width: size,
                height: size,
                borderRadius: radius,
                borderWidth: strokeWidth,
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
                borderRadius: radius,
                borderWidth: strokeWidth,
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
            <Text style={[styles.progressText, { color }]}>{percentage}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAttendanceRecord = (record: AttendanceRecord) => {
    const statusColor = getStatusColor(record.status);
    const statusIcon = getStatusIcon(record.status);

    return (
      <View key={record.id} style={styles.recordCard}>
        <View style={styles.recordLeft}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{record.date}</Text>
            <Text style={styles.slotText}>Slot {record.slot}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{record.time}</Text>
            <Text style={styles.lecturerText}>Lecturer: {record.lecturer}</Text>
          </View>
        </View>
        <View style={styles.recordRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <AntDesign name={statusIcon} size={12} color="#fff" />
          </View>
        </View>
      </View>
    );
  };

  if (!courseDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header with Orange Gradient */}
      <LinearGradient colors={["#fa8c16", "#ffc53d"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
          <AntDesign name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Details</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Info Card */}
        <View style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>
              {courseDetails.courseCode} - {courseDetails.courseName}
            </Text>
            <Text style={styles.className}>
              Class: {courseDetails.className}
            </Text>
          </View>

          {/* Attendance Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.progressSection}>
              {renderProgressCircle(courseDetails.percentage)}
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.attendedText}>
                Attended: {courseDetails.attendedSessions}/
                {courseDetails.totalSessions}
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View
                    style={[styles.statDot, { backgroundColor: "#52c41a" }]}
                  />
                  <Text style={styles.statText}>
                    {courseDetails.presentCount} Present
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <View
                    style={[styles.statDot, { backgroundColor: "#ff4d4f" }]}
                  />
                  <Text style={styles.statText}>
                    {courseDetails.absentCount} Absent
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <View
                    style={[styles.statDot, { backgroundColor: "#faad14" }]}
                  />
                  <Text style={styles.statText}>
                    {courseDetails.futureCount} Future
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Attendance Records */}
        <View style={styles.recordsContainer}>
          <Text style={styles.recordsTitle}>Attendance Records</Text>
          {attendanceRecords.map((record) => renderAttendanceRecord(record))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#fff2e6",
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fa8c16",
    marginBottom: 4,
  },
  className: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressSection: {
    marginRight: 12,
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
    backgroundColor: "#f0f0f0",
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
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryInfo: {
    flex: 1,
  },
  attendedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fa8c16",
    marginBottom: 12,
  },
  statsContainer: {
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  recordsContainer: {
    marginTop: 12,
    marginBottom: 100, // Extra space for bottom nav
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  recordCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  recordLeft: {
    flex: 1,
  },
  dateContainer: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  slotText: {
    fontSize: 12,
    color: "#fa8c16",
    fontWeight: "600",
  },
  timeContainer: {
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  lecturerText: {
    fontSize: 10,
    color: "#999",
  },
  recordRight: {
    alignItems: "center",
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
