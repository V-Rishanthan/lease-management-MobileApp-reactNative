import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  HandCoins,
  Map,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fields = [
  {
    key: "ownerName",
    label: "LAND OWNER NAME",
    placeholder: "e.g. Mr. Perera",
    icon: User,
    keyboard: "default" as const,
    prefix: null,
    suffix: null,
  },
  {
    key: "date",
    label: "DATE OF INCOME",
    placeholder: "DD/MM/YYYY",
    icon: Calendar,
    keyboard: "number-pad" as const,
    prefix: null,
    suffix: null,
  },
  {
    key: "acres",
    label: "TOTAL AREA",
    placeholder: "0.00",
    icon: Map,
    keyboard: "decimal-pad" as const,
    prefix: null,
    suffix: "acres",
  },
  {
    key: "amount",
    label: "INCOME AMOUNT",
    placeholder: "0.00",
    icon: DollarSign,
    keyboard: "decimal-pad" as const,
    prefix: "LKR",
    suffix: null,
  },
  {
    key: "notes",
    label: "NOTES (OPTIONAL)",
    placeholder: "Additional details...",
    icon: FileText,
    keyboard: "default" as const,
    prefix: null,
    suffix: null,
  },
  {
    key: "frequency",
    label: "FREQUENCY OF INCOME",
    placeholder: "Select Frequency",
    icon: Clock,
    keyboard: "default" as const,
    prefix: null,
    suffix: null,
  },
  {
    key: "advanceAmount",
    label: "ADVANCE AMOUNT",
    placeholder: "0.00",
    icon: HandCoins,
    keyboard: "decimal-pad" as const,
    prefix: null,
    suffix: null,
  },
];

const requiredKeys = ["ownerName", "date", "acres", "amount"];

export default function AddIncome() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const setValue = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const isFormValid = requiredKeys.every((k) => form[k]?.trim());

  const handleSubmit = async () => {
    try {
      if (!isFormValid) {
        Alert.alert("Invalid Input", "Please fill in all required fields.");
        return;
      }

      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicle_info")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (vehicleError || !vehicleData) {
        throw new Error("Could not find vehicle info for this user.");
      }

      const payload = {
        vehicle_info_id: vehicleData.id,
        land_owner_name: form.ownerName,
        date: form.date,
        total_area: parseFloat(form.acres),
        income_amount: parseFloat(form.amount),
        notes: form.notes || null,
        how_often: form.frequency || null,
        advance_amount: parseFloat(form.advanceAmount) || 0,
      };

      const { error } = await supabase
        .from("income")
        .insert([payload]);

      if (error) throw error;

      Alert.alert("Success", "Income record saved successfully!");

      router.back(); // go back after save
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      setValue("date", formatDate(date));
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
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
            <Text style={styles.screenTitle}>Add Income</Text>
            <View style={{ width: 46 }} />
          </View>

          {/* ── SUBTITLE ── */}
          <Text style={styles.subtitle}>
            Enter the income details below. These values will be recorded to
            your dashboard.
          </Text>

          {/* ── FIELDS CARD ── */}
          <View style={styles.fieldsCard}>
            {fields.map((field, index) => {
              const Icon = field.icon;
              const isFocused = focused === field.key;
              const isDateField = field.key === "date";

              return (
                <View key={field.key}>
                  <TouchableOpacity
                    activeOpacity={isDateField ? 0.7 : 1}
                    onPress={isDateField ? handleDatePress : undefined}
                    disabled={!isDateField}
                  >
                    <View
                      style={[
                        styles.fieldWrap,
                        isFocused && styles.fieldWrapFocused,
                      ]}
                    >
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

                          {isDateField ? (
                            <Text
                              style={[
                                styles.input,
                                !form[field.key] && styles.placeholderText,
                              ]}
                            >
                              {form[field.key] || field.placeholder}
                            </Text>
                          ) : (
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
                          )}

                          {field.suffix && (
                            <Text style={styles.suffix}>{field.suffix}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {index < fields.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          {/* ── SAVE BUTTON ── */}
          <TouchableOpacity
            activeOpacity={isFormValid ? 0.85 : 1}
            disabled={!isFormValid}
            onPress={handleSubmit}
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
                {
                  loading
                    ? "Saving..."
                    : "Save Income Record"
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },

  /* ── HEADER ── */
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

  /* ── FIELDS CARD ── */
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
  fieldWrapFocused: { backgroundColor: "#F8F9FF" },
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
  iconWrapActive: { backgroundColor: Colors.primary },
  fieldInner: { flex: 1, gap: 3 },
  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  prefix: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
  prefixActive: { color: Colors.textMid },
  suffix: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
  input: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontWeight: "400",
  },

  /* ── SAVE BUTTON ── */
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
