import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface VerificationResult {
  status: "VERIFIED" | "NOT_FOUND" | "REVOKED";
  credentialId?: string;
  studentName?: string;
  institution?: string;
  degree?: string;
  issueDate?: string;
  blockchainHash?: string;
}

export default function VerifierPortal() {
  const insets = useSafeAreaInsets();
  const [inputMethod, setInputMethod] = useState<"qr" | "manual" | "file">(
    "manual"
  );
  const [credentialId, setCredentialId] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Mock verification function
  const handleVerify = async () => {
    if (!credentialId.trim()) {
      Alert.alert("Error", "Please enter a credential ID");
      return;
    }

    setIsVerifying(true);

    // Simulate API call
    setTimeout(() => {
      // Mock verification result based on input
      const mockResults: VerificationResult[] = [
        {
          status: "VERIFIED",
          credentialId: credentialId,
          studentName: "Nguyen Van A",
          institution: "University of Technology",
          degree: "Bachelor of Science in Computer Science",
          issueDate: "2024-01-15",
          blockchainHash: "0x1234567890abcdef",
        },
        {
          status: "NOT_FOUND",
          credentialId: credentialId,
        },
        {
          status: "VERIFIED",
          credentialId: credentialId,
          studentName: "Tran Thi B",
          institution: "University of Technology",
          degree: "Master of Engineering",
          issueDate: "2023-06-20",
          blockchainHash: "0xabcdef1234567890",
        },
      ];

      // Random result for demo
      const result =
        mockResults[Math.floor(Math.random() * mockResults.length)];
      setVerificationResult(result);
      setIsVerifying(false);
    }, 1500);
  };

  const handleScanQR = () => {
    Alert.alert(
      "QR Scanner",
      "QR Scanner functionality will be available soon. Please use manual input for now.",
      [{ text: "OK" }]
    );
  };

  const handleUploadFile = () => {
    Alert.alert(
      "File Upload",
      "File upload functionality will be available soon. Please use manual input for now.",
      [{ text: "OK" }]
    );
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
        return "checkcircle";
      case "NOT_FOUND":
        return "closecircle";
      case "REVOKED":
        return "exclamationcircle";
      default:
        return "questioncircle";
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#3674B5", "#1890ff"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Verifier Portal</Text>
            <Text style={styles.headerSubtitle}>
              Verify academic credentials on blockchain
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Method</Text>
          <View style={styles.methodButtons}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                inputMethod === "qr" && styles.activeMethodButton,
              ]}
              onPress={() => setInputMethod("qr")}
            >
              <AntDesign
                name="qrcode"
                size={24}
                color={inputMethod === "qr" ? "#fff" : "#3674B5"}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  inputMethod === "qr" && styles.activeMethodButtonText,
                ]}
              >
                QR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                inputMethod === "manual" && styles.activeMethodButton,
              ]}
              onPress={() => setInputMethod("manual")}
            >
              <AntDesign
                name="edit"
                size={24}
                color={inputMethod === "manual" ? "#fff" : "#3674B5"}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  inputMethod === "manual" && styles.activeMethodButtonText,
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                inputMethod === "file" && styles.activeMethodButton,
              ]}
              onPress={() => setInputMethod("file")}
            >
              <AntDesign
                name="addfile"
                size={24}
                color={inputMethod === "file" ? "#fff" : "#3674B5"}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  inputMethod === "file" && styles.activeMethodButtonText,
                ]}
              >
                Upload
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          {inputMethod === "qr" && (
            <TouchableOpacity
              style={styles.qrButton}
              onPress={handleScanQR}
              activeOpacity={0.8}
            >
              <AntDesign name="camera" size={48} color="#fff" />
              <Text style={styles.qrButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          )}

          {inputMethod === "manual" && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Credential ID / Hash</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter credential ID or blockchain hash"
                placeholderTextColor="#999"
                value={credentialId}
                onChangeText={setCredentialId}
                multiline={false}
              />
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  isVerifying && styles.verifyButtonDisabled,
                ]}
                onPress={handleVerify}
                disabled={isVerifying}
              >
                <Text style={styles.verifyButtonText}>
                  {isVerifying ? "Verifying..." : "Verify Credential"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {inputMethod === "file" && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadFile}
              activeOpacity={0.8}
            >
              <AntDesign name="addfile" size={48} color="#3674B5" />
              <Text style={styles.uploadButtonText}>
                Upload Credential File
              </Text>
              <Text style={styles.uploadButtonSubtext}>
                PDF, Image, or Document
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verification Result */}
        {verificationResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Verification Result</Text>

            <View
              style={[
                styles.statusCard,
                {
                  borderLeftColor: getStatusColor(verificationResult.status),
                  borderLeftWidth: 4,
                },
              ]}
            >
              <View style={styles.statusHeader}>
                <AntDesign
                  name={getStatusIcon(verificationResult.status) as any}
                  size={24}
                  color={getStatusColor(verificationResult.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(verificationResult.status) },
                  ]}
                >
                  {verificationResult.status === "VERIFIED"
                    ? "VERIFIED"
                    : verificationResult.status === "NOT_FOUND"
                    ? "NOT FOUND"
                    : "REVOKED"}
                </Text>
              </View>

              {verificationResult.status === "VERIFIED" && (
                <View style={styles.verifiedDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Student:</Text>
                    <Text style={styles.detailValue}>
                      {verificationResult.studentName}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Institution:</Text>
                    <Text style={styles.detailValue}>
                      {verificationResult.institution}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Degree:</Text>
                    <Text style={styles.detailValue}>
                      {verificationResult.degree}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue Date:</Text>
                    <Text style={styles.detailValue}>
                      {verificationResult.issueDate}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Blockchain Hash:</Text>
                    <Text style={[styles.detailValue, styles.hashValue]}>
                      {verificationResult.blockchainHash}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => {
                      Alert.alert(
                        "Export Report",
                        "Export functionality will be available soon."
                      );
                    }}
                  >
                    <AntDesign name="download" size={16} color="#fff" />
                    <Text style={styles.exportButtonText}>
                      Export Verification Report
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {verificationResult.status === "NOT_FOUND" && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>
                    The credential with ID "{verificationResult.credentialId}"
                    was not found in the blockchain registry.
                  </Text>
                  <Text style={styles.errorSubtext}>
                    Please verify the credential ID and try again.
                  </Text>
                </View>
              )}

              {verificationResult.status === "REVOKED" && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>
                    This credential has been revoked and is no longer valid.
                  </Text>
                  <Text style={styles.errorSubtext}>
                    Please contact the issuing institution for more information.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Blockchain Verification</Text>
          <Text style={styles.infoText}>
            Our system uses blockchain technology to ensure the authenticity and
            immutability of academic credentials. Each credential is permanently
            recorded on the blockchain, making it tamper-proof and verifiable.
          </Text>
          <Text style={styles.infoText}>
            To verify a credential, you can scan a QR code, enter the credential
            ID manually, or upload a credential file. The system will check the
            blockchain registry and return the verification status.
          </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 12,
  },
  methodButtons: {
    flexDirection: "row",
    gap: 12,
  },
  methodButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  activeMethodButton: {
    backgroundColor: "#3674B5",
    borderColor: "#3674B5",
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3674B5",
    marginTop: 8,
  },
  activeMethodButtonText: {
    color: "#fff",
  },
  qrButton: {
    backgroundColor: "#3674B5",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#262626",
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: "#3674B5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3674B5",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    color: "#3674B5",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  uploadButtonSubtext: {
    color: "#8c8c8c",
    fontSize: 12,
    marginTop: 4,
  },
  resultContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  verifiedDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: "#262626",
    flex: 1,
  },
  hashValue: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  exportButton: {
    backgroundColor: "#3674B5",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorDetails: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#ff4d4f",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: "#8c8c8c",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
});
