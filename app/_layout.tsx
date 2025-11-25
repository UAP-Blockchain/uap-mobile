import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ErrorBoundary from "@/components/Err/ErrorBoundary";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../lib/store";
// import { NotificationProvider } from '@/contexts/NotificationContext';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ErrorBoundary>
              {/* <NotificationProvider> */}
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <Stack>
                  <Stack.Screen
                    name="(auth)"
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="(student)"
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="(teacher)"
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen
                    name="public-portal"
                    options={{
                      headerShown: false,
                    }}
                  />
                </Stack>
                <StatusBar style="auto" />
                <Toast
                  config={{
                    SUCCESS: (props) => (
                      <View
                        style={{
                          backgroundColor: "#4CAF50",
                          padding: 15,
                          borderRadius: 8,
                          marginHorizontal: 16,
                          marginTop: 20,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#fff",
                          }}
                        >
                          {props.text1}
                        </Text>
                        {props.text2 && (
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#fff",
                              marginTop: 4,
                            }}
                          >
                            {props.text2}
                          </Text>
                        )}
                      </View>
                    ),
                    NOTSUCCESS: (props) => (
                      <View
                        style={{
                          backgroundColor: "#F44336",
                          padding: 15,
                          borderRadius: 8,
                          marginHorizontal: 16,
                          marginTop: 60,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#fff",
                          }}
                        >
                          {props.text1}
                        </Text>
                        {props.text2 && (
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#fff",
                              marginTop: 4,
                            }}
                          >
                            {props.text2}
                          </Text>
                        )}
                      </View>
                    ),
                  }}
                />
              </ThemeProvider>
              {/* </NotificationProvider> */}
            </ErrorBoundary>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
