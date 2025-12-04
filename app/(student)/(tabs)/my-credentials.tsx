import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BackHeader from "@/components/BackHeader";
import { StudentCredentialServices } from "@/services/student/credentialServices";
import type { StudentCredentialDto } from "@/types/credential";

const palette = {
  primary: "#3674B5",
  secondary: "#2196F3",
  success: "#16a34a",
  warning: "#f59e0b",
  error: "#ef4444",
  background: "#F1F5FF",
  card: "#FFFFFF",
  surface: "#F7FAFF",
  text: "#111827",
  subtitle: "#6B7280",
  border: "#e5e7eb",
};

type FilterStatus = "all" | "Issued" | "Pending" | "Revoked";

export default function MyCredentialsScreen() {
  const [credentials, setCredentials] = useState<StudentCredentialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StudentCredentialServices.getMyCredentials();
      setCredentials(data);
    } catch (err: any) {
      console.error("Failed to load credentials", err);
      const messageText =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách chứng chỉ";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const summary = useMemo(() => {
    const issued = credentials.filter((c) => c.status === "Issued");
    const pending = credentials.filter((c) => c.status === "Pending");
    const revoked = credentials.filter((c) => c.status === "Revoked");
    const blockchain = credentials.filter((c) => c.isOnBlockchain);

    return {
      total: credentials.length,
      issued: issued.length,
      pending: pending.length,
      revoked: revoked.length,
      blockchain: blockchain.length,
    };
  }, [credentials]);

  const filteredCredentials = useMemo(() => {
    if (filterStatus === "all") return credentials;
    return credentials.filter((c) => c.status === filterStatus);
  }, [credentials, filterStatus]);

  const renderStatusChip = (status: string) => {
    let label = status;
    let background = "#e5e7eb";
    let color = "#374151";

    if (status === "Issued") {
      label = "Đã phát hành";
      background = "#dcfce7";
      color = "#166534";
    } else if (status === "Pending") {
      label = "Đang xử lý";
      background = "#fef9c3";
      color = "#854d0e";
    } else if (status === "Revoked") {
      label = "Đã thu hồi";
      background = "#fee2e2";
      color = "#b91c1c";
    }

    return (
      <View style={[styles.statusChip, { backgroundColor: background }]}>
        <Text style={[styles.statusChipText, { color }]}>{label}</Text>
      </View>
    );
  };

  const renderCertificateType = (credential: StudentCredentialDto) => {
    const { certificateType } = credential;
    let iconName: string = "certificate";
    let color = palette.primary;
    let label = certificateType;

    if (certificateType === "SubjectCompletion") {
      iconName = "book-open-page-variant";
      label = "Hoàn thành môn học";
      color = "#1d4ed8";
    } else if (certificateType === "SemesterCompletion") {
      iconName = "calendar-check";
      label = "Hoàn thành học kỳ";
      color = "#7e22ce";
    } else if (certificateType === "RoadmapCompletion") {
      iconName = "trophy";
      label = "Hoàn thành lộ trình";
      color = "#16a34a";
    }

    return (
      <View style={styles.typePill}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={16}
          color={color}
        />
        <Text style={[styles.typePillText, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    );
  };

  const headerSubtitle =
    summary.total > 0
      ? `Tổng ${summary.total} chứng chỉ · ${summary.blockchain} trên blockchain`
      : "Xem các chứng chỉ điện tử đã được cấp cho bạn";

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={{ color: palette.subtitle }}>
            Đang tải danh sách chứng chỉ...
          </Text>
        </View>
      );
    }

    if (error && credentials.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={palette.error}
          />
          <Text style={styles.stateTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.stateMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!loading && credentials.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={48}
            color={palette.subtitle}
          />
          <Text style={styles.stateTitle}>Chưa có chứng chỉ</Text>
          <Text style={styles.stateMessage}>
            Khi bạn được cấp chứng chỉ, chúng sẽ hiển thị tại đây.
          </Text>
        </View>
      );
    }

    return (
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
        showsVerticalScrollIndicator={false}
      >
        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Đã phát hành</Text>
            <Text style={styles.summaryValue}>{summary.issued}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Đang xử lý</Text>
            <Text style={styles.summaryValue}>{summary.pending}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Trên blockchain</Text>
            <Text style={styles.summaryValue}>{summary.blockchain}</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(["all", "Issued", "Pending", "Revoked"] as FilterStatus[]).map(
            (status) => {
              const isActive = filterStatus === status;
              let label = "Tất cả";
              if (status === "Issued") label = "Đã phát hành";
              else if (status === "Pending") label = "Đang xử lý";
              else if (status === "Revoked") label = "Đã thu hồi";

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          {filteredCredentials.map((credential) => (
            <View key={credential.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>
                    {(credential.subjectName ||
                      credential.roadmapName ||
                      "C")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardTitleSection}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {credential.subjectName ||
                      credential.roadmapName ||
                      credential.certificateType}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    Mã: {credential.credentialId}
                  </Text>
                </View>
                {renderStatusChip(credential.status)}
              </View>

              <View style={styles.cardMetaRow}>
                {renderCertificateType(credential)}
                {credential.letterGrade && (
                  <View style={styles.gradePill}>
                    <Text style={styles.gradePillText}>
                      {credential.letterGrade}
                      {credential.finalGrade != null
                        ? ` • ${credential.finalGrade.toFixed(1)}`
                        : ""}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                  Ngày cấp:{" "}
                  {new Date(credential.issuedDate).toLocaleDateString("vi-VN")}
                </Text>
                {credential.isOnBlockchain && (
                  <View style={styles.blockchainBadge}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={14}
                      color="#22c55e"
                    />
                    <Text style={styles.blockchainText}>Blockchain</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="Chứng chỉ của tôi"
        subtitle={headerSubtitle}
        gradientColors={[palette.primary, palette.secondary]}
        fallbackRoute="/(student)/(tabs)"
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.text,
    textAlign: "center",
  },
  stateMessage: {
    fontSize: 13,
    color: palette.subtitle,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: palette.subtitle,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: "#e0ecff",
    borderColor: palette.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: palette.subtitle,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: palette.primary,
    fontWeight: "700",
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eef2ff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.primary,
  },
  cardTitleSection: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: palette.subtitle,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    gap: 8,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    gap: 6,
    maxWidth: "60%",
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  gradePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fffbeb",
  },
  gradePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400e",
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 12,
    color: palette.subtitle,
  },
  blockchainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ecfdf3",
  },
  blockchainText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803d",
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
