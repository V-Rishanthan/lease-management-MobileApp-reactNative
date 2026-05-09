import DateTimePicker from "@react-native-community/datetimepicker";
import { decode } from "base64-arraybuffer";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Banknote,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Hash,
  Receipt,
  Sparkles,
  TriangleAlert,
  UploadCloud,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { supabase } from "../../lib/supabase";

// ── Constants ─────────────────────────────────────────────────────────────────
const SRI_LANKA_BANKS = [
  "Bank of Ceylon (BOC)",
  "People's Bank",
  "Commercial Bank of Ceylon",
  "Hatton National Bank (HNB)",
  "Sampath Bank",
  "Seylan Bank",
  "National Development Bank (NDB)",
  "DFCC Bank",
  "Pan Asia Banking Corporation",
  "Union Bank of Colombo",
  "Cargills Bank",
  "Amana Bank",
  "Nations Trust Bank",
  "Standard Chartered Bank",
  "HSBC Sri Lanka",
  "Citibank",
  "Indian Bank",
  "State Bank of India",
] as const;

type BankName = (typeof SRI_LANKA_BANKS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getBase64SizeKB = (base64: string): number => {
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.round(((base64.length * 3) / 4 - padding) / 1024);
};

const formatSize = (kb: number): string =>
  kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;

const compressToTarget = async (
  uri: string,
  base64: string,
  targetKB = 500
): Promise<{ uri: string; base64: string }> => {
  let quality = 0.8;
  let currentUri = uri;
  let currentBase64 = base64;
  while (getBase64SizeKB(currentBase64) > targetKB && quality > 0.1) {
    quality = Math.max(quality - 0.15, 0.1);
    const result = await ImageManipulator.manipulateAsync(currentUri, [], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    currentUri = result.uri;
    currentBase64 = result.base64 ?? currentBase64;
  }
  return { uri: currentUri, base64: currentBase64 };
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Receipts() {
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bank, setBank] = useState<BankName | "">("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [originalSizeKB, setOriginalSizeKB] = useState<number | null>(null);
  const [finalSizeKB, setFinalSizeKB] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);


  const router = useRouter();

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    })
    : "";

  const onDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) setSelectedDate(selected);
  };

  const processImage = async (uri: string, base64Raw: string) => {
    const origKB = getBase64SizeKB(base64Raw);
    setOriginalSizeKB(origKB);
    if (origKB > 500) {
      const { uri: compUri, base64: compB64 } = await compressToTarget(uri, base64Raw);
      setSelectedImage(compUri);
      setImageBase64(compB64);
      setFinalSizeKB(getBase64SizeKB(compB64));
    } else {
      setSelectedImage(uri);
      setImageBase64(base64Raw);
      setFinalSizeKB(origKB);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0])
      await processImage(result.assets[0].uri, result.assets[0].base64 ?? "");
  };

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0])
      await processImage(result.assets[0].uri, result.assets[0].base64 ?? "");
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageBase64(null);
    setOriginalSizeKB(null);
    setFinalSizeKB(null);
  };

  const handleBankSelect = (b: BankName) => {
    setBank(b);
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount)))
      return Alert.alert("Missing Amount", "Please enter a valid payment amount.");
    if (!selectedDate)
      return Alert.alert("Missing Date", "Please select the transaction date.");
    if (!selectedImage || !imageBase64)
      return Alert.alert("Missing Receipt", "Please upload or capture a receipt first.");

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in.");

      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicle_info").select("id").eq("user_id", user.id).single();
      if (vehicleError || !vehicle) throw new Error("No vehicle found.");

      const fileName = `${user.id}_${Date.now()}.jpg`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, decode(imageBase64), { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw new Error("Failed to upload image.");

      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(filePath);
      const receiptUrl = urlData?.publicUrl ?? null;

      const dateISO = selectedDate.toISOString().split("T")[0];
      const { error: insertError } = await supabase.from("receipts").insert([{
        vehicle_info_id: vehicle.id,
        paid_amount: parseFloat(amount),
        date: dateISO,
        bank: bank || null,
        reference: reference || null,
        notes: notes || null,
        image: receiptUrl,
      }]);
      if (insertError) throw insertError;

      Alert.alert("✓ Submitted", "Your receipt has been verified.");
      setAmount(""); setSelectedDate(null); setBank("");
      setReference(""); setNotes(""); clearImage();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Sub-components ────────────────────────────────────────────────────────
  const SizeBadge = () => {
    if (!originalSizeKB || !finalSizeKB) return null;
    const compressed = originalSizeKB > 500;
    return (
      <View style={s.badgeRow}>
        {compressed && (
          <View style={[s.badge, s.badgeWarn]}>
            <Text style={[s.badgeText, { color: Colors.warn }]}>
              <TriangleAlert color={Colors.warn} size={15} /> {formatSize(originalSizeKB)} original
            </Text>
          </View>
        )}
        <View style={[s.badge, s.badgeOk]}>
          <Text style={[s.badgeText, { color: Colors.success }]}>
            <Check color={Colors.success} size={15} />{compressed ? "Compressed to " : ""}{formatSize(finalSizeKB)}
          </Text>
        </View>
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero Header ── */}
          <LinearGradient
            colors={[Colors.primaryFade, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            {/* Decorative circles */}
            <View style={s.decCircle1} />
            <View style={s.decCircle2} />

            <View style={s.heroInner}>
              <View style={s.heroBadge}>
                <Sparkles color={Colors.primaryFade} size={13} />
                <Text style={s.heroBadgeText}>Payment Verification</Text>
              </View>
              <Text style={s.heroTitle}>Submit Receipt</Text>
              <Text style={s.heroSub}>
                Upload your bank slip to confirm your transaction
              </Text>
            </View>

            {/* View All Receipts */}
            <TouchableOpacity
              onPress={() => { router.push("/viewReceipt") }}
              style={s.viewAllBtn} activeOpacity={0.8}>
              <Receipt color={Colors.white} size={15} />
              <Text style={s.viewAllText}>View All Receipts</Text>
              <ChevronRight color={Colors.white} size={15} />
            </TouchableOpacity>
          </LinearGradient>

          {/* ── Upload Zone ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Attach Receipt</Text>

            <View style={s.uploadZone}>
              {selectedImage ? (
                <>
                  <Image source={{ uri: selectedImage }} style={s.preview} />
                  <TouchableOpacity style={s.removeOverlay} onPress={clearImage}>
                    <X color={Colors.white} size={14} />
                    <Text style={s.removeOverlayText}>Remove</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={s.uploadPlaceholder}>
                  <LinearGradient
                    colors={[Colors.primarySoft, Colors.primaryMid]}
                    style={s.uploadIconBg}
                  >
                    <UploadCloud color={Colors.primary} size={24} />
                  </LinearGradient>
                  <Text style={s.uploadLabel}>Tap below to attach your slip</Text>
                  <Text style={s.uploadHint}>
                    JPG, PNG · Max 5 MB · Auto-compressed to 500 KB
                  </Text>
                </View>
              )}
            </View>

            <SizeBadge />

            <View style={s.btnRow}>
              <TouchableOpacity style={s.btnPrimary} onPress={takePhoto} activeOpacity={0.85}>
                <Camera color={Colors.white} size={17} />
                <Text style={s.btnPrimaryText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnOutline} onPress={pickDocument} activeOpacity={0.85}>
                <FileText color={Colors.primary} size={17} />
                <Text style={s.btnOutlineText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Transaction Details ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Transaction Details</Text>

            {/* Amount */}
            <View style={s.field}>
              <Text style={s.label}>Amount Paid</Text>
              <View style={s.inputRow}>
                <View style={s.inputIconBox}>
                  <Banknote size={17} color={Colors.primary} />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <View style={s.currencyTag}>
                  <Text style={s.currencyText}>LKR</Text>
                </View>
              </View>
            </View>

            {/* Date + Bank */}
            <View style={s.twoCol}>
              <View style={[s.field, { flex: 1, marginRight: 10 }]}>
                <Text style={s.label}>Date</Text>
                <TouchableOpacity
                  style={s.inputRow}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={s.inputIconBox}>
                    <Calendar size={17} color={Colors.primary} />
                  </View>
                  <Text
                    style={[
                      s.input,
                      !formattedDate && { color: Colors.textMuted },
                    ]}
                  >
                    {formattedDate || "DD Mon YY"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[s.field, { flex: 1.6 }]}>
                <Text style={s.label}>Bank</Text>
                <TouchableOpacity
                  style={s.inputRow}
                  onPress={() => setModalVisible(true)}
                >
                  <View style={s.inputIconBox}>
                    <Building2 size={17} color={Colors.primary} />
                  </View>
                  <Text
                    style={[s.input, !bank && { color: Colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {bank || "Select bank"}
                  </Text>
                  <ChevronRight size={15} color={Colors.textMuted} style={{ marginRight: 10 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reference */}
            <View style={s.field}>
              <Text style={s.label}>Reference Number</Text>
              <View style={s.inputRow}>
                <View style={s.inputIconBox}>
                  <Hash size={17} color={Colors.primary} />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="TXN / Ref Number"
                  placeholderTextColor={Colors.textMuted}
                  value={reference}
                  onChangeText={setReference}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={s.field}>
              <Text style={s.label}>Notes (Optional)</Text>
              <TextInput
                style={s.textarea}
                placeholder="Any additional details about this payment..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          {/* ── Submit ── */}
          <View style={s.submitWrap}>
            <TouchableOpacity
              style={[s.submit, loading && { opacity: 0.65 }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primaryFade, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={s.submitText}>Submit Verification</Text>
                    <ChevronRight color={Colors.white} size={20} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Bank Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Select Your Bank</Text>
            <FlatList
              data={SRI_LANKA_BANKS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.bankRow, bank === item && s.bankRowActive]}
                  onPress={() => handleBankSelect(item)}
                >
                  <View style={[s.bankDot, bank === item && s.bankDotActive]} />
                  <Text style={[s.bankText, bank === item && s.bankTextActive]}>
                    {item}
                  </Text>
                  {bank === item && (
                    <ChevronRight size={15} color={Colors.primaryFade} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={s.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 60 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    marginBottom: 20,
  },
  heroInner: { zIndex: 2, marginBottom: 20 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.white,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryFade,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 19,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  viewAllText: { fontSize: 13, fontWeight: "700", color: Colors.white },

  // Decorative circles
  decCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -50,
    right: -50,
  },
  decCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    right: 80,
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textMid,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  // ── Upload ────────────────────────────────────────────────────────────────
  uploadZone: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primaryMid,
    borderStyle: "dashed",
    marginBottom: 12,
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadPlaceholder: { alignItems: "center", padding: 28 },
  uploadIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },

  preview: { width: "100%", height: 200, resizeMode: "cover" },
  removeOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  removeOverlayText: { color: Colors.white, fontSize: 12, fontWeight: "600" },

  // ── Badges ────────────────────────────────────────────────────────────────
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeWarn: { backgroundColor: Colors.warnBg },
  badgeOk: { backgroundColor: Colors.successLight },
  badgeText: { fontSize: 11, fontWeight: "700" },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btnRow: { flexDirection: "row", gap: 10 },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 13,
    gap: 7,
  },
  btnPrimaryText: { color: Colors.white, fontWeight: "700", fontSize: 14 },
  btnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.primaryMid,
    gap: 7,
  },
  btnOutlineText: { color: Colors.primary, fontWeight: "700", fontSize: 14 },

  // ── Form Fields ───────────────────────────────────────────────────────────
  field: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textLight,
    marginBottom: 7,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  twoCol: { flexDirection: "row" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50,
    overflow: "hidden",
  },
  inputIconBox: {
    width: 46,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "500",
  },
  currencyTag: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.6,
  },

  textarea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.textDark,
    textAlignVertical: "top",
    height: 90,
    lineHeight: 20,
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitWrap: { marginHorizontal: 16, marginTop: 4 },
  submit: { borderRadius: 18, overflow: "hidden" },
  submitGradient: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // ── Bank Modal ────────────────────────────────────────────────────────────
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(26,29,46,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "72%",
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bankRowActive: { backgroundColor: Colors.primarySoft },
  bankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  bankDotActive: { backgroundColor: Colors.primaryFade },
  bankText: { flex: 1, fontSize: 15, color: Colors.textMid, fontWeight: "500" },
  bankTextActive: { color: Colors.primary, fontWeight: "700" },
  modalCancel: {
    margin: 16,
    padding: 15,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "700", color: Colors.textMid },
});