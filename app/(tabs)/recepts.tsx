import {
  Calendar,
  Camera,
  ChevronRight,
  UploadCloud,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
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

export default function Recepts() {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [bank, setBank] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleTakePhoto = () => {
    // TODO: wire camera
  };
  const handleChooseFile = () => {
    // TODO: open file picker
  };
  const handleSubmit = () => {
    // TODO: submit form
    console.log({ amount, date, bank, reference, notes });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Upload Bank Receipt</Text>
        <Text style={styles.subtitle}>
          Scan or upload your transaction proof
        </Text>

        <View style={styles.uploadBox}>
          <View style={styles.cameraCircle}>
            <Camera color={Colors.white} size={20} />
          </View>
          <Text style={styles.uploadTitle}>Upload Bank Receipt</Text>
          <Text style={styles.uploadHint}>
            Scan or upload your transaction proof
          </Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.primaryBtn]}
              onPress={handleTakePhoto}
            >
              <Camera color={Colors.white} size={14} />
              <Text style={styles.btnTextPrimary}> Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.outlineBtn]}
              onPress={handleChooseFile}
            >
              <UploadCloud color={Colors.primary} size={14} />
              <Text style={styles.btnTextOutline}> Choose File</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Amount Paid</Text>
        <TextInput
          style={styles.input}
          placeholder="LKR 0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.fieldLabel}>Payment Date</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => {}}>
          <Text style={styles.inputText}>{date || "mm/dd/yyyy"}</Text>
          <Calendar color={Colors.textMid} size={18} />
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Bank Name</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => {}}>
          <Text style={styles.inputText}>{bank || "Select your bank"}</Text>
          <ChevronRight color={Colors.textMid} size={18} />
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Reference Number</Text>
        <TextInput
          style={styles.input}
          placeholder="TXN12345678"
          value={reference}
          onChangeText={setReference}
        />

        <Text style={styles.fieldLabel}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add extra details here..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Receipt</Text>
          <ChevronRight color={Colors.white} size={18} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40, marginTop: 30 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: { color: Colors.textMid, marginBottom: 16 },

  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.borderLight,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginBottom: 18,
  },
  cameraCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryFade,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: { fontWeight: "700", color: Colors.textDark },
  uploadHint: { color: Colors.textMid, fontSize: 12, marginBottom: 12 },

  uploadButtons: { flexDirection: "row", gap: 12 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryBtn: { backgroundColor: Colors.primary, marginRight: 10 },
  outlineBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  btnTextPrimary: { color: Colors.white, fontWeight: "700" },
  btnTextOutline: { color: Colors.textDark, fontWeight: "700" },

  fieldLabel: { color: Colors.textMid, marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: Colors.surface, padding: 12, borderRadius: 10 },
  inputRow: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: { color: Colors.textMid },
  textArea: { height: 100, textAlignVertical: "top" },

  submitBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: { color: Colors.white, fontWeight: "700", marginRight: 8 },
});
