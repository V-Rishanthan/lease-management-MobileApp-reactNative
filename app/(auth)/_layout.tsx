import { Stack } from "expo-router";
import Colors from "../../constants/Colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        // Avoid native-stack transition Animated paths that crash on RN 0.81 + Fabric.
        animation: "none",
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
