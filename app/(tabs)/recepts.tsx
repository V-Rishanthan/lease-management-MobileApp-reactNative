import {
  Banknote,
  Building2,
  Calendar,
  Camera,
  ChevronRight,
  FileText,
  Hash,
  UploadCloud,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
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
import Colors from "../../constants/Colors";

const { width } = Dimensions.get("window");

export default function Receipts() {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [bank, setBank] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    console.log({ amount, date, bank, reference, notes });
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
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Submit Receipt</Text>
            <Text style={styles.subtitle}>
              Upload your bank slip to verify your transaction
            </Text>
          </View>

          {/* Enhanced Upload Zone */}
          <View style={styles.uploadCard}>
            <View style={styles.dashedBorder}>
              <View style={styles.iconCircle}>
                <UploadCloud color={Colors.primary} size={28} />
              </View>
              <Text style={styles.uploadTitle}>Capture or Upload Slip</Text>
              <Text style={styles.uploadHint}>
                Supports JPG, PNG or PDF (Max 5MB)
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Camera color={Colors.white} size={18} />
                  <Text style={styles.actionBtnText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.7}
                >
                  <FileText color={Colors.primary} size={18} />
                  <Text style={styles.secondaryBtnText}>Files</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount Paid</Text>
              <View style={styles.inputWrapper}>
                <Banknote
                  size={20}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Text style={styles.currency}>LKR</Text>
              </View>
            </View>

            {/* Date & Bank Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.inputWrapper}>
                  <Calendar size={18} color={Colors.textLight} />
                  <Text style={styles.inputText}>{date || "mm/dd/yy"}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>Bank</Text>
                <TouchableOpacity style={styles.inputWrapper}>
                  <Building2 size={18} color={Colors.textLight} />
                  <Text style={styles.inputText} numberOfLines={1}>
                    {bank || "Select Bank"}
                  </Text>
                  <ChevronRight size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reference Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reference Number</Text>
              <View style={styles.inputWrapper}>
                <Hash
                  size={18}
                  color={Colors.textLight}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="TXN / Ref Number"
                  placeholderTextColor={Colors.textMuted}
                  value={reference}
                  onChangeText={setReference}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Additional details..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>Submit Verification</Text>
            <ChevronRight color={Colors.white} size={20} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 24, marginTop: 40 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: Colors.textMid, marginTop: 4 },

  /* Upload Card */
  uploadCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dashedBorder: {
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: { fontSize: 16, fontWeight: "700", color: Colors.textDark },
  uploadHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  buttonGroup: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: { color: Colors.white, fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 14 },

  /* Form Styling */
  formContainer: { gap: 16 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  inputGroup: { marginBottom: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMid,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: Colors.textDark, fontWeight: "500" },
  currency: { fontWeight: "700", color: Colors.textMuted, fontSize: 14 },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: "500",
    marginLeft: 10,
  },
  row: { flexDirection: "row" },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    height: 100,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    fontSize: 15,
    color: Colors.textDark,
    textAlignVertical: "top",
  },

  /* Submit Button */
  submitBtn: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    elevation: 8,
    gap: 10,
  },
  submitText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
});
