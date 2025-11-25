import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface VerificationHistoryItem {
  id: string;
  credentialId: string;
  studentName: string;
  institution: string;
  degree: string;
  status: "VERIFIED" | "NOT_FOUND" | "REVOKED";
  verifiedAt: string;
  blockchainHash?: string;
}

export default function VerificationHistoryPage() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "verified" | "not_found" | "revoked"
  >("all");

  // Mock verification history data
  const mockHistory: VerificationHistoryItem[] = [
    {
      id: "1",
      credentialId: "CRED001",
      studentName: "Nguyen Van A",
      institution: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      status: "VERIFIED",
      verifiedAt: "2024-01-15 10:30 AM",
      blockchainHash: "0x1234567890abcdef",
    },
    {
      id: "2",
      credentialId: "CRED002",
      studentName: "Tran Thi B",
      institution: "University of Technology",
      degree: "Master of Engineering",
      status: "VERIFIED",
      verifiedAt: "2024-01-14 02:15 PM",
      blockchainHash: "0xabcdef1234567890",
    },
    {
      id: "3",
      credentialId: "CRED003",
      studentName: "Le Van C",
      institution: "University of Science",
      degree: "Bachelor of Engineering",
      status: "NOT_FOUND",
      verifiedAt: "2024-01-13 09:20 AM",
    },
    {
      id: "4",
      credentialId: "CRED004",
      studentName: "Pham Thi D",
      institution: "University of Technology",
      degree: "Doctor of Philosophy",
      status: "VERIFIED",
      verifiedAt: "2024-01-12 04:45 PM",
      blockchainHash: "0x9876543210fedcba",
    },
    {
      id: "5",
      credentialId: "CRED005",
      studentName: "Hoang Van E",
      institution: "University of Science",
      degree: "Master of Science",
      status: "REVOKED",
      verifiedAt: "2024-01-11 11:00 AM",
      blockchainHash: "0xfedcba0987654321",
    },
  ];

  const getFilteredHistory = () => {
    if (selectedFilter === "all") return mockHistory;
    return mockHistory.filter((item) => item.status === selectedFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "#52c41a";
      case "NOT_FOUND":
        return "#ff4d4f";
      case "REVOKED":
        return "#faad14";
      default:
        return "#8c8c8c";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "check-circle";
      case "NOT_FOUND":
        return "close-circle";
      case "REVOKED":
        return "exclamation-circle";
      default:
        return "question-circle";
    }
  };

  const renderHistoryItem = (item: VerificationHistoryItem) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.historyCard,
          {
            borderLeftColor: statusColor,
            borderLeftWidth: 4,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
            <AntDesign name={statusIcon as any} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status === "VERIFIED"
                ? "VERIFIED"
                : item.status === "NOT_FOUND"
                ? "NOT FOUND"
                : "REVOKED"}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.verifiedAt}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.degreeText}>{item.degree}</Text>
          <Text style={styles.institutionText}>{item.institution}</Text>
          <Text style={styles.credentialIdText}>
            Credential ID: {item.credentialId}
          </Text>
          {item.blockchainHash && (
            <Text style={styles.hashText}>
              Hash: {item.blockchainHash.substring(0, 20)}...
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredHistory = getFilteredHistory();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#3674B5", "#1890ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Verification History</Text>
            <Text style={styles.headerSubtitle}>
              Track all credential verifications
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "all" && styles.activeFilterButtonText,
              ]}
            >
              All ({mockHistory.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "verified" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("verified")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "verified" && styles.activeFilterButtonText,
              ]}
            >
              Verified (
              {mockHistory.filter((h) => h.status === "VERIFIED").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "not_found" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("not_found")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "not_found" && styles.activeFilterButtonText,
              ]}
            >
              Not Found (
              {mockHistory.filter((h) => h.status === "NOT_FOUND").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "revoked" && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter("revoked")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === "revoked" && styles.activeFilterButtonText,
              ]}
            >
              Revoked (
              {mockHistory.filter((h) => h.status === "REVOKED").length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => renderHistoryItem(item))
        ) : (
          <View style={styles.emptyContainer}>
            <AntDesign name="inbox" size={64} color="#d9d9d9" />
            <Text style={styles.emptyText}>No verification history found</Text>
          </View>
        )}
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeFilterButton: {
    backgroundColor: "#3674B5",
    borderColor: "#3674B5",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 12,
    color: "#8c8c8c",
  },
  cardContent: {
    gap: 6,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
  },
  degreeText: {
    fontSize: 14,
    color: "#3674B5",
    fontWeight: "600",
  },
  institutionText: {
    fontSize: 13,
    color: "#666",
  },
  credentialIdText: {
    fontSize: 12,
    color: "#8c8c8c",
    fontFamily: "monospace",
    marginTop: 4,
  },
  hashText: {
    fontSize: 11,
    color: "#8c8c8c",
    fontFamily: "monospace",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#8c8c8c",
    marginTop: 16,
  },
});
