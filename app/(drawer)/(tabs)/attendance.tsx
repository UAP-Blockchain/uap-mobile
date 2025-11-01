import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface CourseAttendance {
  courseCode: string;
  courseName: string;
  className: string;
  startDate: string;
  endDate: string;
  attended: number;
  total: number;
  percentage: number;
  status: "Present" | "Absent" | "Future";
}

export default function AttendancePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);
  const [selectedSemester, setSelectedSemester] = useState("fall2025");

  // Mock semester data
  const semesters = [
    { id: "fall2025", name: "FALL2025", isActive: true },
    { id: "summer2025", name: "SUMMER2025", isActive: false },
    { id: "spring2025", name: "SPRING2025", isActive: false },
    { id: "fall2024", name: "FALL2024", isActive: false },
  ];

  // Mock course attendance data
  const courseAttendanceData: CourseAttendance[] = [
    {
      courseCode: "HCM202",
      courseName: "Ho Chi Minh Ideology",
      className: "Half1_GD1705",
      startDate: "09/09/2025",
      endDate: "10/10/2025",
      attended: 10,
      total: 10,
      percentage: 100,
      status: "Present",
    },
    {
      courseCode: "MLN131",
      courseName: "Scientific socialism",
      className: "Half2_GD1704",
      startDate: "13/10/2025",
      endDate: "13/11/2025",
      attended: 2,
      total: 2,
      percentage: 100,
      status: "Present",
    },
    {
      courseCode: "VNR202",
      courseName: "History of Vietnam Communist Party",
      className: "Half2_GD1705",
      startDate: "14/10/2025",
      endDate: "14/11/2025",
      attended: 1,
      total: 2,
      percentage: 50,
      status: "Absent",
    },
    {
      courseCode: "SEP490",
      courseName: "SE Capstone Project",
      className: "FA25SE210_GFA130",
      startDate: "13/09/2025",
      endDate: "20/12/2025",
      attended: 4,
      total: 5,
      percentage: 80,
      status: "Present",
    },
  ];

  useEffect(() => {
    console.log("AttendancePage mounted", auth);
  }, [auth]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "#52c41a";
    if (percentage >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return "#52c41a";
    if (percentage >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const renderProgressCircle = (percentage: number, size: number = 40) => {
    const color = getProgressColor(percentage);
    const radius = size / 2;
    const strokeWidth = 4;
    const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressCircle, { width: size, height: size }]}>
          {/* Background circle */}
          <View
            style={[
              styles.progressBackground,
              {
                width: size,
                height: size,
                borderRadius: radius,
                borderWidth: strokeWidth,
                borderColor: "#e8e8e8",
              },
            ]}
          />
          {/* Progress arc using border */}
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
                borderRightColor: percentage > 25 ? color : "#e8e8e8",
                borderBottomColor: percentage > 50 ? color : "#e8e8e8",
                borderLeftColor: percentage > 75 ? color : "#e8e8e8",
                transform: [{ rotate: "-90deg" }],
              },
            ]}
          />
          {/* Percentage text */}
          <View style={styles.progressTextContainer}>
            <Text style={[styles.progressText, { color }]}>{percentage}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCourseCard = (course: CourseAttendance) => {
    const statusColor = getStatusColor(course.percentage);

    return (
      <TouchableOpacity
        key={course.courseCode}
        style={styles.courseCard}
        onPress={() => {
          router.push(
            `/(drawer)/(tabs)/attendance-detail/${course.courseCode}` as any
          );
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.progressSection}>
            {renderProgressCircle(course.percentage)}
          </View>

          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>
              {course.courseCode} - {course.courseName}
            </Text>
            <Text style={styles.className}>Class name: {course.className}</Text>
            <Text style={styles.dateRange}>Start date: {course.startDate}</Text>
            <Text style={styles.dateRange}>End date: {course.endDate}</Text>
            <Text style={[styles.attendedText, { color: statusColor }]}>
              Attended: {course.attended}/{course.total}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#3674B5", "#1890ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Semester Selection */}
        <View style={styles.semesterContainer}>
          <View style={styles.semesterButtons}>
            {semesters.map((semester) => (
              <TouchableOpacity
                key={semester.id}
                style={[
                  styles.semesterButton,
                  semester.isActive && styles.activeSemesterButton,
                ]}
                onPress={() => setSelectedSemester(semester.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.semesterButtonText,
                    semester.isActive && styles.activeSemesterButtonText,
                  ]}
                >
                  {semester.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Course Attendance Cards */}
        <View style={styles.cardsContainer}>
          {courseAttendanceData.map((course) => renderCourseCard(course))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  semesterContainer: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  semesterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  semesterButton: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeSemesterButton: {
    backgroundColor: "#3674B5",
    borderColor: "#3674B5",
    shadowColor: "#3674B5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  semesterButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  activeSemesterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cardsContainer: {
    gap: 12,
    flex: 1,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardContent: {
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
    fontSize: 10,
    fontWeight: "bold",
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1890ff",
    marginBottom: 4,
  },
  className: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },
  dateRange: {
    fontSize: 10,
    color: "#888",
    marginBottom: 2,
  },
  attendedText: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
  },
});
