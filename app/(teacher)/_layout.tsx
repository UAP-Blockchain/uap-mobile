import { Stack } from "expo-router";

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="schedule"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
