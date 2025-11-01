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

interface ClassInfo {
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  building: string;
  attendance?: "attended" | "absent" | "not_yet";
  week: string;
  slot: number;
  time: string;
}

interface DaySchedule {
  day: string;
  date: string;
  classes: ClassInfo[];
}

export default function TimetablePage() {
  const insets = useSafeAreaInsets();
  const auth = useSelector(selectAuthLogin);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Mock timetable data organized by days
  const weekSchedule: DaySchedule[] = [
    {
      day: "Thứ Hai",
      date: "22/09",
      classes: [],
    },
    {
      day: "Thứ Ba",
      date: "23/09",
      classes: [
        {
          courseCode: "HCM202",
          courseName: "Ho Chi Minh Ideology",
          instructor: "Dr. Nguyen Van A",
          room: "NVH 409",
          building: "NVH",
          attendance: "attended",
          week: "22/09 - 28/09",
          slot: 1,
          time: "07:30 - 09:20",
        },
        {
          courseCode: "MLN131",
          courseName: "Marxist-Leninist Philosophy",
          instructor: "Prof. Tran Thi B",
          room: "NVH 502",
          building: "NVH",
          attendance: "attended",
          week: "22/09 - 28/09",
          slot: 3,
          time: "12:30 - 14:20",
        },
      ],
    },
    {
      day: "Thứ Tư",
      date: "24/09",
      classes: [],
    },
    {
      day: "Thứ Năm",
      date: "25/09",
      classes: [
        {
          courseCode: "HCM202",
          courseName: "Ho Chi Minh Ideology",
          instructor: "Dr. Nguyen Van A",
          room: "NVH 409",
          building: "NVH",
          attendance: "not_yet",
          week: "22/09 - 28/09",
          slot: 1,
          time: "07:30 - 09:20",
        },
        {
          courseCode: "MLN131",
          courseName: "Marxist-Leninist Philosophy",
          instructor: "Prof. Tran Thi B",
          room: "NVH 502",
          building: "NVH",
          attendance: "not_yet",
          week: "22/09 - 28/09",
          slot: 3,
          time: "12:30 - 14:20",
        },
      ],
    },
    {
      day: "Thứ Sáu",
      date: "26/09",
      classes: [],
    },
    {
      day: "Thứ Bảy",
      date: "27/09",
      classes: [
        {
          courseCode: "SEP490",
          courseName: "Capstone Project",
          instructor: "Mr. Le Van C",
          room: "P.136",
          building: "Alpha",
          attendance: "not_yet",
          week: "22/09 - 28/09",
          slot: 3,
          time: "12:30 - 14:20",
        },
      ],
    },
    {
      day: "Chủ Nhật",
      date: "28/09",
      classes: [],
    },
  ];

  useEffect(() => {
    console.log("TimetablePage mounted", auth);
    if (auth?.userProfile) {
      console.log("User from Redux:", auth.userProfile);
    }
  }, [auth]);

  const getAttendanceColor = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return "#52c41a";
      case "absent":
        return "#ff4d4f";
      case "not_yet":
        return "#faad14";
      default:
        return "#8c8c8c";
    }
  };

  const getAttendanceText = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return "Đã tham gia";
      case "absent":
        return "Vắng mặt";
      case "not_yet":
        return "Chưa đến";
      default:
        return "";
    }
  };

  const getAttendanceIcon = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return "checkcircleo";
      case "absent":
        return "closecircleo";
      case "not_yet":
        return "exclamationcircleo";
      default:
        return "questioncircleo";
    }
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedWeek(newDate);
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.getDate()}/${
      startOfWeek.getMonth() + 1
    } - ${endOfWeek.getDate()}/${
      endOfWeek.getMonth() + 1
    }/${endOfWeek.getFullYear()}`;
  };

  const handleViewDetails = (classInfo: ClassInfo) => {
    router.push(`/(drawer)/class-detail/${classInfo.courseCode}` as any);
  };

  const renderClassCard = (classInfo: ClassInfo) => {
    return (
      <TouchableOpacity
        key={`${classInfo.courseCode}-${classInfo.slot}`}
        style={styles.classCard}
        onPress={() => handleViewDetails(classInfo)}
        activeOpacity={0.7}
      >
        <View style={styles.classCardContent}>
          <View style={styles.classHeader}>
            <View style={styles.classInfo}>
              <Text style={styles.courseCode}>{classInfo.courseCode}</Text>
              <Text style={styles.courseName} numberOfLines={2}>
                {classInfo.courseName}
              </Text>
            </View>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{classInfo.time}</Text>
            </View>
          </View>

          <View style={styles.classDetails}>
            <View style={styles.detailRow}>
              <AntDesign name="home" size={14} color="#8c8c8c" />
              <Text style={styles.detailText}>
                {classInfo.room} - {classInfo.building}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <AntDesign name="user" size={14} color="#8c8c8c" />
              <Text style={styles.detailText}>{classInfo.instructor}</Text>
            </View>
          </View>

          <View style={styles.classFooter}>
            <View style={styles.attendanceContainer}>
              <AntDesign
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
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => handleViewDetails(classInfo)}
            >
              <Text style={styles.detailsButtonText}>Chi tiết</Text>
              <AntDesign name="right" size={12} color="#3674B5" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDaySchedule = (daySchedule: DaySchedule) => {
    return (
      <View key={daySchedule.day} style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayName}>{daySchedule.day}</Text>
            <Text style={styles.dayDate}>{daySchedule.date}</Text>
          </View>
          <View style={styles.classCount}>
            <Text style={styles.classCountText}>
              {daySchedule.classes.length} lớp
            </Text>
          </View>
        </View>

        {daySchedule.classes.length > 0 ? (
          <View style={styles.classesContainer}>
            {daySchedule.classes.map((classInfo) => renderClassCard(classInfo))}
          </View>
        ) : (
          <View style={styles.emptyDay}>
            <AntDesign name="calendar" size={32} color="#d9d9d9" />
            <Text style={styles.emptyDayText}>Không có lớp học</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#3674B5", "#1890ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Thời Khóa Biểu</Text>
            <Text style={styles.headerSubtitle}>
              Tuần: {formatWeekRange(selectedWeek)}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleWeekChange("prev")}
            >
              <AntDesign name="left" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setSelectedWeek(new Date())}
            >
              <Text style={styles.currentWeekText}>Tuần này</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleWeekChange("next")}
            >
              <AntDesign name="right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Week Schedule */}
      <ScrollView
        style={styles.scheduleContainer}
        showsVerticalScrollIndicator={false}
      >
        {weekSchedule.map((daySchedule) => renderDaySchedule(daySchedule))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Chú thích:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <AntDesign name={"checkcircleo" as any} size={12} color="#52c41a" />
            <Text style={styles.legendText}>Đã tham gia</Text>
          </View>
          <View style={styles.legendItem}>
            <AntDesign name={"closecircleo" as any} size={12} color="#ff4d4f" />
            <Text style={styles.legendText}>Vắng mặt</Text>
          </View>
          <View style={styles.legendItem}>
            <AntDesign
              name={"exclamationcircleo" as any}
              size={12}
              color="#faad14"
            />
            <Text style={styles.legendText}>Chưa đến</Text>
          </View>
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
  headerInfo: {
    flex: 1,
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentWeekText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  scheduleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dayInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
    marginRight: 8,
  },
  dayDate: {
    fontSize: 14,
    color: "#8c8c8c",
  },
  classCount: {
    backgroundColor: "#3674B5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  classCountText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  classesContainer: {
    padding: 16,
  },
  emptyDay: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDayText: {
    fontSize: 14,
    color: "#8c8c8c",
    marginTop: 8,
  },
  classCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3674B5",
  },
  classCardContent: {
    padding: 16,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: "#262626",
    lineHeight: 18,
  },
  timeBadge: {
    backgroundColor: "#e6f7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#3674B5",
    fontWeight: "500",
  },
  classDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#595959",
    marginLeft: 8,
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendanceText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailsButtonText: {
    fontSize: 12,
    color: "#3674B5",
    fontWeight: "500",
    marginRight: 4,
  },
  legendContainer: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    fontSize: 12,
    color: "#8c8c8c",
    marginLeft: 4,
  },
});
