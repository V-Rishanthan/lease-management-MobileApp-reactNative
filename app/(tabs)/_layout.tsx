import { Tabs } from "expo-router";
import {
  Banknote,
  Bell,
  CreditCard,
  FileText,
  Home,
} from "lucide-react-native";
import React from "react";
import Colors from "../../constants/Colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const name = String(route.name).toLowerCase();
        const icon = (color: string, size = 20) => {
          if (name.includes("home")) return <Home color={color} size={size} />;
          if (name.includes("alert")) return <Bell color={color} size={size} />;
          if (name.includes("expenses"))
            return <CreditCard color={color} size={size} />;
          if (name.includes("income"))
            return <Banknote color={color} size={size} />;
          if (
            name.includes("recept") ||
            name.includes("receipt") ||
            name.includes("recep")
          )
            return <FileText color={color} size={size} />;
          return <Home color={color} size={size} />;
        };

        const label = name.charAt(0).toUpperCase() + name.slice(1);

        return {
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.borderLight,
          },
          tabBarIcon: ({ color, size }) => icon(String(color), size),
          tabBarLabel: label,
        };
      }}
    />
  );
}
