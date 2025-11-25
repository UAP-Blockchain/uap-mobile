import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface CourseReport {
  courseCode: string;
  courseName: string;
  className: string;
  average: number;
  status: "Passed" | "Failed";
}

export default function MarkReportPage() {
  const insets = useSafeAreaInsets();
  const [selectedSemester, setSelectedSemester] = useState("fall2025");

  // Mock semester data
  const semesters = [
    { id: "fall2025", name: "FALL2025", isActive: true },
    { id: "summer2025", name: "SUMMER2025", isActive: false },
    { id: "spring2025", name: "SPRING2025", isActive: false },
    { id: "fall2024", name: "FALL2024", isActive: false },
  ];

  // Mock course report data
  const courseReports: CourseReport[] = [
    {
      courseCode: "HCM202",
      courseName: "Ho Chi Minh Ideology",
      className: "Half1_GD1705",
      average: 9.5,
      status: "Passed",
    },
    {
      courseCode: "MLN131",
      courseName: "Scientific socialism",
      className: "Half1_GD1702",
      average: 8.5,
      status: "Passed",
    },
    {
      courseCode: "VNR202",
      courseName: "History of Vietnam Communist Party",
      className: "Half2_GD1705",
      average: 7.8,
      status: "Passed",
    },
    {
      courseCode: "SEP490",
      courseName: "SE Capstone Project",
      className: "FA25SE210_GFA130",
      average: 8.9,
      status: "Passed",
    },
  ];

  const renderCourseCard = (course: CourseReport) => {
    return (
      <TouchableOpacity
        key={course.courseCode}
        style={styles.courseCard}
        activeOpacity={0.8}
        onPress={() =>
          router.push(
            `/(drawer)/(tabs)/mark-report-detail?courseCode=${course.courseCode}` as any
          )
        }
      >
        <View style={styles.cardContent}>
          {/* Status Icon */}
          <View style={styles.statusIconContainer}>
            <View style={styles.statusIcon}>
              <Text style={styles.statusIconText}>
                {course.status === "Passed" ? "Passed" : "Failed"}
              </Text>
            </View>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>
              {course.courseCode} - {course.courseName}
            </Text>
            <Text style={styles.className}>Class name: {course.className}</Text>
            <View style={styles.averageContainer}>
              <Text style={styles.averageLabel}>Average: </Text>
              <Text style={styles.averageValue}>{course.average}</Text>
            </View>
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
          <AntDesign name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mark Report</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Semester Selection */}
        <View style={styles.semesterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.semesterScroll}
          >
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
          </ScrollView>
        </View>

        {/* Course Reports */}
        <ScrollView
          style={styles.reportsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reportsContent}
        >
          {courseReports.map((course) => renderCourseCard(course))}
        </ScrollView>
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
  },
  semesterContainer: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  semesterScroll: {
    gap: 8,
    paddingHorizontal: 4,
  },
  semesterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
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
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  activeSemesterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  reportsContainer: {
    flex: 1,
  },
  reportsContent: {
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#52c41a",
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#52c41a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIconText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 6,
  },
  className: {
    fontSize: 13,
    color: "#333",
    marginBottom: 8,
  },
  averageContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  averageLabel: {
    fontSize: 14,
    color: "#666",
  },
  averageValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#52c41a",
  },
});
