import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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

interface GradeItem {
  category: string;
  item: string;
  weight: number;
  value: number;
  comment?: string;
}

interface GradeCategory {
  name: string;
  items: GradeItem[];
  totalWeight: number;
  totalValue: number;
}

export default function MarkReportDetailPage() {
  const insets = useSafeAreaInsets();
  const { courseCode } = useLocalSearchParams();

  // Mock grade data
  const courseInfo = {
    courseCode: (courseCode as string) || "HCM202",
    courseName: "Ho Chi Minh Ideology",
    className: "Half1_GD1705",
    average: 9.5,
    status: "Passed" as const,
  };

  const gradeCategories: GradeCategory[] = [
    {
      name: "Participation",
      totalWeight: 10.0,
      totalValue: 10,
      items: [
        {
          category: "Participation",
          item: "Participation",
          weight: 10.0,
          value: 10,
        },
      ],
    },
    {
      name: "Progress Test",
      totalWeight: 20.0,
      totalValue: 10,
      items: [
        {
          category: "Progress Test",
          item: "Progress Test",
          weight: 20.0,
          value: 10,
        },
      ],
    },
    {
      name: "Assignments",
      totalWeight: 40.0,
      totalValue: 10,
      items: [
        {
          category: "Assignments",
          item: "Assignment 1",
          weight: 20.0,
          value: 10,
        },
        {
          category: "Assignments",
          item: "Assignment 2",
          weight: 20.0,
          value: 10,
        },
      ],
    },
    {
      name: "Final Exam",
      totalWeight: 30.0,
      totalValue: 0,
      items: [
        {
          category: "Final Exam",
          item: "Final Exam",
          weight: 30.0,
          value: 0,
          comment: "Abse",
        },
      ],
    },
    {
      name: "Final Exam Resit",
      totalWeight: 30.0,
      totalValue: 8.3,
      items: [
        {
          category: "Final Exam Resit",
          item: "Final Exam Resit",
          weight: 30.0,
          value: 8.3,
        },
      ],
    },
  ];

  const renderGradeTable = (category: GradeCategory) => {
    return (
      <View key={category.name} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Grade item</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Weight</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Value</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Comm</Text>
        </View>

        {/* Table Rows */}
        {category.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.item}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>
              {item.weight.toFixed(1)} %
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {item.value > 0 ? item.value : "-"}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {item.comment || "-"}
            </Text>
          </View>
        ))}

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={[styles.totalCell, { flex: 2, fontWeight: "bold" }]}>
            Total
          </Text>
          <Text style={[styles.totalCell, { flex: 1.5 }]}>
            {category.totalWeight.toFixed(1)} %
          </Text>
          <Text style={[styles.totalCell, { flex: 1 }]}>
            {category.totalValue > 0 ? category.totalValue : "-"}
          </Text>
          <Text style={[styles.totalCell, { flex: 1 }]}>-</Text>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Details</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Course Info Card */}
        <View style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <View style={styles.courseHeaderLeft}>
              <Text style={styles.courseTitle}>
                {courseInfo.courseCode} - {courseInfo.courseName}
              </Text>
              <Text style={styles.className}>
                Class name: {courseInfo.className}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{courseInfo.status}</Text>
            </View>
          </View>

          <View style={styles.averageContainer}>
            <Text style={styles.averageLabel}>Average: </Text>
            <Text style={styles.averageValue}>{courseInfo.average}</Text>
          </View>
        </View>

        {/* Grade Categories */}
        <View style={styles.gradeSection}>
          {gradeCategories.map((category) => renderGradeTable(category))}
        </View>

        {/* Course Total */}
        <View style={styles.courseTotalCard}>
          <View style={styles.courseTotalHeader}>
            <Text style={styles.courseTotalTitle}>Course total</Text>
          </View>
          <View style={styles.courseTotalContent}>
            <View style={styles.courseTotalRow}>
              <Text style={styles.courseTotalLabel}>Average:</Text>
              <Text style={styles.courseTotalValue}>{courseInfo.average}</Text>
            </View>
            <View style={styles.courseTotalRow}>
              <Text style={styles.courseTotalLabel}>Status:</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusIndicatorText}>
                  {courseInfo.status}
                </Text>
              </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  courseHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 6,
  },
  className: {
    fontSize: 14,
    color: "#333",
  },
  statusBadge: {
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
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  averageContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  averageLabel: {
    fontSize: 16,
    color: "#666",
  },
  averageValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#52c41a",
  },
  gradeSection: {
    gap: 16,
    marginBottom: 16,
  },
  categorySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  totalCell: {
    fontSize: 13,
    color: "#262626",
    textAlign: "center",
  },
  courseTotalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseTotalHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  courseTotalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
  },
  courseTotalContent: {
    gap: 12,
  },
  courseTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseTotalLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  courseTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
  },
  statusIndicator: {
    backgroundColor: "#52c41a",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicatorText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});
