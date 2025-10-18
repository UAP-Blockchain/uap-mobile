import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

const { width, height } = Dimensions.get("window");

export interface ILoginScreenProps {
  onEyePress?: () => void;
}

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

const LoginScreen: React.FC<ILoginScreenProps> = ({ onEyePress }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = React.useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const dispatch = useDispatch();

  // Animation values
  const boyAnimation = useSharedValue(0);
  const formAnimation = useSharedValue(0);
  const inputAnimation = useSharedValue(0);
  const buttonAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(0);

  useEffect(() => {
    // Start animations on mount
    fadeAnimation.value = withTiming(1, { duration: 800 });
    boyAnimation.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    formAnimation.value = withDelay(
      600,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    inputAnimation.value = withDelay(
      900,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    buttonAnimation.value = withDelay(
      1200,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
  }, []);

  useEffect(() => {
    const handleIsLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("userData");
        if (token && userData) {
          // Check if token is still valid
          if (isTokenValid(token)) {
            // Token is valid, auto login
            router.replace("/(drawer)" as any);
          } else {
            // Token expired, clear storage
            await AsyncStorage.multiRemove(["token", "userData"]);
            Toast.show({
              type: "info",
              text1: "Phiên đăng nhập đã hết hạn",
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
    onEyePress?.();
  };

  const handleLogin = async () => {
    // Button press animation
    buttonAnimation.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    try {
      console.log("Logging in with:", { userName, password });
      router.replace("/(drawer)" as any);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: `Đăng nhập thất bại: ${
          error.response?.data?.message || error.message
        }`,
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    }
  };

  // Animated styles
  const boyAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            boyAnimation.value,
            [0, 1],
            [0.8, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            boyAnimation.value,
            [0, 1],
            [30, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: boyAnimation.value,
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            formAnimation.value,
            [0, 1],
            [100, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: formAnimation.value,
    };
  });

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            inputAnimation.value,
            [0, 1],
            [0.8, 1],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: inputAnimation.value,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: buttonAnimation.value,
        },
      ],
      opacity: buttonAnimation.value,
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          style={[
            styles.container,
            { marginBottom: keyboardOffset },
            fadeAnimatedStyle,
          ]}
        >
          <StatusBar barStyle="light-content" />
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.gradientContainer}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Header with FAP-Blockchain Text */}
              <Animated.View style={[styles.headerContainer, boyAnimatedStyle]}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>FAP</Text>
                  <Text style={styles.logoSubText}>Blockchain</Text>
                  <View style={styles.logoDivider} />
                  <Text style={styles.taglineText}>
                    Secure • Fast • Reliable
                  </Text>
                </View>
              </Animated.View>
            </SafeAreaView>

            {/* Login Form */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <View style={styles.formCard}>
                <Text style={styles.loginTitle}>Login with Password</Text>

                <Animated.View
                  style={[styles.inputContainer, inputAnimatedStyle]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="user" size={20} color="#4A90E2" />
                  </View>
                  <TextInput
                    onChangeText={setUserName}
                    value={userName}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </Animated.View>

                <Animated.View
                  style={[styles.inputContainer, inputAnimatedStyle]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="lock" size={20} color="#4A90E2" />
                  </View>
                  <TextInput
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    style={styles.input}
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={handleEyePress}
                  >
                    <Feather
                      name={isPasswordVisible ? "eye" : "eye-off"}
                      size={20}
                      color="#4A90E2"
                    />
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View
                  style={[styles.loginButtonContainer, buttonAnimatedStyle]}
                >
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>LOG IN</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
    height: height * 0.4,
  },
  // Logo Container Styles
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubText: {
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
  logoDivider: {
    width: 60,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 2,
    marginVertical: 16,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Form Styles
  formContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: height * 0.08,
    paddingHorizontal: 20,
  },
  formCard: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    backgroundColor: "#fff",
  },
  iconContainer: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  loginButtonContainer: {
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default LoginScreen;
