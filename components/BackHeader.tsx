import React, { ReactNode, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type BackHeaderProps = {
  title: string;
  subtitle?: string;
  subtitleSmall?: string;
  gradientColors?: [string, string];
  rightContent?: ReactNode;
  onBackPress?: () => void;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleAlign?: "left" | "center";
  fallbackRoute?: string;
};

const DEFAULT_GRADIENT: [string, string] = ["#3674B5", "#1890ff"];

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  subtitleSmall,
  gradientColors = DEFAULT_GRADIENT,
  rightContent,
  onBackPress,
  containerStyle,
  contentStyle,
  titleAlign = "left",
  fallbackRoute,
}) => {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    const canGoBack = (router as any)?.canGoBack?.() ?? false;
    if (canGoBack) {
      router.back();
    } else if (fallbackRoute) {
      router.replace(fallbackRoute as any);
    } else {
      // Mặc định điều hướng về màn hình chính của student
      router.replace("/(student)/(tabs)" as any);
    }
  };

  const textAlignment = useMemo(
    () => (titleAlign === "center" ? styles.centeredText : undefined),
    [titleAlign]
  );

  return (
    <LinearGradient
      colors={gradientColors}
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        containerStyle,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <View
          style={[
            styles.textContainer,
            titleAlign === "center" && styles.textCenter,
          ]}
        >
          <Text style={[styles.title, textAlignment]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, textAlignment]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {subtitleSmall ? (
            <Text
              style={[styles.subtitleSmall, textAlignment]}
              numberOfLines={1}
            >
              {subtitleSmall}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>
          {rightContent ? rightContent : <View style={{ width: 24 }} />}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  textCenter: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  subtitleSmall: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  centeredText: {
    textAlign: "center",
  },
  rightSlot: {
    marginLeft: 12,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default BackHeader;

