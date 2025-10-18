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
  Alert,
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
  const [expandedSemesters, setExpandedSemesters] = useState<string[]>([
    "sem9",
  ]);

  // Mock semester data
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
        {
          code: "MLN122",
          name: "Political Economics of Marxism – Leninism",
          isActive: false,
        },
        { code: "WDU203c", name: "The UI/UX Design", isActive: false },
        {
          code: "MLN111",
          name: "Philosophy of Marxism – Leninism",
          isActive: false,
        },
      ],
    },
    {
      id: "sem7",
      name: "Spring 2025",
      courses: [
        { code: "PMG201c", name: "Project Management", isActive: false },
        {
          code: "SWD392",
          name: "Software Architecture and Design",
          isActive: false,
        },
        {
          code: "EXE101",
          name: "Experiential Entrepreneurship 1",
          isActive: false,
        },
        {
          code: "SDN302",
          name: "Server-Side Development with NodeJS, Express, and MongoDB",
          isActive: false,
        },
        {
          code: "MMA301",
          name: "Multiplatform Mobile App Development",
          isActive: false,
        },
      ],
    },
  ];

  // Mock attendance data
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
    if (auth?.userProfile) {
      console.log("User from Redux:", auth.userProfile);
    }
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
        return "Có mặt";
      case "Absent":
        return "Vắng mặt";
      case "Future":
        return "Chưa đến";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return "checkcircle";
      case "Absent":
        return "closecircle";
      case "Future":
        return "exclamationcircle";
      default:
        return "questioncircle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("vi-VN", { weekday: "long" });
    const dateFormatted = date.toLocaleDateString("vi-VN");
    return `${dayOfWeek} ${dateFormatted}`;
  };

  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters((prev) =>
      prev.includes(semesterId)
        ? prev.filter((id) => id !== semesterId)
        : [...prev, semesterId]
    );
  };

  const handleCourseSelect = (courseCode: string) => {
    setSelectedCourse(courseCode);
    Alert.alert("Thông báo", `Đã chọn môn học: ${courseCode}`);
  };

  const renderSemesterItem = (semester: Semester) => {
    const isExpanded = expandedSemesters.includes(semester.id);

    return (
      <View key={semester.id} style={styles.semesterItem}>
        <TouchableOpacity
          style={styles.semesterHeader}
          onPress={() => toggleSemester(semester.id)}
        >
          <Text style={styles.semesterName}>{semester.name}</Text>
          <AntDesign
            name={isExpanded ? "up" : "down"}
            size={16}
            color="#8c8c8c"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.coursesContainer}>
            {semester.courses.map((course) => (
              <TouchableOpacity
                key={course.code}
                style={[
                  styles.courseItem,
                  course.isActive && styles.activeCourseItem,
                ]}
                onPress={() => handleCourseSelect(course.code)}
              >
                <View style={styles.courseInfo}>
                  <Text
                    style={[
                      styles.courseCode,
                      course.isActive && styles.activeCourseCode,
                    ]}
                  >
                    {course.code}
                  </Text>
                  <Text style={styles.courseName} numberOfLines={2}>
                    {course.name}
                  </Text>
                </View>
                {course.isActive && (
                  <View style={styles.activeIndicator}>
                    <AntDesign name="check" size={12} color="#1890ff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAttendanceRecord = (record: AttendanceRecord) => {
    return (
      <View key={record.no} style={styles.attendanceRecord}>
        <View style={styles.recordHeader}>
          <View style={styles.recordNumber}>
            <Text style={styles.recordNumberText}>{record.no}</Text>
          </View>
          <View style={styles.statusBadge}>
            <AntDesign
              name={getStatusIcon(record.status)}
              size={14}
              color={getStatusColor(record.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(record.status) },
              ]}
            >
              {getStatusText(record.status)}
            </Text>
          </View>
        </View>

        <View style={styles.recordContent}>
          <View style={styles.recordRow}>
            <AntDesign name="calendar" size={14} color="#8c8c8c" />
            <Text style={styles.recordLabel}>Ngày:</Text>
            <Text style={styles.recordValue}>{formatDate(record.date)}</Text>
          </View>

          <View style={styles.recordRow}>
            <AntDesign name="clockcircle" size={14} color="#8c8c8c" />
            <Text style={styles.recordLabel}>Ca học:</Text>
            <Text style={styles.recordValue}>
              Slot {record.slot} ({record.slotTime})
            </Text>
          </View>

          <View style={styles.recordRow}>
            <AntDesign name="home" size={14} color="#8c8c8c" />
            <Text style={styles.recordLabel}>Phòng:</Text>
            <Text style={styles.recordValue}>{record.room}</Text>
          </View>

          <View style={styles.recordRow}>
            <AntDesign name="user" size={14} color="#8c8c8c" />
            <Text style={styles.recordLabel}>Giảng viên:</Text>
            <Text style={styles.recordValue}>{record.lecturer}</Text>
          </View>

          <View style={styles.recordRow}>
            <AntDesign name="team" size={14} color="#8c8c8c" />
            <Text style={styles.recordLabel}>Nhóm:</Text>
            <Text style={styles.recordValue}>{record.groupName}</Text>
          </View>

          {record.lecturerComment && (
            <View style={styles.commentContainer}>
              <AntDesign name="message" size={14} color="#8c8c8c" />
              <Text style={styles.commentLabel}>Nhận xét:</Text>
              <Text style={styles.commentText}>{record.lecturerComment}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

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
            <Text style={styles.headerTitle}>Điểm Danh</Text>
            <Text style={styles.headerSubtitle}>
              {auth?.userProfile?.userName || "Sinh viên"} (
              {auth?.userProfile?.code || "Mã sinh viên"})
            </Text>
          </View>
          <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn môn học</Text>
          <View style={styles.semestersContainer}>
            {semesters.map((semester) => renderSemesterItem(semester))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê điểm danh</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="calendar" size={20} color="#1890ff" />
              </View>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Tổng buổi học</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="checkcircle" size={20} color="#52c41a" />
              </View>
              <Text style={styles.statNumber}>{presentSessions}</Text>
              <Text style={styles.statLabel}>Có mặt</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="closecircle" size={20} color="#ff4d4f" />
              </View>
              <Text style={styles.statNumber}>{absentSessions}</Text>
              <Text style={styles.statLabel}>Vắng mặt</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AntDesign name="exclamationcircle" size={20} color="#faad14" />
              </View>
              <Text style={styles.statNumber}>{absentPercentage}%</Text>
              <Text style={styles.statLabel}>Tỷ lệ vắng</Text>
            </View>
          </View>

          {/* Warning */}
          {absentPercentage > 20 && (
            <View style={styles.warningContainer}>
              <AntDesign name="warning" size={16} color="#ff4d4f" />
              <Text style={styles.warningText}>
                CẢNH BÁO: Tỷ lệ vắng mặt {absentPercentage}% ({absentSessions}/
                {completedSessions} buổi)
              </Text>
            </View>
          )}
        </View>

        {/* Attendance Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử điểm danh</Text>
          <View style={styles.recordsContainer}>
            {attendanceData.map((record) => renderAttendanceRecord(record))}
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 12,
  },
  semestersContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  semesterItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  semesterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  semesterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  coursesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  activeCourseItem: {
    backgroundColor: "#e6f7ff",
    borderLeftWidth: 3,
    borderLeftColor: "#1890ff",
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  activeCourseCode: {
    color: "#1890ff",
  },
  courseName: {
    fontSize: 12,
    color: "#8c8c8c",
    lineHeight: 16,
  },
  activeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e6f7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8c8c8c",
    textAlign: "center",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff2f0",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4f",
  },
  warningText: {
    fontSize: 14,
    color: "#ff4d4f",
    marginLeft: 8,
    fontWeight: "500",
  },
  recordsContainer: {
    gap: 12,
  },
  attendanceRecord: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recordNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1890ff",
    justifyContent: "center",
    alignItems: "center",
  },
  recordNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  recordContent: {
    padding: 16,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recordLabel: {
    fontSize: 14,
    color: "#8c8c8c",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  recordValue: {
    fontSize: 14,
    color: "#262626",
    flex: 1,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  commentLabel: {
    fontSize: 14,
    color: "#8c8c8c",
    marginLeft: 8,
    marginRight: 8,
  },
  commentText: {
    fontSize: 14,
    color: "#262626",
    flex: 1,
    fontStyle: "italic",
  },
});
