import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useDispatch } from "react-redux";
import { AuthenServices } from "@/services/auth/authenServices";
import { setAuthData } from "@/lib/features/loginSlice";

const { width, height } = Dimensions.get("window");

// Token validation utility
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const LoginScreen: React.FC = () => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const dispatch = useDispatch();

  // Animation values
  const logoAnimation = useSharedValue(0);
  const formAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(0);

  useEffect(() => {
    // Start animations on mount
    fadeAnimation.value = withTiming(1, { duration: 800 });
    logoAnimation.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    formAnimation.value = withDelay(
      600,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
  }, []);

  useEffect(() => {
    const handleIsLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("userData");
        const role = await AsyncStorage.getItem("role");
        if (token && userData) {
          // Check if token is still valid
          if (isTokenValid(token) || token.startsWith("mock_token")) {
            // Token is valid, auto login - redirect based on role
            if (role === "VERIFIER" || role === "GUEST") {
              router.replace("/(drawer)/(tabs)/verifier" as any);
            } else {
              router.replace("/(drawer)/(tabs)" as any);
            }
          } else {
            // Token expired, clear storage
            await AsyncStorage.multiRemove(["token", "userData", "role"]);
            Toast.show({
              type: "info",
              text1: "Phiên đăng nhập đã hết hạn",
              text2: "Vui lòng đăng nhập lại",
              text1Style: { textAlign: "center", fontSize: 16 },
            });
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        await AsyncStorage.multiRemove(["token", "userData"]);
      }
    };
    handleIsLogin();
  }, []);

  useEffect(() => {
    const onKeyboardShow = (event: any) => {
      setKeyboardOffset(event.endCoordinates.height);
    };

    const onKeyboardHide = () => {
      setKeyboardOffset(0);
    };

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardHide
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleEyePress = () => {
    setPasswordVisible((oldValue) => !oldValue);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email hợp lệ",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập mật khẩu",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    if (!remember) {
      Toast.show({
        type: "error",
        text1: "Vui lòng đồng ý với Điều khoản & Quyền riêng tư",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call API
      const response = await AuthenServices.loginUser({
        email: email,
        password: password,
      });

      // Extract data from response
      const responseData = response.data;
      const accessToken = responseData.accessToken;
      const refreshToken = responseData.refreshToken;
      const role = responseData.role;
      const fullName = responseData.fullName;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid response from server");
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("role", role);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          email: email,
          fullName: fullName,
          role: role,
        })
      );

      // Dispatch to Redux
      dispatch(
        setAuthData({
          accessToken: accessToken,
          refreshToken: refreshToken,
          userProfile: {
            id: "",
            code: "",
            userName: fullName || email,
            role: role,
          },
        })
      );

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });

      // Redirect based on role
      setTimeout(() => {
        if (role === "VERIFIER" || role === "GUEST") {
          router.replace("/(drawer)/(tabs)/verifier" as any);
        } else {
          router.replace("/(drawer)/(tabs)" as any);
        }
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại! Vui lòng kiểm tra thông tin đăng nhập.";
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

  const fadeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimation.value,
    };
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.container, fadeAnimatedStyle]}>
          <StatusBar barStyle="light-content" />
          <View
            style={[
              styles.contentContainer,
              width <= 768 && { flexDirection: "column-reverse" },
            ]}
          >
            {/* Left side - Form */}
            <ScrollView
              contentContainerStyle={[
                styles.formSection,
                {
                  paddingBottom: keyboardOffset > 0 ? 20 : 40,
                  padding: width <= 768 ? 24 : 40,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={formAnimatedStyle}>
                <View style={styles.formCard}>
                  <Text style={styles.loginTitle}>Bắt đầu ngay</Text>
                  <Text style={styles.loginSubtitle}>
                    Nhập thông tin đăng nhập để truy cập tài khoản
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.iconContainer}>
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

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.iconContainer}>
                      <Feather name="lock" size={20} color="#1777ff" />
                    </View>
                    <TextInput
                      onChangeText={setPassword}
                      value={password}
                      placeholder="Nhập mật khẩu của bạn"
                      placeholderTextColor="#999"
                      style={styles.input}
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={handleEyePress}
                    >
                      <Feather
                        name={isPasswordVisible ? "eye" : "eye-off"}
                        size={20}
                        color="#1777ff"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remember & Forgot Password */}
                  <View style={styles.loginLinks}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setRemember(!remember)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          remember && styles.checkboxChecked,
                        ]}
                      >
                        {remember && (
                          <Feather name="check" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel} numberOfLines={1}>
                        Tôi đồng ý với Điều khoản & Quyền riêng tư
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        router.push("/forgot-password");
                      }}
                    >
                      <Text style={styles.forgotPasswordLink}>
                        Quên mật khẩu?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isLoading && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Đăng nhập</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>

            {/* Right side - Logo */}
            {width > 768 && (
              <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
                <LinearGradient
                  colors={["#1777ff", "#0d5bc9"]}
                  style={styles.gradientContainer}
                >
                  <SafeAreaView style={styles.safeArea}>
                    <View style={styles.logoContainer}>
                      <Text style={styles.logoText}>UAP</Text>
                      <Text style={styles.logoSubText}>Blockchain</Text>
                    </View>
                  </SafeAreaView>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Mobile Logo - Top */}
            {width <= 768 && (
              <Animated.View
                style={[styles.mobileLogoSection, logoAnimatedStyle]}
              >
                <LinearGradient
                  colors={["#1777ff", "#0d5bc9"]}
                  style={styles.mobileGradientContainer}
                >
                  <View style={styles.logoContainer}>
                    <Text style={styles.mobileLogoText}>UAP</Text>
                    <Text style={styles.mobileLogoSubText}>Blockchain</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  formCard: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e7ff",
    borderRadius: 10,
    marginBottom: 20,
    height: 50,
    backgroundColor: "#fff",
  },
  iconContainer: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  loginLinks: {
    marginTop: 8,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#1777ff",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#1777ff",
    borderColor: "#1777ff",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#1e293b",
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
  forgotPasswordLink: {
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.5)",
    fontWeight: "400",
    flexShrink: 0,
  },
  loginButton: {
    backgroundColor: "#1777ff",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    elevation: 2,
    shadowColor: "#1777ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  logoSection: {
    flex: 1,
    minWidth: 300,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 100,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubText: {
    fontSize: 40,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    letterSpacing: 1,
    marginTop: -5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Mobile logo styles
  mobileLogoSection: {
    height: 200,
    width: "100%",
  },
  mobileGradientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mobileLogoText: {
    fontSize: 60,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mobileLogoSubText: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    letterSpacing: 1,
    marginTop: -5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default LoginScreen;
