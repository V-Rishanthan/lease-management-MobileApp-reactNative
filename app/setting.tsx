import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Car,
  CreditCard,
  DollarSign,
  TrendingDown,
  Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";

const fields = [
  {
    key: "vehicleName",
    label: "VEHICLE NAME",
    placeholder: "e.g. Toyota Axio 2018",
    icon: Car,
    keyboard: "default" as const,
    prefix: null,
  },
  {
    key: "totalValue",
    label: "TOTAL VALUE",
    placeholder: "0.00",
    icon: DollarSign,
    keyboard: "decimal-pad" as const,
    prefix: "LKR",
  },
  {
    key: "leaseAmount",
    label: "LEASE AMOUNT",
    placeholder: "0.00",
    icon: CreditCard,
    keyboard: "decimal-pad" as const,
    prefix: "LKR",
  },
  {
    key: "monthlyDue",
    label: "MONTHLY DUE",
    placeholder: "0.00",
    icon: Wallet,
    keyboard: "decimal-pad" as const,
    prefix: "LKR",
  },
  {
    key: "balance",
    label: "BALANCE",
    placeholder: "0.00",
    icon: TrendingDown,
    keyboard: "decimal-pad" as const,
    prefix: "LKR",
  },
  {
    key: "totalYears",
    label: "TOTAL YEARS",
    placeholder: "e.g. 5",
    icon: Calendar,
    keyboard: "number-pad" as const,
    prefix: null,
    suffix: "yrs",
  },
];

const Setting = () => {
  const router = useRouter();

  const [form, setForm] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setValue = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const isFormValid = fields.every((f) => form[f.key]?.trim());

  // SAVE TO SUPABASE
  const handleSave = async () => {
    try {
      if (!isFormValid) {
        Alert.alert(
          "Invalid Input",
          "Please fill in all fields before saving.",
        );
        return;
      }

      setLoading(true);

      // Get logged-in user

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const payload = {
        user_id: user.id,
        vehicle_name: form.vehicleName,
        total_value: Number(form.totalValue),
        lease_amount: Number(form.leaseAmount),
        monthly_due: Number(form.monthlyDue),
        balance_amount: Number(form.balance),
        total_years: Number(form.totalYears),
        set_reminder: true,
      };

      const { error } = await supabase.from("vehicle_info").insert([payload]);

      if (error) throw error;

      Alert.alert("Success", "Vehicle saved successfully!");
      setForm({});
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <LinearGradient
                colors={["#4A56C8", "#1C2478"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backBtn}
              >
                <ArrowLeft color={Colors.white} size={18} />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Manage Settings</Text>
            <View style={{ width: 46 }} />
          </View>

          {/* ── SUBTITLE ── */}
          <Text style={styles.subtitle}>
            Enter your lease details below. These values will be reflected
            across your dashboard.
          </Text>

          {/* ── FIELDS CARD ── */}
          <View style={styles.fieldsCard}>
            {fields.map((field, index) => {
              const Icon = field.icon;
              const isFocused = focused === field.key;

              return (
                <View key={field.key}>
                  <View
                    style={[
                      styles.fieldWrap,
                      isFocused && styles.fieldWrapFocused,
                    ]}
                  >
                    {/* Icon */}
                    <View
                      style={[
                        styles.iconWrap,
                        isFocused && styles.iconWrapActive,
                      ]}
                    >
                      <Icon
                        size={16}
                        color={isFocused ? Colors.white : Colors.primary}
                      />
                    </View>

                    {/* Label + Input */}
                    <View style={styles.fieldInner}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <View style={styles.inputRow}>
                        {field.prefix && (
                          <Text
                            style={[
                              styles.prefix,
                              isFocused && styles.prefixActive,
                            ]}
                          >
                            {field.prefix}
                          </Text>
                        )}
                        <TextInput
                          style={styles.input}
                          placeholder={field.placeholder}
                          placeholderTextColor={Colors.textMuted}
                          value={form[field.key] ?? ""}
                          onChangeText={(t) => setValue(field.key, t)}
                          onFocus={() => setFocused(field.key)}
                          onBlur={() => setFocused(null)}
                          keyboardType={field.keyboard}
                          returnKeyType={
                            index < fields.length - 1 ? "next" : "done"
                          }
                        />
                        {(field as any).suffix && (
                          <Text style={styles.suffix}>
                            {(field as any).suffix}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {index < fields.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          {/* ── SAVE BUTTON ── */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={isFormValid ? 0.85 : 1}
            disabled={!isFormValid}
          >
            <LinearGradient
              colors={
                isFormValid
                  ? ["#4A56C8", "#1C2478"]
                  : [Colors.borderLight, Colors.border]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              <Text
                style={[
                  styles.saveBtnText,
                  !isFormValid && { color: Colors.textMuted },
                ]}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
  },

  /* ─── HEADER ─── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  screenTitle: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  subtitle: {
    color: Colors.textLight,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },

  /* ─── FIELDS CARD ─── */
  fieldsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 28,
  },

  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
    backgroundColor: Colors.surface,
  },

  fieldWrapFocused: {
    backgroundColor: "#F8F9FF",
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF0FD",
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrapActive: {
    backgroundColor: Colors.primary,
  },

  fieldInner: {
    flex: 1,
    gap: 3,
  },

  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  prefix: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  prefixActive: {
    color: Colors.textMid,
  },

  suffix: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  input: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },

  /* ─── SAVE BTN ─── */
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
