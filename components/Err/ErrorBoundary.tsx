import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { Component, ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, onRetry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      return (
        <ErrorBoundaryScreen
          error={this.state.error!}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorScreenProps {
  error: Error;
  onRetry: () => void;
}

function ErrorBoundaryScreen({ error, onRetry }: ErrorScreenProps) {
  const handleGoHome = () => {
    router.replace("/(student)/(tabs)" as any);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      if (router.canGoBack()) {
        router.back();
      } else {
        handleGoHome();
      }
    }
  };

  const errorMessage = error?.message || "Đã xảy ra lỗi không mong muốn";
  const errorStack = error?.stack || "Không có thông tin chi tiết";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FF6B6B", "#FF5252"]}
        style={styles.headerGradient}
      >
        <MaterialIcons name="error-outline" size={40} color="#fff" />
        <Text style={styles.headerTitle}>Đã xảy ra lỗi</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.errorIconContainer}>
          <LinearGradient
            colors={["#FF9800", "#F57C00"]}
            style={styles.errorIconGradient}
          >
            <MaterialIcons name="bug-report" size={60} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.errorTitle}>Oops! Có lỗi xảy ra</Text>

        <Text style={styles.errorMessage}>
          Ứng dụng gặp phải một lỗi không mong muốn. Chúng tôi sẽ khắc phục sớm
          nhất có thể.
        </Text>

        <View style={styles.errorDetailsContainer}>
          <Text style={styles.errorDetailsTitle}>Chi tiết lỗi:</Text>
          <View style={styles.errorDetailsContent}>
            <Text style={styles.errorDetailsText}>{errorMessage}</Text>
          </View>
        </View>

        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>Giải pháp:</Text>

          <View style={styles.suggestionItem}>
            <MaterialIcons name="refresh" size={20} color="#4CAF50" />
            <Text style={styles.suggestionText}>Thử lại thao tác vừa rồi</Text>
          </View>

          <View style={styles.suggestionItem}>
            <MaterialIcons name="close" size={20} color="#4CAF50" />
            <Text style={styles.suggestionText}>Đóng và mở lại ứng dụng</Text>
          </View>

          <View style={styles.suggestionItem}>
            <MaterialIcons name="wifi" size={20} color="#4CAF50" />
            <Text style={styles.suggestionText}>Kiểm tra kết nối mạng</Text>
          </View>

          <View style={styles.suggestionItem}>
            <MaterialIcons name="update" size={20} color="#4CAF50" />
            <Text style={styles.suggestionText}>
              Cập nhật ứng dụng lên phiên bản mới nhất
            </Text>
          </View>
        </View>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Information (Dev Only):</Text>
            <ScrollView style={styles.debugContent} horizontal>
              <Text style={styles.debugText}>{errorStack}</Text>
            </ScrollView>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Thử lại</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
          >
            <View style={styles.secondaryButtonContent}>
              <AntDesign name="home" size={20} color="#3674B5" />
              <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
            </View>
          </TouchableOpacity>
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
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorIconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  errorIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF9800",
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
  errorDetailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 10,
  },
  errorDetailsContent: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
  },
  errorDetailsText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  suggestionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  debugContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  debugContent: {
    maxHeight: 150,
  },
  debugText: {
    fontSize: 10,
    color: "#333",
    fontFamily: "monospace",
    lineHeight: 14,
  },
  actionButtons: {
    marginBottom: 30,
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
