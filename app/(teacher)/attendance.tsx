import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import type {
  SlotAttendanceDto,
  StudentAttendanceDetailDto,
  StudentAttendanceDto,
} from "@/types/attendance";
import { TeacherAttendanceServices } from "@/services/teacher/teacherAttendanceServices";

type Params = {
  slotId?: string;
  classCode?: string;
  subjectName?: string;
  date?: string;
  timeSlotName?: string;
};

interface AttendanceState {
  [studentId: string]: {
    isPresent: boolean;
    notes?: string;
  };
}

export default function TeacherAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [slotAttendance, setSlotAttendance] =
    useState<SlotAttendanceDto | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const slotId = params.slotId as string | undefined;

  // Load dữ liệu điểm danh của slot
  useEffect(() => {
    if (!slotId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await TeacherAttendanceServices.getSlotAttendance(slotId);
        setSlotAttendance(data);

        const initial: AttendanceState = {};
        data.studentAttendances.forEach((s) => {
          initial[s.studentId] = {
            isPresent: data.hasAttendance ? s.isPresent : false,
            notes: s.notes || undefined,
          };
        });
        setAttendanceData(initial);
      } catch (err: any) {
        console.error("Failed to load slot attendance", err);
        Alert.alert(
          "Lỗi",
          err?.response?.data?.message ||
            err?.message ||
            "Không thể tải dữ liệu điểm danh."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [slotId]);

  const handleTogglePresence = (studentId: string, isPresent: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        isPresent,
        notes: prev[studentId]?.notes,
      },
    }));
  };

  const handleChangeNotes = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        isPresent: prev[studentId]?.isPresent ?? false,
        notes,
      },
    }));
  };

  const handleMarkAll = async (isPresent: boolean) => {
    if (!slotId || !slotAttendance) return;

    try {
      setSaving(true);
      if (slotAttendance.hasAttendance) {
        // Nếu đã điểm danh thì chỉ update local state
        const updated: AttendanceState = {};
        slotAttendance.studentAttendances.forEach((s) => {
          updated[s.studentId] = {
            isPresent,
            notes: attendanceData[s.studentId]?.notes,
          };
        });
        setAttendanceData(updated);
      } else {
        // Gọi API mark-all cho lần đầu điểm danh
        if (isPresent) {
          await TeacherAttendanceServices.markAllPresent(slotId);
        } else {
          await TeacherAttendanceServices.markAllAbsent(slotId);
        }

        // Reload lại
        const data = await TeacherAttendanceServices.getSlotAttendance(slotId);
        setSlotAttendance(data);
        const initial: AttendanceState = {};
        data.studentAttendances.forEach((s) => {
          initial[s.studentId] = {
            isPresent: s.isPresent,
            notes: s.notes || undefined,
          };
        });
        setAttendanceData(initial);
      }
    } catch (err: any) {
      console.error("Failed to mark all", err);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật tất cả sinh viên."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!slotId || !slotAttendance) return;

    try {
      setSaving(true);
      const students: StudentAttendanceDto[] =
        slotAttendance.studentAttendances.map((s) => ({
          studentId: s.studentId,
          isPresent: attendanceData[s.studentId]?.isPresent ?? false,
          notes: attendanceData[s.studentId]?.notes,
        }));

      if (slotAttendance.hasAttendance) {
        await TeacherAttendanceServices.updateSlotAttendance(slotId, students);
      } else {
        await TeacherAttendanceServices.takeSlotAttendance(slotId, students);
      }

      Alert.alert(
        "Thành công",
        slotAttendance.hasAttendance
          ? "Đã cập nhật điểm danh."
          : "Đã lưu điểm danh."
      );

      // Reload lại dữ liệu
      const data = await TeacherAttendanceServices.getSlotAttendance(slotId);
      setSlotAttendance(data);
      const refreshed: AttendanceState = {};
      data.studentAttendances.forEach((s) => {
        refreshed[s.studentId] = {
          isPresent: s.isPresent,
          notes: s.notes || undefined,
        };
      });
      setAttendanceData(refreshed);
    } catch (err: any) {
      console.error("Failed to save attendance", err);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message ||
          err?.message ||
          "Không thể lưu/cập nhật điểm danh."
      );
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    if (!slotAttendance) {
      return { total: 0, present: 0, absent: 0 };
    }
    const total = slotAttendance.studentAttendances.length;
    let present = 0;
    slotAttendance.studentAttendances.forEach((s) => {
      const isPresent = attendanceData[s.studentId]?.isPresent ?? false;
      if (isPresent) present += 1;
    });
    const absent = total - present;
    return { total, present, absent };
  }, [slotAttendance, attendanceData]);

  const renderStudentRow = (s: StudentAttendanceDetailDto) => {
    const state = attendanceData[s.studentId] || { isPresent: false };
    return (
      <View key={s.studentId} style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{s.studentName}</Text>
            <Text style={styles.studentCode}>{s.studentCode}</Text>
          </View>
          <View style={styles.presenceButtons}>
            <TouchableOpacity
              style={[
                styles.presenceButton,
                !state.isPresent && styles.presenceButtonActiveAbsent,
              ]}
              onPress={() => handleTogglePresence(s.studentId, false)}
            >
              <MaterialIcons
                name="cancel"
                size={18}
                color={!state.isPresent ? "#ff4d4f" : "#999"}
              />
              <Text
                style={[
                  styles.presenceButtonText,
                  !state.isPresent && { color: "#ff4d4f" },
                ]}
              >
                Vắng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.presenceButton,
                state.isPresent && styles.presenceButtonActivePresent,
              ]}
              onPress={() => handleTogglePresence(s.studentId, true)}
            >
              <MaterialIcons
                name="check-circle"
                size={18}
                color={state.isPresent ? "#52c41a" : "#999"}
              />
              <Text
                style={[
                  styles.presenceButtonText,
                  state.isPresent && { color: "#52c41a" },
                ]}
              >
                Có mặt
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.notesInput}
          placeholder="Ghi chú (tuỳ chọn)"
          placeholderTextColor="#bbb"
          value={state.notes || ""}
          onChangeText={(text) => handleChangeNotes(s.studentId, text)}
        />
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: 8 }]}
    >
      {/* Header */}
      <LinearGradient colors={["#3674B5", "#1890ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              Điểm danh - {params.classCode || slotAttendance?.classCode || ""}
            </Text>
            <Text style={styles.headerSubtitle}>
              {params.subjectName || slotAttendance?.subjectName || ""}
            </Text>
            <Text style={styles.headerSubtitleSmall}>
              {params.date || slotAttendance?.date} •{" "}
              {params.timeSlotName || slotAttendance?.timeSlotName}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={{ marginTop: 8, color: "#666" }}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {!loading && !slotId && (
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
            Không tìm thấy thông tin slot
          </Text>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && slotId && slotAttendance && (
        <>
          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tổng SV</Text>
              <Text style={styles.summaryValue}>{summary.total}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Có mặt</Text>
              <Text style={[styles.summaryValue, { color: "#52c41a" }]}>
                {summary.present}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Vắng</Text>
              <Text style={[styles.summaryValue, { color: "#ff4d4f" }]}>
                {summary.absent}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => handleMarkAll(false)}
              disabled={saving}
            >
              <Text style={styles.actionButtonText}>Tất cả vắng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => handleMarkAll(true)}
              disabled={saving}
            >
              <Text style={styles.actionButtonText}>Tất cả có mặt</Text>
            </TouchableOpacity>
          </View>

          {/* List students */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
          >
            {slotAttendance.studentAttendances.map(renderStudentRow)}
          </ScrollView>

          {/* Save button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {slotAttendance.hasAttendance
                    ? "Cập nhật điểm danh"
                    : "Lưu điểm danh"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
    paddingVertical: 14,
    paddingBottom: 18,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e6f7ff",
    marginTop: 2,
  },
  headerSubtitleSmall: {
    fontSize: 12,
    color: "#d6e4ff",
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 80,
    gap: 8,
  },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    elevation: 1,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  studentCode: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  presenceButtons: {
    flexDirection: "row",
    gap: 6,
  },
  presenceButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },
  presenceButtonActivePresent: {
    backgroundColor: "#e6fffb",
  },
  presenceButtonActiveAbsent: {
    backgroundColor: "#fff1f0",
  },
  presenceButtonText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#666",
    fontWeight: "500",
  },
  notesInput: {
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    paddingHorizontal: 12,
  },
  saveButton: {
    backgroundColor: "#1890ff",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  backButtonContainer: {
    backgroundColor: "#1890ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});


