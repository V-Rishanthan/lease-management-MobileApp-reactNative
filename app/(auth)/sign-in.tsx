import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const onSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

      if (authError) throw authError;

      if (data.session) {
        router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* <StatusBar barStyle="light-content" /> */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER SECTION */}
      <View style={styles.headerBg}>
        <LinearGradient
          colors={["#4A56C8", "#1C2478", "#0F1460"]}
          style={styles.overlay}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LEASEPAY</Text>
            <View style={styles.yellowBar} />
          </View>
        </LinearGradient>
      </View>

      {/* FORM CARD */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <Text style={styles.instructionText}>
              Login to your existent account of auditions
            </Text>

            {/* Email Field */}
            <View style={styles.inputGap}>
              <View style={styles.labelWrapper}>
                <Text style={styles.floatingLabel}>Email Address</Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  {
                    borderColor: emailFocused ? Colors.primary : Colors.border,
                  },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError("");
                  }}
                  placeholder="johndoe23@gmail.com"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGap}>
              <View
                style={[
                  styles.inputBox,
                  {
                    borderColor: passFocused ? Colors.primary : Colors.border,
                  },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError("");
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="********"
                  placeholderTextColor={Colors.textMuted}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={Colors.textMid}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.helperRow}>
              <View style={styles.checkboxArea}>
                <View style={styles.checkbox} />
                <Text style={styles.helperText}>Remember Me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.helperText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {error !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              onPress={onSignIn}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={["#4A56C8", "#1C2478", "#0F1460"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainButton}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Log in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerArea}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Login With</Text>
              <View style={styles.line} />
            </View>
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/sign-up")}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  headerBg: { width: "100%", height: 350 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  logoContainer: { alignItems: "center" },
  logoText: {
    color: Colors.white,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 3,
  },
  yellowBar: {
    width: 90,
    height: 6,
    backgroundColor: "#F2C94C",
    marginTop: 8,
    alignSelf: "flex-start",
  },
  content: { flex: 1, marginTop: -80 },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 60,
    paddingHorizontal: 35,
    paddingTop: 45,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: { paddingBottom: 30 },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 20,
    marginBottom: 35,
    maxWidth: "80%",
  },
  inputGap: { marginBottom: 20 },
  labelWrapper: {
    position: "absolute",
    top: -10,
    left: 15,
    backgroundColor: Colors.white,
    paddingHorizontal: 5,
    zIndex: 2,
  },
  floatingLabel: { fontSize: 11, color: Colors.primary, fontWeight: "600" },
  inputBox: {
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: { flex: 1, fontSize: 14, color: Colors.textDark },
  helperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  checkboxArea: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: 8,
  },
  helperText: { fontSize: 11, color: Colors.textLight },
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: Colors.error, fontSize: 12, fontWeight: "600" },
  mainButton: {
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: "bold" },
  dividerArea: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { marginHorizontal: 15, fontSize: 12, color: Colors.textLight },
  fbButton: {
    height: 48,
    backgroundColor: "#3b5998",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  fbText: { color: Colors.white, fontWeight: "700", fontSize: 14 },
  footer: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: { color: Colors.textMid, fontSize: 13 },
  signUpLink: { color: Colors.primary, fontWeight: "bold", fontSize: 13 },
});
