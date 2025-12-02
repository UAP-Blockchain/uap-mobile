import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TeacherGradingServices } from "../../services/teacher/teacherGradingServices";
import type {
  TeachingClass,
  ClassDetail,
  ClassStudent,
  GradeComponent,
  GradeData,
} from "../../services/teacher/teacherGradingServices";
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

interface StudentGradeState {
  [gradeComponentId: string]: number;
}

interface StudentGradeIds {
  [gradeComponentId: string]: string; // gradeComponentId -> gradeId
}

export default function TeacherGradingScreen() {
  const insets = useSafeAreaInsets();
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [studentGrades, setStudentGrades] = useState<
    Record<string, StudentGradeState>
  >({});
  const [gradeIdMap, setGradeIdMap] = useState<Record<string, StudentGradeIds>>(
    {}
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingClassData, setLoadingClassData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  // Load teacher's classes on mount
  useEffect(() => {
    loadTeacherClasses();
  }, []);

  // Load class data when class is selected
  useEffect(() => {
    if (selectedClassId) {
      loadClassData(selectedClassId);
    }
  }, [selectedClassId]);

  const loadTeacherClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const teacherClasses = await TeacherGradingServices.getTeacherClasses();
      setClasses(teacherClasses);
      if (teacherClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(teacherClasses[0].classId);
      }
    } catch (err: any) {
      console.error("Error loading teacher classes:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2:
          err?.response?.data?.message || "Không thể tải danh sách lớp học",
      });
    } finally {
      setLoadingClasses(false);
    }
  }, [selectedClassId]);

  const loadClassData = useCallback(async (classId: string) => {
    setLoadingClassData(true);
    try {
      const [classData, existingGrades] = await Promise.all([
        TeacherGradingServices.getClassById(classId),
        TeacherGradingServices.getClassGrades(classId).catch(() => []),
      ]);

      setClassDetail(classData);
      setStudents(classData.students || []);

      // Load grade components for this subject
      if (classData.subjectId) {
        const components = await TeacherGradingServices.getGradeComponents(
          classData.subjectId
        );
        setGradeComponents(components || []);
      }

      // Initialize student grades and gradeIdMap
      const initialGrades: Record<string, StudentGradeState> = {};
      const initialGradeIdMap: Record<string, StudentGradeIds> = {};

      (classData.students || []).forEach((student) => {
        initialGrades[student.studentId] = {};
        initialGradeIdMap[student.studentId] = {};
      });

      // Populate with existing grades
      existingGrades.forEach((grade) => {
        if (initialGrades[grade.studentId]) {
          initialGrades[grade.studentId][grade.gradeComponentId] = grade.score;
        }
        if (!initialGradeIdMap[grade.studentId]) {
          initialGradeIdMap[grade.studentId] = {};
        }
        initialGradeIdMap[grade.studentId][grade.gradeComponentId] =
          grade.gradeId;
      });

      setStudentGrades(initialGrades);
      setGradeIdMap(initialGradeIdMap);
    } catch (err: any) {
      console.error("Error loading class data:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2:
          err?.response?.data?.message || "Không thể tải thông tin lớp học",
      });
    } finally {
      setLoadingClassData(false);
    }
  }, []);

  const [students, setStudents] = useState<ClassStudent[]>([]);

  const updateStudentGrade = useCallback(
    (studentId: string, gradeComponentId: string, score: string) => {
      const numScore = parseFloat(score) || 0;
      setStudentGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [gradeComponentId]: numScore,
        },
      }));
    },
    []
  );

  const handleUpdateStudentGrades = useCallback(
    async (student: ClassStudent) => {
      if (!classDetail || !classDetail.subjectId) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng chọn lớp học",
        });
        return;
      }

      const studentGrade = studentGrades[student.studentId] || {};
      const studentGradeIds = gradeIdMap[student.studentId] || {};

      const gradesToUpdate: Array<{ gradeId: string; score: number }> = [];
      const missingGradeComponents: string[] = [];

      gradeComponents.forEach((component) => {
        const score = studentGrade[component.id] || 0;
        const gradeId = studentGradeIds[component.id];

        if (gradeId) {
          gradesToUpdate.push({
            gradeId,
            score,
          });
        } else {
          missingGradeComponents.push(component.name);
        }
      });

      if (missingGradeComponents.length > 0) {
        Toast.show({
          type: "info",
          text1: "Cảnh báo",
          text2: `Không tìm thấy mã điểm cho: ${missingGradeComponents.join(
            ", "
          )}`,
        });
      }

      if (gradesToUpdate.length === 0) {
        Toast.show({
          type: "info",
          text1: "Cảnh báo",
          text2: "Không có điểm nào để cập nhật",
        });
        return;
      }

      setLoading((prev) => ({ ...prev, [student.studentId]: true }));
      try {
        await TeacherGradingServices.updateStudentGrades({
          grades: gradesToUpdate,
        });

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đã cập nhật điểm cho ${student.fullName}`,
        });
      } catch (err: any) {
        console.error("Error updating grades:", err);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2:
            err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật điểm!",
        });
      } finally {
        setLoading((prev) => ({ ...prev, [student.studentId]: false }));
      }
    },
    [classDetail, studentGrades, gradeIdMap, gradeComponents]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (selectedClassId) {
        await loadClassData(selectedClassId);
      } else {
        await loadTeacherClasses();
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedClassId, loadClassData, loadTeacherClasses]);

  const renderStudentCard = useCallback(
    (student: ClassStudent) => {
      const studentGrade = studentGrades[student.studentId] || {};
      const studentLoading = loading[student.studentId] || false;

      return (
        <View key={student.studentId} style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {student.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.studentCode}>{student.studentCode}</Text>
            </View>
          </View>

          <View style={styles.gradesContainer}>
            {gradeComponents.map((component) => {
              const score = studentGrade[component.id] || 0;
              const maxScore = component.maxScore || 10;

              return (
                <View key={component.id} style={styles.gradeRow}>
                  <View style={styles.gradeLabel}>
                    <Text style={styles.gradeName}>{component.name}</Text>
                    <Text style={styles.gradeWeight}>
                      {component.weightPercent}% • Max: {maxScore}
                    </Text>
                  </View>
                  <View style={styles.gradeInputContainer}>
                    <TextInput
                      style={styles.gradeInput}
                      value={score > 0 ? score.toString() : ""}
                      onChangeText={(text) =>
                        updateStudentGrade(
                          student.studentId,
                          component.id,
                          text
                        )
                      }
                      placeholder="0"
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.gradeMax}>/ {maxScore}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.updateButton,
              studentLoading && styles.updateButtonDisabled,
            ]}
            onPress={() => handleUpdateStudentGrades(student)}
            disabled={studentLoading}
          >
            {studentLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.updateButtonText}>Cập nhật điểm</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [
      studentGrades,
      gradeComponents,
      loading,
      updateStudentGrade,
      handleUpdateStudentGrades,
    ]
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
            <Text style={styles.headerTitle}>Chấm Điểm</Text>
            {classDetail && (
              <Text style={styles.headerSubtitle}>
                {classDetail.classCode} - {classDetail.subjectName}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Class Selector */}
      <View style={styles.selectorContainer}>
        {loadingClasses ? (
          <View style={styles.selectorLoading}>
            <ActivityIndicator size="small" color={palette.primary} />
            <Text style={styles.selectorLoadingText}>Đang tải lớp học...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowClassPicker(true)}
          >
            <View style={styles.selectorButtonContent}>
              <MaterialCommunityIcons
                name="school"
                size={20}
                color={palette.primary}
              />
              <Text style={styles.selectorButtonText}>
                {selectedClassId
                  ? classes.find((c) => c.classId === selectedClassId)
                      ?.classCode +
                    " - " +
                    classes.find((c) => c.classId === selectedClassId)
                      ?.subjectName
                  : "Chọn lớp học"}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={palette.subtitle}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn lớp học</Text>
              <TouchableOpacity
                onPress={() => setShowClassPicker(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={palette.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.classId}
                  style={[
                    styles.modalItem,
                    selectedClassId === cls.classId && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedClassId(cls.classId);
                    setShowClassPicker(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemCode}>{cls.classCode}</Text>
                    <Text style={styles.modalItemSubject}>
                      {cls.subjectName}
                    </Text>
                    <Text style={styles.modalItemSemester}>
                      {cls.semesterName}
                    </Text>
                  </View>
                  {selectedClassId === cls.classId && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={palette.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {loadingClassData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu lớp học...</Text>
        </View>
      ) : classDetail && students.length > 0 ? (
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
          {students.map((student) => renderStudentCard(student))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="school-outline"
            size={64}
            color={palette.subtitle}
          />
          <Text style={styles.emptyText}>
            {selectedClassId
              ? "Lớp học này chưa có sinh viên"
              : "Vui lòng chọn lớp học"}
          </Text>
        </View>
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
    paddingVertical: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  selectorContainer: {
    backgroundColor: palette.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectorLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  selectorLoadingText: {
    fontSize: 14,
    color: palette.subtitle,
  },
  selectorButton: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: palette.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemSelected: {
    backgroundColor: palette.surface,
  },
  modalItemContent: {
    flex: 1,
    gap: 4,
  },
  modalItemCode: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.primary,
  },
  modalItemSubject: {
    fontSize: 14,
    color: palette.text,
  },
  modalItemSemester: {
    fontSize: 12,
    color: palette.subtitle,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  studentCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  studentAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  studentInfo: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.text,
  },
  studentCode: {
    fontSize: 14,
    color: palette.subtitle,
  },
  gradesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  gradeLabel: {
    flex: 1,
    gap: 4,
  },
  gradeName: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.text,
  },
  gradeWeight: {
    fontSize: 12,
    color: palette.subtitle,
  },
  gradeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gradeInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: palette.text,
    backgroundColor: palette.surface,
    textAlign: "center",
  },
  gradeMax: {
    fontSize: 12,
    color: palette.subtitle,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: palette.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: palette.subtitle,
    textAlign: "center",
  },
});
