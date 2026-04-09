import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Bell,
  Calendar,
  Car,
  CheckCircle,
  CreditCard,
  User,
  Wallet,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={["#4A56C8", "#1C2478", "#0F1460"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <User color={Colors.white} size={20} />
            </LinearGradient>
            <View style={styles.profileText}>
              <Text style={styles.greetingText}>Good Morning,</Text>
              <Text style={styles.nameText}>Rishan</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bellButton}>
            <Bell color={Colors.textDark} size={20} />
          </TouchableOpacity>
        </View>

        {/* LEASE CARD - DEFAULT DARK GRADIENT */}
        <LinearGradient
          colors={["#4A56C8", "#1C2478", "#0F1460"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.leaseCard}
        >
          <View style={styles.leaseTopRow}>
            <View style={styles.leaseBadge}>
              <Text style={styles.leaseBadgeText}>Active Lease</Text>
            </View>
            <View style={styles.carIconWrap}>
              <Car color={Colors.white} size={20} />
            </View>
          </View>

          <Text style={styles.leaseTitle}>Toyota Axio 2018</Text>

          <View style={styles.leaseValues}>
            <View style={styles.leaseValueItem}>
              <Text style={styles.leaseLabel}>TOTAL VALUE</Text>
              <Text style={styles.leaseValue}>LKR 4,500,000</Text>
            </View>
            <View style={styles.leaseDivider} />
            <View style={styles.leaseValueItem}>
              <Text style={styles.leaseLabel}>LEASE AMOUNT</Text>
              <Text style={styles.leaseValue}>LKR 3,200,000</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.leaseLabel}>Repayment Progress</Text>
              <Text style={styles.progressPercent}>65%</Text>
            </View>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: "65%" }]} />
            </View>
          </View>
        </LinearGradient>

        {/* STATS GRID WITH PROFESSIONAL GRAY COLORS */}
        <View style={styles.grid}>
          {/* Monthly Due Card */}
          <View style={[styles.statCard, styles.monthlyDueCard]}>
            <View style={styles.iconWrapper}>
              <Wallet size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statLabelDark}>MONTHLY DUE</Text>
            <Text style={styles.statValueDark}>LKR 45,000</Text>
          </View>

          {/* Balance Card */}
          <View style={[styles.statCard, styles.balanceCard]}>
            <View style={styles.iconWrapper}>
              <CreditCard size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statLabelDark}>BALANCE</Text>
            <Text style={styles.statValueDark}>LKR 1,250,000</Text>
          </View>

          {/* Period Card */}
          <View style={[styles.statCard, styles.periodCard]}>
            <View style={styles.iconWrapper}>
              <Calendar size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statLabelDark}>PERIOD</Text>
            <Text style={styles.statValueDark}>5 Years</Text>
          </View>

          {/* Next Payment Card */}
          <View style={[styles.statCard, styles.nextPayCard]}>
            <View style={styles.iconWrapper}>
              <Bell size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statLabelDark}>NEXT PAYMENT</Text>
            <Text style={styles.statValueDark}>Oct 12, 2023</Text>
            <View style={styles.daysBadgeLight}>
              <Text style={styles.daysTextLight}>In 5 days</Text>
            </View>
          </View>
        </View>

        {/* RECENT PAYMENTS */}
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Payments</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAll}>See All</Text>
            <ArrowRight size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {recentPayments.map((p, index) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.paymentRow,
              index === recentPayments.length - 1 && styles.lastPaymentRow,
            ]}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.checkCircle}>
                <CheckCircle color={Colors.success} size={20} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{p.title}</Text>
                <Text style={styles.paymentDate}>{p.date}</Text>
              </View>
            </View>
            <Text style={styles.paymentAmount}>{p.amount}</Text>
          </TouchableOpacity>
        ))}

        {/* ADDITIONAL INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Payment Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Paid</Text>
            <Text style={styles.infoValue}>LKR 90,000</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Remaining Installments</Text>
            <Text style={styles.infoValue}>24 months</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  profileText: {
    marginLeft: 12,
  },

  greetingText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: "500",
  },

  nameText: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  leaseCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  leaseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  leaseBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  leaseBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
  },

  carIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  leaseTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  leaseValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  leaseValueItem: {
    flex: 1,
  },

  leaseDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 12,
  },

  leaseLabel: {
    color: Colors.white,
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  leaseValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  progressSection: {
    marginTop: 4,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },

  progressPercent: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  statCard: {
    width: (width - 52) / 2,
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },

  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  statLabelDark: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: "center",
  },

  statValueDark: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  daysBadgeLight: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 8,
  },

  daysTextLight: {
    color: Colors.textMid,
    fontSize: 10,
    fontWeight: "600",
  },

  monthlyDueCard: {},
  balanceCard: {},
  periodCard: {},
  nextPayCard: {},

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },

  recentTitle: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "700",
  },

  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  lastPaymentRow: {
    marginBottom: 0,
  },

  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },

  paymentTitle: {
    color: Colors.textDark,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },

  paymentDate: {
    color: Colors.textLight,
    fontSize: 12,
  },

  paymentAmount: {
    color: Colors.textDark,
    fontWeight: "700",
    fontSize: 15,
  },

  infoCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 13,
    color: Colors.textMid,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
  },
});
