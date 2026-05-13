import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  Tag,
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

const CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Repairs",
  "Driver Salary",
  "Spare Parts",
  "Insurance",
  "Loan/Lease Payment",
  "Transport",
  "Other",
];

export default function addExpenses() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDateForDisplay = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateFromInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4)
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const onDateChange = (event: any, selectedDateValue?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDateValue) {
      setSelectedDate(selectedDateValue);
      setDate(formatDateForDisplay(selectedDateValue));
    }

    if (Platform.OS === "ios") {
      setShowDatePicker(false);
    }
  };

  const formatPrice = (text: string) => {
    // Allow only numbers and single decimal point
    let cleaned = text.replace(/[^0-9.]/g, "");
    const decimalCount = (cleaned.match(/\./g) || []).length;
    if (decimalCount > 1) {
      // Keep only first decimal point
      const firstDecimalIndex = cleaned.indexOf('.');
      cleaned = cleaned.substring(0, firstDecimalIndex + 1) +
        cleaned.substring(firstDecimalIndex + 1).replace(/\./g, '');
    }
    return cleaned;
  };

  const isFormValid =
    name.trim() && date.trim() && price.trim() && selectedCategory.trim();

  const handleSubmit = async () => {
    try {
      if (!isFormValid) {
        Alert.alert("Invalid Input", "Please fill in all required fields.");
        return;
      }

      // Validate date format
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(date)) {
        Alert.alert("Invalid Date", "Please use DD/MM/YYYY format.");
        return;
      }

      // Parse and validate date components
      const [day, month, year] = date.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (dateObj.getFullYear() !== year ||
        dateObj.getMonth() !== month - 1 ||
        dateObj.getDate() !== day) {
        Alert.alert("Invalid Date", "Please enter a valid date.");
        return;
      }

      // Validate price
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert("Invalid Price", "Please enter a valid positive amount.");
        return;
      }

      setLoading(true);

      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.user) {
        throw new Error("User not authenticated");
      }

      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicle_info")
        .select("id")
        .eq("user_id", user.user.id)
        .single();

      if (vehicleError || !vehicleData) {
        throw new Error("Could not find vehicle info for this user.");
      }

      // Convert date from DD/MM/YYYY to YYYY-MM-DD for database
      const [dayNum, monthNum, yearNum] = date.split('/');
      const formattedDate = `${yearNum}-${monthNum}-${dayNum}`;

      const payload = {
        vehicle_info_id: vehicleData.id,
        // Generate a unique UUID for the expense primary key
        expense_name: name.trim(),
        category: selectedCategory,
        price: priceNum,
        date: formattedDate,
        created_at: new Date().toISOString(),
      };

      const { data: expenseData, error: expenseError } = await supabase
        .from("expense")
        .insert([payload])
        .select();

      if (expenseError) {
        throw new Error(expenseError.message);
      }

      Alert.alert(
        "Success",
        "Expense added successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add expense");
      console.error("Expense submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            <Text style={styles.screenTitle}>Add Expense</Text>
            {/* spacer to center title */}
            <View style={{ width: 46 }} />
          </View>

          {/* ── AMOUNT HERO ── */}
          <View style={styles.amountHero}>
            <Text style={styles.amountHeroLabel}>Total Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>LKR</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.border}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={(t) => setPrice(formatPrice(t))}
              />
            </View>
            <View style={styles.amountUnderline} />
          </View>

          {/* ── CATEGORY CHIPS ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                  >
                    {active ? (
                      <LinearGradient
                        colors={["#4A56C8", "#1C2478"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.chipActive}
                      >
                        <Text style={styles.chipTextActive}>{cat}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{cat}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── FORM FIELDS ── */}
          <View style={styles.fieldsCard}>
            {/* Name */}
            <View style={styles.fieldRow}>
              <View
                style={[
                  styles.fieldIconWrap,
                  focused === "name" && styles.fieldIconActive,
                ]}
              >
                <Tag
                  size={16}
                  color={focused === "name" ? Colors.white : Colors.primary}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Expense Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Fuel, Maintenance"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            {/* Date */}
            <View style={styles.fieldRow}>
              <View
                style={[
                  styles.fieldIconWrap,
                  focused === "date" && styles.fieldIconActive,
                ]}
              >
                <Calendar
                  size={16}
                  color={focused === "date" ? Colors.white : Colors.primary}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={Colors.textMuted}
                    value={date}
                    onChangeText={(t) => setDate(formatDateFromInput(t))}
                    onFocus={() => setFocused("date")}
                    onBlur={() => setFocused(null)}
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="next"
                    editable={false}
                  />
                </TouchableOpacity>
              </View>
              {date.length === 10 && (
                <CheckCircle size={16} color={Colors.success} />
              )}
            </View>

            {/* DateTimePicker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
              />
            )}

            <View style={styles.fieldDivider} />

            {/* Category (dropdown) */}
            <View style={styles.fieldRow}>
              <View
                style={[
                  styles.fieldIconWrap,
                  focused === "category" && styles.fieldIconActive,
                ]}
              >
                <Tag
                  size={16}
                  color={focused === "category" ? Colors.white : Colors.primary}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCategoryDropdown((s) => !s);
                    setFocused("category");
                  }}
                >
                  <Text style={styles.fieldInput}>
                    {selectedCategory || "Select category"}
                  </Text>
                </TouchableOpacity>

                {showCategoryDropdown && (
                  <View style={styles.dropdown}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                          setFocused(null);
                        }}
                        style={styles.dropdownItemWrap}
                      >
                        <Text style={styles.dropdownItem}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.fieldDivider} />

            {/* Price (secondary) */}
            <View style={styles.fieldRow}>
              <View
                style={[
                  styles.fieldIconWrap,
                  focused === "price" && styles.fieldIconActive,
                ]}
              >
                <DollarSign
                  size={16}
                  color={focused === "price" ? Colors.white : Colors.primary}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Price (LKR)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={price}
                  onChangeText={(t) => setPrice(formatPrice(t))}
                  onFocus={() => setFocused("price")}
                  onBlur={() => setFocused(null)}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* ── SUBMIT BUTTON ── */}
          <TouchableOpacity
            activeOpacity={isFormValid && !loading ? 0.85 : 1}
            disabled={!isFormValid || loading}
            onPress={handleSubmit}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={
                isFormValid && !loading
                  ? ["#4A56C8", "#1C2478"]
                  : [Colors.borderLight, Colors.border]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitBtn}
            >
              <Text
                style={[
                  styles.submitText,
                  (!isFormValid || loading) && { color: Colors.textMuted },
                ]}
              >
                {loading ? "Saving..." : "Save Expense"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Fill in all fields to save your expense
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 20;

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
    marginBottom: 28,
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

  /* ─── AMOUNT HERO ─── */
  amountHero: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  amountHeroLabel: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },

  currencySymbol: {
    color: Colors.textMid,
    fontSize: 20,
    fontWeight: "700",
    paddingBottom: 4,
  },

  amountInput: {
    color: Colors.textDark,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1,
    minWidth: 120,
    textAlign: "center",
    padding: 0,
  },

  amountUnderline: {
    marginTop: 10,
    height: 2,
    width: 80,
    borderRadius: 1,
    backgroundColor: Colors.border,
  },

  /* ─── CATEGORIES ─── */
  section: {
    marginBottom: 20,
  },

  sectionLabel: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  chipsRow: {
    gap: 8,
    paddingRight: 4,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  chipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  chipText: {
    color: Colors.textMid,
    fontSize: 13,
    fontWeight: "600",
  },

  chipTextActive: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },

  /* ─── FIELDS CARD ─── */
  fieldsCard: {
    backgroundColor: Colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 24,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },

  fieldDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },

  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF0FD",
    alignItems: "center",
    justifyContent: "center",
  },

  fieldIconActive: {
    backgroundColor: Colors.primary,
  },

  fieldContent: {
    flex: 1,
    gap: 2,
  },

  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  fieldInput: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },

  dropdown: {
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  dropdownItemWrap: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownItem: {
    color: Colors.textDark,
    fontSize: 14,
  },

  /* ─── SUBMIT ─── */
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  hint: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
});