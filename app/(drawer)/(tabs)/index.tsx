import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { selectAuthLogin } from "../../../lib/features/loginSlice";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const auth = useSelector(selectAuthLogin);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem("role");
      setUserRole(role);

      // If user is VERIFIER/GUEST, redirect to verifier portal
      if (role === "VERIFIER" || role === "GUEST") {
        router.replace("/(drawer)/(tabs)/verifier" as any);
      }
    };
    loadRole();
  }, [auth]);

  useEffect(() => {
    console.log("HomePage mounted", auth);

    if (auth?.userProfile) {
      console.log("User from Redux:", auth.userProfile);
    }
  }, [auth]);

  const quickActions = [
    {
      title: "Timetable",
      icon: "calendar",
      color: "#3674B5",
      onPress: () => router.push("/(drawer)/(tabs)/timetable" as any),
    },
    {
      title: "Attendance",
      icon: "checkcircle",
      color: "#3674B5",
      onPress: () => router.push("/(drawer)/(tabs)/attendance" as any),
    },
    {
      title: "Mark Report",
      icon: "filetext1",
      color: "#3674B5",
      onPress: () => router.push("/(drawer)/(tabs)/mark-report" as any),
    },
    {
      title: "Certificate",
      icon: "SafetyCertificate",
      color: "#3674B5",
      onPress: () => router.push("/(drawer)/(tabs)/student-home" as any),
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Simulate API call to refresh dashboard data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Success", "Home data has been updated!");
    } catch (error) {
      Alert.alert("Error", "Unable to load data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3674B5"]}
          tintColor="#3674B5"
          title="Loading..."
          titleColor="#3674B5"
        />
      }
    >
      <LinearGradient colors={["#3674B5", "#2196F3"]} style={styles.header}>
        <Text style={styles.headerTitle}>Welcome!</Text>
        <Text style={styles.headerSubtitle}>
          {auth?.userProfile?.userName || "User"}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color },
                ]}
              >
                <AntDesign name={action.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>UAP Blockchain System</Text>
          <Text style={styles.welcomeDescription}>
            Manage your credentials and academic certificates securely and
            transparently
          </Text>
          <TouchableOpacity
            style={styles.studentPortalButton}
            onPress={() => router.push("/(drawer)/(tabs)/student-home" as any)}
          >
            <Text style={styles.studentPortalButtonText}>
              Access Student Portal
            </Text>
            <AntDesign name={"arrowright" as any} size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 45,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#262626",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    textAlign: "center",
  },
  welcomeCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: "#8c8c8c",
    lineHeight: 20,
    marginBottom: 16,
  },
  studentPortalButton: {
    backgroundColor: "#3674B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  studentPortalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
