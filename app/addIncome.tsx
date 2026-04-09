import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Calendar, ChevronLeft, Map, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AddIncome = () => {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [date, setDate] = useState("");
  const [acres, setAcres] = useState("");

  const handleSubmit = () => {
    console.log({ ownerName, date, acres });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Custom Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft color={Colors.textDark} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Income</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Land Details</Text>
            <Text style={styles.sectionSubtitle}>
              Enter the specifics of the land revenue
            </Text>

            {/* Owner Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Land Owner Name</Text>
              <View style={styles.inputWrapper}>
                <User
                  size={18}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.textMuted}
                  value={ownerName}
                  onChangeText={setOwnerName}
                />
              </View>
            </View>

            {/* Date Picker Trigger */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Date of Record</Text>
              <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7}>
                <Calendar
                  size={18}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.inputText,
                    !date && { color: Colors.textMuted },
                  ]}
                >
                  {date || "Select date"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Acres Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Total Area (Acres)</Text>
              <View style={styles.inputWrapper}>
                <Map
                  size={18}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  value={acres}
                  onChangeText={setAcres}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>Save Record</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddIncome;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textDark,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textMid,
    marginBottom: 20,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: "500",
  },
  inputText: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: "500",
  },
  submitBtn: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
