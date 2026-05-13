import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "../constants/Colors";
import { supabase } from "../lib/supabase";

export default function LandingScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const botOpacity = useRef(new Animated.Value(0)).current;
  const botY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // ── Step 1: Run entrance animations ──
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(botOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(botY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // ── Step 2: Navigate based on auth state after 3 seconds ──
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/sign-in");
      }
    }, 3000);

    // Cleanup timer if screen unmounts early
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── CENTER BLOCK ── */}
      <View style={styles.centerBlock}>
        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoY }],
          }}
        >
          <Image
            source={require("../assets/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textY }],
            alignItems: "center",
          }}
        >
          <Text style={styles.tagline}>Smart Leasing Monitor</Text>
        </Animated.View>
      </View>

      {/* ── BOTTOM BLOCK ── */}
      <Animated.View
        style={[
          styles.bottomBlock,
          { opacity: botOpacity, transform: [{ translateY: botY }] },
        ]}
      >
        <Text style={styles.bottomDesc}>
          Securely monitoring your{"\n"}premium vehicle finance
        </Text>

        <View style={styles.fintechBadge}>
          <Text style={styles.shieldEmoji}>🛡</Text>
          <Text style={styles.fintechText}>Fintech Secure</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 32,
  },

  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  logoImage: {
    width: 230,
    height: 72,
  },

  tagline: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 4,
    color: Colors.textLight,
    textTransform: "uppercase",
    textAlign: "center",
  },

  bottomBlock: {
    alignItems: "center",
    gap: 14,
  },

  bottomDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 22,
  },

  fintechBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  shieldEmoji: {
    fontSize: 12,
    opacity: 0.5,
  },
  fintechText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.5,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
});
