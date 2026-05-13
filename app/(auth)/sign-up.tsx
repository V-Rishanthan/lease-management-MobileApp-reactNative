import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstFocused, setFirstFocused] = useState(false);
  const [lastFocused, setLastFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !firstName) {
      Alert.alert("Required", "Please fill in all mandatory fields.");
      return;
    }

    try {
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
        });
      }

      Alert.alert("Success", "Check your email for the confirmation link.");
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* BACKGROUND IMAGE HEADER */}
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

      {/* FLOATING CARD */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.welcomeText}>WELCOME</Text>
            <Text style={styles.instructionText}>
              Create an account to start your journey with auditions
            </Text>

            {/* Name Row */}
            <View style={styles.row}>
              <View style={[styles.inputGap, { flex: 1, marginRight: 10 }]}>
                <View
                  style={[
                    styles.inputBox,
                    {
                      borderColor: firstFocused
                        ? Colors.primary
                        : Colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="First Name"
                    placeholderTextColor={Colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFirstFocused(true)}
                    onBlur={() => setFirstFocused(false)}
                  />
                </View>
              </View>
              <View style={[styles.inputGap, { flex: 1 }]}>
                <View
                  style={[
                    styles.inputBox,
                    {
                      borderColor: lastFocused
                        ? Colors.primary
                        : Colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setLastFocused(true)}
                    onBlur={() => setLastFocused(false)}
                  />
                </View>
              </View>
            </View>

            {/* Email Field with Styled Label */}
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
                  onChangeText={setEmail}
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
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
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

            {/* Action Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              activeOpacity={0.8}
              style={styles.buttonMargin}
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
                  <Text style={styles.buttonText}>Sign up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerArea}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>Sign Up With</Text>
              <View style={styles.line} />
            </View>
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.signUpLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  headerBg: { width: "100%", height: 320 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  logoContainer: { alignItems: "center" },
  logoText: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2,
  },
  yellowBar: {
    width: 80,
    height: 5,
    backgroundColor: "#F2C94C",
    marginTop: 4,
    alignSelf: "flex-start",
  },
  content: { flex: 1, marginTop: -70 },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 60,
    paddingHorizontal: 30,
    paddingTop: 40,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  scrollContent: { paddingBottom: 40 },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textMid,
    lineHeight: 18,
    marginBottom: 30,
    maxWidth: "85%",
  },
  row: { flexDirection: "row", marginBottom: 5 },
  inputGap: { marginBottom: 18 },
  labelWrapper: {
    position: "absolute",
    top: -10,
    left: 15,
    backgroundColor: Colors.white,
    paddingHorizontal: 5,
    zIndex: 2,
  },
  floatingLabel: { fontSize: 11, color: Colors.primary, fontWeight: "700" },
  inputBox: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  textInput: { flex: 1, fontSize: 14, color: Colors.textDark },
  buttonMargin: { marginTop: 10 },
  mainButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "bold" },
  dividerArea: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { marginHorizontal: 15, fontSize: 12, color: Colors.textLight },
  fbButton: {
    height: 48,
    backgroundColor: "#3b5998", // Standard FB color
    borderRadius: 24,
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
