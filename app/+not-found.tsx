import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();

  const handleGoHome = () => {
    router.replace("/(student)/(tabs)" as any);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(student)/(tabs)" as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <AntDesign name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lỗi</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.errorIconContainer}>
          <LinearGradient
            colors={["#FF6B6B", "#FF5252"]}
            style={styles.errorIconGradient}
          >
            <MaterialIcons name="error-outline" size={80} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.errorTitle}>404 - Không tìm thấy trang</Text>

        <Text style={styles.errorMessage}>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </Text>

        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>Bạn có thể thử:</Text>
          <View style={styles.suggestionItem}>
            <AntDesign name="check" size={16} color="#4CAF50" />
            <Text style={styles.suggestionText}>
              Kiểm tra lại đường dẫn URL
            </Text>
          </View>
          <View style={styles.suggestionItem}>
            <AntDesign name="check" size={16} color="#4CAF50" />
            <Text style={styles.suggestionText}>Quay lại trang trước đó</Text>
          </View>
          <View style={styles.suggestionItem}>
            <AntDesign name="check" size={16} color="#4CAF50" />
            <Text style={styles.suggestionText}>Về trang chủ</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.buttonGradient}
            >
              <AntDesign name="home" size={20} color="#fff" />
              <Text style={styles.buttonText}>Về trang chủ</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoBack}
          >
            <View style={styles.secondaryButtonContent}>
              <AntDesign name="arrow-left" size={20} color="#3674B5" />
              <Text style={styles.secondaryButtonText}>Quay lại</Text>
            </View>
          </TouchableOpacity>
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
  headerGradient: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorIconContainer: {
    marginBottom: 30,
  },
  errorIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  suggestionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  actionButtons: {
    width: "100%",
  },
  primaryButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3674B5",
    overflow: "hidden",
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#3674B5",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
