import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthenServices } from "@/services/auth/authenServices";

const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Email, 1: OTP, 2: New Password
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Animation values
  const logoAnimation = useSharedValue(0);
  const formAnimation = useSharedValue(0);

  useEffect(() => {
    logoAnimation.value = withDelay(200, withSpring(1));
    formAnimation.value = withDelay(400, withSpring(1));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto proceed to next step when all 6 digits are entered
    const otpCode = newOtpValues.join("");
    if (otpCode.length === 6) {
      setTimeout(() => {
        setCurrentStep(2);
      }, 300);
    }
  };

  // Handle OTP key down
  const handleOtpKeyDown = (index: number, e: any) => {
    if (e.nativeEvent.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email hợp lệ!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    setIsLoading(true);
    try {
      await AuthenServices.sendOtp({
        email: email.trim(),
        purpose: "PasswordReset",
      });
      setCurrentStep(1);
      setCountdown(60);
      Toast.show({
        type: "success",
        text1: "Mã xác thực đã được gửi đến email của bạn!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gửi mã xác thực thất bại. Vui lòng thử lại!";
      Toast.show({
        type: "error",
        text1: errorMessage,
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and proceed
  const handleVerifyOtp = () => {
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập đầy đủ mã 6 chữ số",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }
    setCurrentStep(2);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await AuthenServices.sendOtp({
        email: email.trim(),
        purpose: "PasswordReset",
      });
      setCountdown(60);
      setOtpValues(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
      Toast.show({
        type: "success",
        text1: "Mã xác thực đã được gửi lại!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gửi lại mã thất bại. Vui lòng thử lại!";
      Toast.show({
        type: "error",
        text1: errorMessage,
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập mật khẩu mới!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    if (newPassword.length < 8) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu phải có ít nhất 8 ký tự!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu không khớp!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    setIsLoading(true);
    try {
      const otpCode = otpValues.join("");
      await AuthenServices.resetPasswordWithOtp({
        email: email.trim(),
        otpCode,
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      Toast.show({
        type: "success",
        text1: "Đặt lại mật khẩu thành công!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã và thử lại!";
      Toast.show({
        type: "error",
        text1: errorMessage,
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            logoAnimation.value,
            [0, 1],
            [0.8, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            logoAnimation.value,
            [0, 1],
            [30, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: logoAnimation.value,
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            formAnimation.value,
            [0, 1],
            [50, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: formAnimation.value,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header with Logo */}
            {width > 768 && (
              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <LinearGradient
                  colors={["#1777ff", "#0d5bc9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoText}>UAP</Text>
                  <Text style={styles.logoSubtext}>Blockchain</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Form Section */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Feather
                    name={currentStep === 1 ? "mail" : "lock"}
                    size={32}
                    color="#1777ff"
                  />
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.title}>
                {currentStep === 0
                  ? "Quên mật khẩu?"
                  : currentStep === 1
                  ? "Đặt lại mật khẩu"
                  : "Đặt mật khẩu mới"}
              </Text>
              <Text style={styles.subtitle}>
                {currentStep === 0
                  ? "Đừng lo, chúng tôi sẽ gửi hướng dẫn đặt lại cho bạn."
                  : currentStep === 1
                  ? `Chúng tôi đã gửi mã đến ${email}`
                  : "Phải có ít nhất 8 ký tự"}
              </Text>

              {/* Step 1: Email Input */}
              {currentStep === 0 && (
                <>
                  <View style={styles.inputContainer}>
                    <View style={styles.iconInputContainer}>
                      <Feather name="mail" size={20} color="#1777ff" />
                    </View>
                    <TextInput
                      onChangeText={setEmail}
                      value={email}
                      placeholder="Nhập email của bạn"
                      placeholderTextColor="#999"
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSendOtp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backLink}
                  >
                    <Feather name="arrow-left" size={16} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.backLinkText}>Quay lại đăng nhập</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 1 && (
                <>
                  <View style={styles.otpContainer}>
                    {otpValues.map((value, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          otpInputRefs.current[index] = ref;
                        }}
                        style={styles.otpInput}
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleOtpChange(index, text)}
                        onKeyPress={(e) => handleOtpKeyDown(index, e)}
                        keyboardType="number-pad"
                        editable={!isLoading}
                        autoFocus={index === 0}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Tiếp tục</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.resendSection}>
                    {countdown > 0 ? (
                      <Text style={styles.resendText}>
                        Không nhận được email?{" "}
                        <Text style={styles.countdownText}>{countdown}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={isLoading}
                      >
                        <Text style={styles.resendText}>
                          Không nhận được email?{" "}
                          <Text style={styles.resendLink}>Nhấn để gửi lại</Text>
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backLink}
                  >
                    <Feather name="arrow-left" size={16} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.backLinkText}>Quay lại đăng nhập</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 3: New Password */}
              {currentStep === 2 && (
                <>
                  <View style={styles.inputContainer}>
                    <View style={styles.iconInputContainer}>
                      <Feather name="lock" size={20} color="#1777ff" />
                    </View>
                    <TextInput
                      onChangeText={(text) => {
                        setNewPassword(text);
                        setPasswordStrength(calculatePasswordStrength(text));
                      }}
                      value={newPassword}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor="#999"
                      style={styles.input}
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                    >
                      <Feather
                        name={isPasswordVisible ? "eye" : "eye-off"}
                        size={20}
                        color="#1777ff"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Password Strength Indicator */}
                  <View style={styles.passwordStrength}>
                    {[0, 1, 2, 3].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          index < passwordStrength && styles.strengthBarActive,
                          index === 0 &&
                            passwordStrength >= 1 &&
                            styles.strengthBarWeak,
                          index === 1 &&
                            passwordStrength >= 2 &&
                            styles.strengthBarMedium,
                          index === 2 &&
                            passwordStrength >= 3 &&
                            styles.strengthBarGood,
                          index === 3 &&
                            passwordStrength >= 4 &&
                            styles.strengthBarStrong,
                        ]}
                      />
                    ))}
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.iconInputContainer}>
                      <Feather name="lock" size={20} color="#1777ff" />
                    </View>
                    <TextInput
                      onChangeText={setConfirmPassword}
                      value={confirmPassword}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="#999"
                      style={styles.input}
                      secureTextEntry={!isConfirmPasswordVisible}
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    >
                      <Feather
                        name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                        size={20}
                        color="#1777ff"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backLink}
                  >
                    <Feather name="arrow-left" size={16} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.backLinkText}>Quay lại đăng nhập</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step Indicator */}
              <View style={styles.stepIndicator}>
                {[0, 1, 2].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.stepDot,
                      index <= currentStep && styles.stepDotActive,
                      index < currentStep && styles.stepDotCompleted,
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  logoGradient: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1777ff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    marginTop: 4,
    letterSpacing: 1,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#e6f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  iconInputContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#1777ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#1777ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  backLinkText: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 14,
    marginLeft: 4,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    height: 72,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "600",
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  resendSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#64748b",
  },
  countdownText: {
    color: "#1777ff",
    fontWeight: "600",
  },
  resendLink: {
    color: "#1777ff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  passwordStrength: {
    flexDirection: "row",
    gap: 4,
    marginTop: -8,
    marginBottom: 20,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
  },
  strengthBarActive: {
    backgroundColor: "#1777ff",
  },
  strengthBarWeak: {
    backgroundColor: "#ef4444",
  },
  strengthBarMedium: {
    backgroundColor: "#f59e0b",
  },
  strengthBarGood: {
    backgroundColor: "#10b981",
  },
  strengthBarStrong: {
    backgroundColor: "#1777ff",
  },
  stepIndicator: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
    justifyContent: "center",
  },
  stepDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    maxWidth: 100,
  },
  stepDotActive: {
    backgroundColor: "#1777ff",
  },
  stepDotCompleted: {
    backgroundColor: "#1777ff",
  },
});

export default ForgotPasswordScreen;


