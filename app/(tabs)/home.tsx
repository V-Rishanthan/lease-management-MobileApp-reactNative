import { Bell, CheckCircle, CreditCard, User } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

const { width } = Dimensions.get("window");

const recentPayments = [
  {
    id: 1,
    title: "September Installment",
    date: "10 Sep, 2023",
    amount: "LKR 45,000",
  },
  {
    id: 2,
    title: "August Installment",
    date: "12 Aug, 2023",
    amount: "LKR 45,000",
  },
];

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User color={Colors.white} size={18} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.smallText}>Good Morning,</Text>
              <Text style={styles.nameText}>Rishan</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bellButton}>
            <Bell color={Colors.textMid} size={20} />
          </TouchableOpacity>
        </View>

        {/* LEASE CARD */}
        <View style={styles.leaseCard}>
          <View style={styles.leaseTopRow}>
            <Text style={styles.leaseSmall}>Active Lease</Text>
            <CreditCard color={Colors.white} size={18} />
          </View>

          <Text style={styles.leaseTitle}>Toyota Axio 2018</Text>

          <View style={styles.leaseValues}>
            <View>
              <Text style={styles.leaseLabel}>TOTAL VALUE</Text>
              <Text style={styles.leaseValue}>LKR 4,500,000</Text>
            </View>
            <View>
              <Text style={styles.leaseLabel}>LEASE AMOUNT</Text>
              <Text style={styles.leaseValue}>LKR 3,200,000</Text>
            </View>
          </View>

          <Text style={styles.leaseLabel}>Repayment Progress</Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: "65%" }]} />
          </View>
          <Text style={styles.progressPercent}>65%</Text>
        </View>

        {/* STATS GRID */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statSmall}>MONTHLY DUE</Text>
            <Text style={styles.statBig}>LKR 45,000</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statSmall}>BALANCE</Text>
            <Text style={styles.statBig}>LKR 1,250,000</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statSmall}>PERIOD</Text>
            <Text style={styles.statBig}>5 Years</Text>
          </View>

          <View style={[styles.statCard, styles.nextPayCard]}>
            <Text style={styles.statSmallLight}>NEXT PAY</Text>
            <Text style={styles.statBigLight}>Oct 12</Text>
          </View>
        </View>

        {/* RECENT PAYMENTS */}
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Payments</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentPayments.map((p) => (
          <View key={p.id} style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <View style={styles.checkCircle}>
                <CheckCircle color={Colors.success} size={18} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.paymentTitle}>{p.title}</Text>
                <Text style={styles.paymentDate}>{p.date}</Text>
              </View>
            </View>
            <Text style={styles.paymentAmount}>{p.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  content: { padding: 16, paddingBottom: 40, marginTop: 30 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  profileRow: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryFade,
    alignItems: "center",
    justifyContent: "center",
  },

  smallText: { color: Colors.textMid, fontSize: 12 },

  nameText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: "700",
  },

  bellButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },

  leaseCard: {
    backgroundColor: Colors.primaryFade,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  leaseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leaseSmall: { color: Colors.white, fontSize: 12 },

  leaseTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 8,
  },

  leaseValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  leaseLabel: { color: Colors.white, fontSize: 10 },

  leaseValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },

  progressFill: {
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
  },

  progressPercent: {
    color: Colors.white,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.surface,
    padding: 25,
    borderRadius: 12,
    marginBottom: 12,
  },

  statSmall: { color: Colors.textMuted, fontSize: 11 },

  statBig: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: "700",
  },

  statSmallLight: { color: Colors.white, fontSize: 11 },

  statBigLight: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  nextPayCard: { backgroundColor: Colors.primary },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },

  recentTitle: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: "700",
  },

  seeAll: { color: Colors.primary },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  paymentLeft: { flexDirection: "row", alignItems: "center" },

  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentTitle: { color: Colors.textDark, fontWeight: "700" },

  paymentDate: { color: Colors.textMuted, fontSize: 12 },

  paymentAmount: { color: Colors.textDark, fontWeight: "700" },
});
