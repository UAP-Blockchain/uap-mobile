import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Mock data - trong thực tế sẽ lấy từ API
    setNotifications([
      {
        id: "1",
        title: "Thông báo mới",
        message: "Bạn có lịch học vào ngày mai",
        time: "2 giờ trước",
        read: false,
        type: "info",
      },
      {
        id: "2",
        title: "Cảnh báo",
        message: "Vắng mặt buổi học ngày 15/10",
        time: "5 giờ trước",
        read: false,
        type: "warning",
      },
      {
        id: "3",
        title: "Thành công",
        message: "Đã điểm danh thành công",
        time: "1 ngày trước",
        read: true,
        type: "success",
      },
      {
        id: "4",
        title: "Thông báo",
        message: "Kết quả thi đã được công bố",
        time: "2 ngày trước",
        read: true,
        type: "info",
      },
    ]);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getIconName = (type: string) => {
    switch (type) {
      case "info":
        return "infocirlceo";
      case "warning":
        return "warning";
      case "success":
        return "checkcircleo";
      case "error":
        return "closecircleo";
      default:
        return "infocirlceo";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "info":
        return "#1890ff";
      case "warning":
        return "#faad14";
      case "success":
        return "#52c41a";
      case "error":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6600"]}
            tintColor="#FF6600"
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="inbox" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification,
              ]}
              onPress={() => markAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${getIconColor(notification.type)}20` },
                ]}
              >
                <AntDesign
                  name={getIconName(notification.type) as any}
                  size={24}
                  color={getIconColor(notification.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 65, // Space for bottom nav
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#8c8c8c",
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  unreadNotification: {
    borderLeftColor: "#FF6600",
    backgroundColor: "#FFF7F0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#595959",
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#8c8c8c",
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6600",
    alignSelf: "flex-start",
    marginTop: 8,
  },
});
