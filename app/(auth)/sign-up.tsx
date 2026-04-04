import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

export default function SignUpScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const firstFocus = useRef(new Animated.Value(0)).current;
  const lastFocus = useRef(new Animated.Value(0)).current;
  const emailFocus = useRef(new Animated.Value(0)).current;
  const passFocus = useRef(new Animated.Value(0)).current;
  const confirmFocus = useRef(new Animated.Value(0)).current;

  const animateFocus = (anim: Animated.Value, val: number) => {
    Animated.timing(anim, {
      toValue: val,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.border, Colors.primary],
    });

  const onSignUp = () => {
    if (!firstName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call — replace with your real auth logic
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)/home");
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/images/LeaseTrack.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start tracking your leases today</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First & Last Name */}
          <View style={styles.nameRow}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>
                First Name <Text style={styles.required}>*</Text>
              </Text>
              <Animated.View
                style={[
                  styles.inputWrap,
                  { borderColor: borderColor(firstFocus) },
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor={Colors.textMuted}
                  value={firstName}
                  onChangeText={(t) => {
                    setFirstName(t);
                    setError("");
                  }}
                  autoCapitalize="words"
                  onFocus={() => animateFocus(firstFocus, 1)}
                  onBlur={() => animateFocus(firstFocus, 0)}
                />
              </Animated.View>
            </View>

            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
              <Animated.View
                style={[
                  styles.inputWrap,
                  { borderColor: borderColor(lastFocus) },
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor={Colors.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  onFocus={() => animateFocus(lastFocus, 1)}
                  onBlur={() => animateFocus(lastFocus, 0)}
                />
              </Animated.View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Email Address <Text style={styles.required}>*</Text>
            </Text>
            <Animated.View
              style={[
                styles.inputWrap,
                { borderColor: borderColor(emailFocus) },
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                onFocus={() => animateFocus(emailFocus, 1)}
                onBlur={() => animateFocus(emailFocus, 0)}
              />
            </Animated.View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <Animated.View
              style={[
                styles.inputWrap,
                { borderColor: borderColor(passFocus) },
              ]}
            >
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError("");
                }}
                secureTextEntry={!showPassword}
                onFocus={() => animateFocus(passFocus, 1)}
                onBlur={() => animateFocus(passFocus, 0)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Confirm Password <Text style={styles.required}>*</Text>
            </Text>
            <Animated.View
              style={[
                styles.inputWrap,
                { borderColor: borderColor(confirmFocus) },
              ]}
            >
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirm(t);
                  setError("");
                }}
                secureTextEntry={!showConfirm}
                onFocus={() => animateFocus(confirmFocus, 1)}
                onBlur={() => animateFocus(confirmFocus, 0)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showConfirm ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Error */}
          {error !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          {/* Sign Up button */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={onSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomPrompt}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/sign-in")}>
              <Text style={styles.bottomLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  logoWrap: {
    alignItems: "center",
    marginTop: 56,
    marginBottom: 28,
  },
  logo: {
    width: 180,
    height: 56,
  },

  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },

  form: {
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMid,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  eyeBtn: {
    paddingLeft: 10,
  },
  eyeText: {
    fontSize: 16,
  },

  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.error,
  },

  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomPrompt: {
    fontSize: 14,
    color: Colors.textLight,
  },
  bottomLink: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
});
