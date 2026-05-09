import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Settings2,
  Sparkles,
  TrendingDown,
  User,
  X,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { useDispatch, useSelector } from "react-redux";
import Colors from "../../constants/Colors";
import { AppDispatch, RootState } from "../../store";
import { fetchVehicleInfo, updateVehicleInfo } from "../../store/vehicleSlice";

const { width } = Dimensions.get("window");

const recentPayments = [
  {
    id: 1,
    title: "September Installment",
    date: "10 Sep 2023",
    amount: 45000,
    status: "Paid",
  },
  {
    id: 2,
    title: "August Installment",
    date: "12 Aug 2023",
    amount: 45000,
    status: "Paid",
  },
];

const fmt = (val = 0) => `LKR ${val.toLocaleString()}`;
const fmtCompact = (val = 0) =>
  val >= 1_000_000
    ? `${(val / 1_000_000).toFixed(1)}M`
    : val >= 1_000
      ? `${(val / 1_000).toFixed(0)}K`
      : `${val}`;

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const { vehicleInfo, loading } = useSelector(
    (state: RootState) => state.vehicle
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Form state for the modal
  const [formData, setFormData] = useState({
    vehicleName: "",
    totalValue: "",
    leaseAmount: "",
    balanceAmount: "",
    monthlyDue: "",
    totalYears: "",
  });

  useEffect(() => {
    dispatch(fetchVehicleInfo());
  }, [dispatch]);

  useEffect(() => {
    if (vehicleInfo) {
      setFormData({
        vehicleName: vehicleInfo.vehicle_name || "",
        totalValue: vehicleInfo.total_value?.toString() || "",
        leaseAmount: vehicleInfo.lease_amount?.toString() || "",
        balanceAmount: vehicleInfo.balance_amount?.toString() || "",
        monthlyDue: vehicleInfo.monthly_due?.toString() || "",
        totalYears: vehicleInfo.total_years?.toString() || "",
      });
    }
  }, [vehicleInfo]);

  const totalPaid =
    (vehicleInfo?.lease_amount || 0) - (vehicleInfo?.balance_amount || 0);
  const pct = vehicleInfo?.lease_amount
    ? Math.min((totalPaid / vehicleInfo.lease_amount) * 100, 100)
    : 0;

  const handleSaveInfo = () => {
    const payload = {
      vehicle_name: formData.vehicleName,
      total_value: Number(formData.totalValue),
      lease_amount: Number(formData.leaseAmount),
      balance_amount: Number(formData.balanceAmount),
      monthly_due: Number(formData.monthlyDue),
      total_years: Number(formData.totalYears),
    };
    dispatch(updateVehicleInfo(payload))
      .unwrap()
      .then(() => {
        Alert.alert("Success", "Vehicle information updated successfully");
        setModalVisible(false);
        // Refresh vehicle info from backend to ensure UI reflects latest data
        dispatch(fetchVehicleInfo());
      })
      .catch((e) => {
        Alert.alert("Error", e?.toString() ?? "Failed to update vehicle info");
      });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[s.safe, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── NAV ── */}
        <View style={s.nav}>
          <View style={s.navLeft}>
            <LinearGradient
              colors={[Colors.primaryFade, Colors.primary]}
              style={s.avatar}
            >
              <User color={Colors.white} size={16} strokeWidth={2.5} />
            </LinearGradient>
            <View>
              <Text style={s.greet}>Good Morning</Text>
              <Text style={s.name}>Rishan</Text>
            </View>
          </View>
          <View style={s.navRight}>
            <TouchableOpacity style={s.navBtn}>
              <Bell color={Colors.textMid} size={17} strokeWidth={2} />
              <View style={s.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => router.push("/setting")}
            >
              <Settings2 color={Colors.textMid} size={17} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── HERO GRADIENT CARD ── */}
        <LinearGradient
          colors={["#1C2478", "#2B3598", "#4A56C8", "#55C8F0"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={s.heroCard}
        >
          {/* Decorative rings */}
          <View style={s.ring1} />
          <View style={s.ring2} />
          <View style={s.ring3} />

          {/* Badges */}
          <View style={s.heroBadges}>
            <View style={s.badgeActive}>
              <View style={s.pulse} />
              <Text style={s.badgeActiveText}>Active Lease</Text>
            </View>
            <View style={s.badgeTrack}>
              <Sparkles size={10} color="rgba(255,255,255,0.72)" />
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={s.badgeTrackText}>Manage info</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle name */}
          <Text style={s.heroVehicle} numberOfLines={1}>
            {vehicleInfo?.vehicle_name || "No Vehicle Added"}
          </Text>

          {/* Balance section */}
          <View style={s.balanceBlock}>
            <Text style={s.balanceLbl}>Outstanding Balance</Text>
            <Text style={s.balanceVal} numberOfLines={1}>
              {fmt(vehicleInfo?.balance_amount)}
            </Text>
          </View>

          {/* Three stats */}
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatLbl}>TOTAL VALUE</Text>
              <Text style={s.heroStatVal}>{fmt(vehicleInfo?.total_value)}</Text>
            </View>
            <View style={s.heroStatSep} />
            <View style={s.heroStat}>
              <Text style={s.heroStatLbl}>LEASE</Text>
              <Text style={s.heroStatVal}>
                {fmt(vehicleInfo?.lease_amount)}
              </Text>
            </View>
            <View style={s.heroStatSep} />
            <View style={s.heroStat}>
              <Text style={s.heroStatLbl}>PAID</Text>
              <Text style={s.heroStatVal}>{fmt(totalPaid)}</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={s.progWrap}>
            <View style={s.progLabelRow}>
              <Text style={s.progLabel}>Repayment Progress</Text>
              <Text style={s.progPct}>{Math.round(pct)}%</Text>
            </View>
            <View style={s.progTrack}>
              <LinearGradient
                colors={["rgba(255,255,255,0.55)", "#fff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.progFill, { width: `${pct}%` }]}
              />
            </View>
            <View style={s.progFooter}>
              <Text style={s.progFootText}>{fmt(totalPaid)} paid</Text>
              <Text style={s.progFootText}>
                {fmt(vehicleInfo?.balance_amount)} left
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── FLOATING MONTHLY DUE CHIP ── */}
        <View style={s.dueChip}>
          <View>
            <Text style={s.dueChipLabel}>MONTHLY DUE</Text>
            <Text style={s.dueChipVal}>{fmt(vehicleInfo?.monthly_due)}</Text>
          </View>
          <View style={s.dueChipBadge}>
            <Text style={s.dueChipBadgeText}>Oct 12</Text>
          </View>
        </View>

        {/* ── ALERT STRIP ── */}
        <TouchableOpacity style={s.alertStrip} activeOpacity={0.8}>
          <View style={s.alertIcon}>
            <Zap size={14} color={Colors.primary} strokeWidth={2} />
          </View>
          <View style={s.alertBody}>
            <Text style={s.alertLbl}>Next payment due</Text>
            <Text style={s.alertDate}>October 12, 2023</Text>
          </View>
          <View style={s.alertPill}>
            <Text style={s.alertPillText}>5 days</Text>
          </View>
          <ChevronRight size={14} color={Colors.textLight} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* ── STATS GRID ── */}
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <View style={s.statCardIcon}>
              <Image
                source={require("../../assets/png-icons/money.png")}
                style={s.statCardImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.statCardLbl}>BALANCE</Text>
            <Text style={s.statCardVal}>
              {fmtCompact(vehicleInfo?.balance_amount)}
            </Text>
            <Text style={s.statCardUnit}>LKR</Text>
          </View>

          <View style={s.statCard}>
            <View style={s.statCardIcon}>
              <Image
                source={require("../../assets/png-icons/calendar.png")}
                style={s.statCardImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.statCardLbl}>LEASE PERIOD</Text>
            <Text style={s.statCardVal}>{vehicleInfo?.total_years || "0"}</Text>
            <Text style={s.statCardUnit}>Years</Text>
          </View>

          <View style={s.statCard}>
            <View style={s.statCardIcon}>
              <Image
                source={require("../../assets/png-icons/graph.png")}
                style={s.statCardImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.statCardLbl}>MONTHS LEFT</Text>
            <Text style={s.statCardVal}>24</Text>
            <Text style={s.statCardUnit}>Months</Text>
          </View>

          <View style={[s.statCard, s.statCardSuccess]}>
            <View style={s.statCardIcon}>
              <Image
                source={require("../../assets/png-icons/check-mark.png")}
                style={s.statCardImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.statCardLbl}>ON-TIME RATE</Text>
            <Text style={[s.statCardVal, { color: Colors.success }]}>100</Text>
            <Text style={s.statCardUnit}>%</Text>
          </View>
        </View>

        {/* ── SUMMARY BAND ── */}
        <View style={s.summaryBand}>
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>LKR 90K</Text>
            <Text style={s.summaryLbl}>Total Paid</Text>
          </View>
          <View style={s.summarySep} />
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>24</Text>
            <Text style={s.summaryLbl}>Months Left</Text>
          </View>
          <View style={s.summarySep} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryVal, { color: Colors.success }]}>100%</Text>
            <Text style={s.summaryLbl}>On-Time</Text>
          </View>
        </View>

        {/* ── RECENT PAYMENTS ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity style={s.seeAllBtn}>
            <Text style={s.seeAllText}>See All</Text>
            <ArrowUpRight size={13} color={Colors.primaryFade} />
          </TouchableOpacity>
        </View>

        <View style={s.paymentsCard}>
          {recentPayments.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[
                s.payRow,
                i < recentPayments.length - 1 && s.payRowBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={s.payIcon}>
                <CheckCircle2
                  size={18}
                  color={Colors.success}
                  strokeWidth={2.5}
                />
              </View>
              <View style={s.payInfo}>
                <Text style={s.payTitle}>{p.title}</Text>
                <Text style={s.payDate}>{p.date}</Text>
              </View>
              <View style={s.payRight}>
                <Text style={s.payAmount}>LKR {p.amount.toLocaleString()}</Text>
                <View style={s.payPill}>
                  <Text style={s.payPillText}>Paid</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── INSIGHT CARD ── */}
        <TouchableOpacity style={s.insightCard} activeOpacity={0.85}>
          <View style={s.insightIcon}>
            <TrendingDown size={16} color={Colors.primary} strokeWidth={2} />
          </View>
          <View style={s.insightBody}>
            <Text style={s.insightTitle}>Reduce your tenure</Text>
            <Text style={s.insightSub}>
              Pay LKR 5,000 extra monthly to save 4 months
            </Text>
          </View>
          <View style={s.insightArrow}>
            <ChevronRight size={14} color={Colors.primary} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ── MANAGE INFO MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.modalOverlay}
        >
          <View style={s.modalContainer}>
            <View style={s.modalContent}>
              {/* Modal Header */}
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Manage Vehicle Info</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={s.modalCloseBtn}
                >
                  <X size={20} color={Colors.textDark} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={s.modalScroll}
              >
                {/* Vehicle Name Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Vehicle Name</Text>
                  <TextInput
                    style={s.input}
                    value={formData.vehicleName}
                    onChangeText={(text) => handleInputChange("vehicleName", text)}
                    placeholder="e.g., Toyota Prius 2023"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                {/* Total Value Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Total Value (LKR)</Text>
                  <TextInput
                    style={s.input}
                    value={formData.totalValue}
                    onChangeText={(text) => handleInputChange("totalValue", text)}
                    placeholder="e.g., 5000000"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>

                {/* Lease Amount Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Lease Amount (LKR)</Text>
                  <TextInput
                    style={s.input}
                    value={formData.leaseAmount}
                    onChangeText={(text) => handleInputChange("leaseAmount", text)}
                    placeholder="e.g., 450000"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>

                {/* Balance Amount Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Balance Amount (LKR)</Text>
                  <TextInput
                    style={s.input}
                    value={formData.balanceAmount}
                    onChangeText={(text) => handleInputChange("balanceAmount", text)}
                    placeholder="e.g., 250000"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>

                {/* Monthly Due Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Monthly Due (LKR)</Text>
                  <TextInput
                    style={s.input}
                    value={formData.monthlyDue}
                    onChangeText={(text) => handleInputChange("monthlyDue", text)}
                    placeholder="e.g., 45000"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>

                {/* Total Years Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Total Years</Text>
                  <TextInput
                    style={s.input}
                    value={formData.totalYears}
                    onChangeText={(text) => handleInputChange("totalYears", text)}
                    placeholder="e.g., 5"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>

                {/* Action Buttons */}
                <View style={s.modalActions}>
                  <TouchableOpacity
                    style={s.cancelBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.saveBtn}
                    onPress={handleSaveInfo}
                  >
                    <Text style={s.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 56 },

  // NAV
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  greet: { fontSize: 10, color: Colors.textLight, fontWeight: "500" },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.4,
  },
  navRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },

  // HERO
  heroCard: {
    borderRadius: 26,
    padding: 20,
    marginBottom: 12,
    overflow: "hidden",
  },
  ring1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    top: -80,
    right: -60,
  },
  ring2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    bottom: -35,
    left: 15,
  },
  ring3: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(85,200,240,0.12)",
    top: 45,
    right: 95,
  },
  heroBadges: { flexDirection: "row", gap: 7, marginBottom: 16 },
  badgeActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pulse: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  badgeActiveText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  badgeTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTrackText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "600",
  },
  heroVehicle: {
    color: Colors.white,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  balanceBlock: { marginBottom: 18 },
  balanceLbl: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  balanceVal: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  heroStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 12,
    marginBottom: 16,
  },
  heroStat: { flex: 1, gap: 3 },
  heroStatSep: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 12,
  },
  heroStatLbl: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  heroStatVal: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  progWrap: {},
  progLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  progLabel: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 9,
    fontWeight: "600",
  },
  progPct: { color: Colors.white, fontSize: 10, fontWeight: "800" },
  progTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 5,
  },
  progFill: { height: "100%", borderRadius: 3 },
  progFooter: { flexDirection: "row", justifyContent: "space-between" },
  progFootText: {
    color: "rgba(255,255,255,0.32)",
    fontSize: 9,
    fontWeight: "500",
  },

  // DUE CHIP
  dueChip: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 13,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 4,
  },
  dueChipLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  dueChipVal: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.4,
  },
  dueChipBadge: {
    backgroundColor: "#FFF3E0",
    borderWidth: 1,
    borderColor: "#FFD580",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  dueChipBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C96A00",
  },

  // ALERT
  alertStrip: {
    borderRadius: 14,
    padding: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBody: { flex: 1 },
  alertLbl: {
    fontSize: 9,
    color: Colors.textLight,
    fontWeight: "600",
    marginBottom: 1,
  },
  alertDate: { fontSize: 12, color: Colors.textDark, fontWeight: "800" },
  alertPill: {
    backgroundColor: "#FFF3E0",
    borderWidth: 1,
    borderColor: "#FFD580",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  alertPillText: { fontSize: 10, fontWeight: "800", color: "#C96A00" },

  // STATS GRID
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    width: (width - 36 - 10) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  statCardSuccess: {},
  statCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statCardImg: {
    width: 18,
    height: 18,
  },
  statCardLbl: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statCardVal: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  statCardUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textLight,
    marginTop: 2,
  },

  // SUMMARY
  summaryBand: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryVal: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 2,
  },
  summaryLbl: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  summarySep: { width: 1, height: 26, backgroundColor: Colors.border },

  // SECTION
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  seeAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryFade,
  },

  // PAYMENTS
  paymentsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    paddingHorizontal: 14,
    gap: 11,
  },
  payRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  payIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },
  payInfo: { flex: 1, gap: 2 },
  payTitle: { fontSize: 13, fontWeight: "700", color: Colors.textDark },
  payDate: { fontSize: 10, color: Colors.textLight },
  payRight: { alignItems: "flex-end", gap: 3 },
  payAmount: { fontSize: 13, fontWeight: "800", color: Colors.textDark },
  payPill: {
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  payPillText: { fontSize: 9, fontWeight: "700", color: Colors.success },

  // INSIGHT
  insightCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
  },
  insightBody: { flex: 1, gap: 2 },
  insightTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  insightSub: {
    fontSize: 10,
    color: Colors.textMid,
    lineHeight: 15,
  },
  insightArrow: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalContent: {
    padding: 20,
  },
  modalScroll: {
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMid,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textMid,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});