import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TeacherGradingServices } from "../../services/teacher/teacherGradingServices";
import type {
  TeachingClass,
  ClassDetail,
  ClassStudent,
} from "../../services/teacher/teacherGradingServices";
import Toast from "react-native-toast-message";
import BackHeader from "@/components/BackHeader";

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

export default function TeacherClassesScreen() {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showClassPicker, setShowClassPicker] = useState(false);

  const loadTeacherClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const classList = await TeacherGradingServices.getTeacherClasses();
      setClasses(classList);
      if (classList.length > 0 && !selectedClassId) {
        setSelectedClassId(classList[0].classId);
      }
    } catch (err: any) {
      console.error("Failed to load teacher classes:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2:
          err?.response?.data?.message ||
          "Không thể tải danh sách lớp giảng dạy",
      });
    } finally {
      setLoadingClasses(false);
    }
  }, [selectedClassId]);

  const loadClassDetail = useCallback(async (classId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await TeacherGradingServices.getClassById(classId);
      setClassDetail(detail);
    } catch (err: any) {
      console.error("Failed to load class detail:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: err?.response?.data?.message || "Không thể tải thông tin lớp",
      });
      setClassDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadTeacherClasses();
  }, [loadTeacherClasses]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassDetail(selectedClassId);
    } else {
      setClassDetail(null);
    }
  }, [selectedClassId, loadClassDetail]);

  const selectedClassSummary = useMemo(
    () => classes.find((cls) => cls.classId === selectedClassId),
    [classes, selectedClassId]
  );

  const studentData = useMemo(() => {
    if (!classDetail?.students) return [];
    if (!searchText.trim()) {
      return classDetail.students;
    }
    const term = searchText.toLowerCase();
    return classDetail.students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.studentCode.toLowerCase().includes(term)
    );
  }, [classDetail, searchText]);

  const totalStudents =
    classDetail?.students?.length ?? selectedClassSummary?.totalStudents ?? 0;

  const slots = selectedClassSummary?.totalSlots ?? 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (selectedClassId) {
        await loadClassDetail(selectedClassId);
      } else {
        await loadTeacherClasses();
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedClassId, loadClassDetail, loadTeacherClasses]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`;
    } catch {
      return "—";
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="Lớp Giảng Dạy"
        subtitle={`${classes.length} lớp • ${
          selectedClassSummary?.semesterName || ""
        }`}
        gradientColors={[palette.primary, palette.secondary]}
        fallbackRoute="/(teacher)"
      />

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
                  ? `${selectedClassSummary?.classCode || ""} • ${
                      selectedClassSummary?.subjectName || ""
                    }`
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

      {!loadingClasses && classes.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="school-outline"
            size={64}
            color={palette.subtitle}
          />
          <Text style={styles.emptyText}>Bạn chưa được phân công lớp nào</Text>
        </View>
      )}

      {selectedClassSummary && (
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
          {/* Class Overview */}
          <View style={styles.overviewContainer}>
            {/* Class Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={24}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardEyebrow}>Thông tin lớp</Text>
                  <Text style={styles.cardTitle}>
                    {selectedClassSummary.classCode}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Môn học</Text>
                  <Text style={styles.infoValue}>
                    {selectedClassSummary.subjectCode} -{" "}
                    {selectedClassSummary.subjectName}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Kỳ học</Text>
                  <Text style={styles.infoValue}>
                    {selectedClassSummary.semesterName}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tín chỉ</Text>
                  <Text style={styles.infoValue}>
                    {selectedClassSummary.credits || 0}
                  </Text>
                </View>
                {classDetail?.semesterStartDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Bắt đầu</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(classDetail.semesterStartDate)}
                    </Text>
                  </View>
                )}
                {classDetail?.semesterEndDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Kết thúc</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(classDetail.semesterEndDate)}
                    </Text>
                  </View>
                )}
                {classDetail?.room && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Phòng học</Text>
                    <Text style={styles.infoValue}>{classDetail.room}</Text>
                  </View>
                )}
              </View>

              {selectedClassSummary.status && (
                <View style={styles.pillRow}>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {selectedClassSummary.status}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={24}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardEyebrow}>Sĩ số lớp</Text>
                  <Text style={styles.cardTitle}>
                    {totalStudents} sinh viên
                  </Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Đăng ký</Text>
                  <Text style={styles.statValue}>
                    {selectedClassSummary.currentEnrollment ?? totalStudents}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Chỉ tiêu</Text>
                  <Text style={styles.statValue}>{slots}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Còn trống</Text>
                  <Text style={styles.statValue}>
                    {Math.max(slots - totalStudents, 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Students List */}
          <View style={styles.studentsCard}>
            <View style={styles.studentsHeader}>
              <View>
                <Text style={styles.studentsTitle}>Danh sách sinh viên</Text>
                <Text style={styles.studentsSubtitle}>
                  Hiển thị {studentData.length} / {totalStudents} sinh viên
                </Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={palette.subtitle}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên hoặc mã sinh viên"
                placeholderTextColor={palette.subtitle}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={palette.subtitle}
                  />
                </TouchableOpacity>
              )}
            </View>

            {loadingDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : studentData.length > 0 ? (
              <View style={styles.studentsList}>
                {studentData.map((student, index) => (
                  <View key={student.studentId} style={styles.studentCard}>
                    <View style={styles.studentIndex}>
                      <Text style={styles.studentIndexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {student.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.fullName}</Text>
                      <Text style={styles.studentCode}>
                        {student.studentCode}
                      </Text>
                      {student.email && (
                        <Text style={styles.studentEmail}>{student.email}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStudentsContainer}>
                <MaterialCommunityIcons
                  name="account-off"
                  size={48}
                  color={palette.subtitle}
                />
                <Text style={styles.emptyStudentsText}>
                  {searchText
                    ? "Không tìm thấy sinh viên"
                    : "Chưa có sinh viên"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

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
              <Text style={styles.modalTitle}>Chọn lớp giảng dạy</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  overviewContainer: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(54, 116, 181, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardEyebrow: {
    fontSize: 12,
    color: palette.subtitle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.text,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: palette.subtitle,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.text,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#edf3ff",
  },
  pillText: {
    fontSize: 12,
    color: "#1d3b5d",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statItem: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "#eef2fb",
  },
  statLabel: {
    fontSize: 13,
    color: palette.subtitle,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: palette.text,
  },
  studentsCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentsHeader: {
    marginBottom: 16,
  },
  studentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.text,
    marginBottom: 4,
  },
  studentsSubtitle: {
    fontSize: 14,
    color: palette.subtitle,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: palette.text,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: palette.subtitle,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: palette.surface,
    borderRadius: 12,
  },
  studentIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e6f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  studentIndexText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primary,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  studentAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.text,
  },
  studentCode: {
    fontSize: 13,
    color: palette.subtitle,
  },
  studentEmail: {
    fontSize: 12,
    color: palette.subtitle,
  },
  emptyStudentsContainer: {
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyStudentsText: {
    fontSize: 14,
    color: palette.subtitle,
    textAlign: "center",
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
});
