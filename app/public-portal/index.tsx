import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PublicPortalHome() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        style={styles.heroCard}
      >
        <Text style={styles.heroTitle}>Public Verification Portal</Text>
        <Text style={styles.heroSubtitle}>
          Xác thực chứng chỉ và xem lịch sử kiểm tra mà không cần đăng nhập.
        </Text>
      </LinearGradient>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/public-portal/verifier" as any)}
        >
          <AntDesign name="safety-certificate" size={28} color="#3674B5" />
          <Text style={styles.actionTitle}>Verifier Portal</Text>
          <Text style={styles.actionDescription}>
            Quét QR, nhập mã hoặc tải tệp để kiểm tra chứng chỉ.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push("/public-portal/verification-history" as any)
          }
        >
          <AntDesign name="clock-circle" size={28} color="#3674B5" />
          <Text style={styles.actionTitle}>Verification History</Text>
          <Text style={styles.actionDescription}>
            Theo dõi tất cả yêu cầu kiểm tra đã thực hiện gần đây.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.replace("/login" as any)}
      >
        <Text style={styles.loginText}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 24,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.95,
  },
  actions: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
  },
  actionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  loginButton: {
    marginTop: "auto",
    alignItems: "center",
    padding: 16,
  },
  loginText: {
    color: "#3674B5",
    fontSize: 16,
    fontWeight: "600",
  },
});


