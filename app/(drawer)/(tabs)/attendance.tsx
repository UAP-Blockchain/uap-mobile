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

interface Course {
  code: string;
  name: string;
  isActive: boolean;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

interface AttendanceRecord {
  no: number;
  date: string;
  slot: number;
  slotTime: string;
  room: string;
  lecturer: string;
  groupName: string;
  status: "Present" | "Absent" | "Future";
  lecturerComment?: string;
}

export default function AttendancePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);
  const [selectedCourse, setSelectedCourse] = useState("MLN131");

  // Mock semester data - simplified
  const semesters: Semester[] = [
    {
      id: "sem9",
      name: "Fall 2025",
      courses: [
        { code: "MLN131", name: "Scientific Socialism", isActive: true },
        {
          code: "VNR202",
          name: "History of Vietnam Communist Party",
          isActive: false,
        },
        { code: "HCM202", name: "Ho Chi Minh Ideology", isActive: false },
        { code: "SEP490", name: "SE Capstone Project", isActive: false },
      ],
    },
    {
      id: "sem8",
      name: "Summer 2025",
      courses: [
        { code: "WDP301", name: "Web Development Project", isActive: false },
        {
          code: "EXE201",
          name: "Experiential Entrepreneurship 2",
          isActive: false,
        },
        { code: "PRM392", name: "Mobile Programming", isActive: false },
      ],
    },
  ];

  // Mock attendance data - 10 slots
  const attendanceData: AttendanceRecord[] = [
    {
      no: 1,
      date: "2025-09-08",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Present",
    },
    {
      no: 2,
      date: "2025-09-12",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Present",
    },
    {
      no: 3,
      date: "2025-09-16",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Absent",
    },
    {
      no: 4,
      date: "2025-09-19",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Present",
    },
    {
      no: 5,
      date: "2025-09-23",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 6,
      date: "2025-09-26",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 7,
      date: "2025-09-30",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 8,
      date: "2025-10-03",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 9,
      date: "2025-10-07",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 10,
      date: "2025-10-10",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
  ];

  useEffect(() => {
    console.log("AttendancePage mounted", auth);
  }, [auth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "#52c41a";
      case "Absent":
        return "#ff4d4f";
      case "Future":
        return "#8c8c8c";
      default:
        return "#8c8c8c";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Present":
        return "Present";
      case "Absent":
        return "Absent";
      case "Future":
        return "Future";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return "checkcircleo";
      case "Absent":
        return "closecircleo";
      case "Future":
        return "exclamationcircleo";
      default:
        return "questioncircleo";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const dateFormatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${dayOfWeek} ${dateFormatted}`;
  };

  const handleCourseSelect = (courseCode: string) => {
    setSelectedCourse(courseCode);
  };

  const renderCourseItem = (course: Course) => (
    <TouchableOpacity
      key={course.code}
      style={[styles.courseItem, course.isActive && styles.activeCourseItem]}
      onPress={() => handleCourseSelect(course.code)}
    >
      <Text
        style={[styles.courseCode, course.isActive && styles.activeCourseCode]}
      >
        {course.code}
      </Text>
      <Text style={styles.courseName} numberOfLines={1}>
        {course.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAttendanceRecord = (record: AttendanceRecord) => (
    <View key={record.no} style={styles.recordRow}>
      <View style={styles.recordNumber}>
        <Text style={styles.recordNumberText}>{record.no}</Text>
      </View>

      <View style={styles.recordDate}>
        <Text style={styles.dateText}>{formatDate(record.date)}</Text>
      </View>

      <View style={styles.recordSlot}>
        <Text style={styles.slotText}>Slot {record.slot}</Text>
        <Text style={styles.timeText}>{record.slotTime}</Text>
      </View>

      <View style={styles.recordRoom}>
        <Text style={styles.roomText}>{record.room}</Text>
      </View>

      <View style={styles.recordLecturer}>
        <Text style={styles.lecturerText}>{record.lecturer}</Text>
      </View>

      <View style={styles.recordGroup}>
        <Text style={styles.groupText}>{record.groupName}</Text>
      </View>

      <View style={styles.recordStatus}>
        <AntDesign
          name={getStatusIcon(record.status)}
          size={12}
          color={getStatusColor(record.status)}
        />
        <Text
          style={[styles.statusText, { color: getStatusColor(record.status) }]}
        >
          {getStatusText(record.status)}
        </Text>
      </View>
    </View>
  );

  // Calculate statistics
  const totalSessions = attendanceData.length;
  const completedSessions = attendanceData.filter(
    (record) => record.status !== "Future"
  ).length;
  const presentSessions = attendanceData.filter(
    (record) => record.status === "Present"
  ).length;
  const absentSessions = attendanceData.filter(
    (record) => record.status === "Absent"
  ).length;
  const absentPercentage =
    completedSessions > 0
      ? Math.round((absentSessions / completedSessions) * 100)
      : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#1890ff", "#40a9ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>View Attendance</Text>
            <Text style={styles.headerSubtitle}>
              {auth?.userProfile?.userName || "Student"} (
              {auth?.userProfile?.code || "Student Code"})
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Course</Text>
          <View style={styles.coursesContainer}>
            {semesters[0].courses.map((course) => renderCourseItem(course))}
          </View>
        </View>

        {/* Statistics Summary */}
        <View style={styles.section}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              ABSENT: {absentPercentage}% ABSENT SO FAR ({absentSessions} ABSENT
              ON {completedSessions} TOTAL).
            </Text>
          </View>
        </View>

        {/* Attendance Table */}
        <View style={styles.section}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>NO.</Text>
              <Text style={styles.headerCell}>DATE</Text>
              <Text style={styles.headerCell}>SLOT</Text>
              <Text style={styles.headerCell}>ROOM</Text>
              <Text style={styles.headerCell}>LECTURER</Text>
              <Text style={styles.headerCell}>GROUP</Text>
              <Text style={styles.headerCell}>STATUS</Text>
            </View>

            {/* Table Body */}
            <View style={styles.tableBody}>
              {attendanceData.map((record) => renderAttendanceRecord(record))}
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },
  coursesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  activeCourseItem: {
    backgroundColor: "#e6f7ff",
    borderColor: "#1890ff",
  },
  courseCode: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#262626",
  },
  activeCourseCode: {
    color: "#1890ff",
  },
  courseName: {
    fontSize: 10,
    color: "#8c8c8c",
    marginTop: 2,
  },
  summaryContainer: {
    backgroundColor: "#fff2f0",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4f",
  },
  summaryText: {
    fontSize: 14,
    color: "#ff4d4f",
    fontWeight: "500",
    textAlign: "center",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1890ff",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  tableBody: {
    backgroundColor: "#fff",
  },
  recordRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  recordNumber: {
    flex: 0.5,
    alignItems: "center",
  },
  recordNumberText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1890ff",
  },
  recordDate: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 9,
    color: "#262626",
    textAlign: "center",
  },
  recordSlot: {
    flex: 1,
    alignItems: "center",
  },
  slotText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#262626",
  },
  timeText: {
    fontSize: 8,
    color: "#8c8c8c",
  },
  recordRoom: {
    flex: 0.8,
    alignItems: "center",
  },
  roomText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#262626",
    textAlign: "center",
  },
  recordLecturer: {
    flex: 1,
    alignItems: "center",
  },
  lecturerText: {
    fontSize: 9,
    color: "#262626",
    textAlign: "center",
  },
  recordGroup: {
    flex: 1,
    alignItems: "center",
  },
  groupText: {
    fontSize: 8,
    color: "#8c8c8c",
    textAlign: "center",
  },
  recordStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "500",
    marginLeft: 2,
  },
});
