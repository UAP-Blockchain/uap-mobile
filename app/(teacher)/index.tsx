import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeacherPlaceholderScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#FF8C00", "#FF6B00"]}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Teacher Portal</Text>
        <Text style={styles.headerSubtitle}>
          Khu vực dành cho giảng viên (đang phát triển)
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.messageTitle}>Coming soon</Text>
        <Text style={styles.messageDescription}>
          Các chức năng quản lý lớp học, điểm danh và đánh giá cho giảng viên sẽ
          được bổ sung trong các bản cập nhật tiếp theo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#fff",
    marginTop: 8,
    fontSize: 15,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF6B00",
  },
  messageDescription: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
});


