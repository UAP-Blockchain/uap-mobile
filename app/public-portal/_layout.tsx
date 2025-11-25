import { Stack } from "expo-router";

export default function PublicPortalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verifier"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verification-history"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}


