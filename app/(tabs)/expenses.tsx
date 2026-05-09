import Colors from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Calendar,
  Car,
  Coffee,
  CreditCard,
  Edit2,
  Home,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Wallet
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const expensesData = [
  { id: "1", title: "Groceries", amount: 4500, date: "2026-03-01", category: "Food", icon: "ShoppingBag" },
  { id: "2", title: "Utilities", amount: 12000, date: "2026-03-03", category: "Bills", icon: "Home" },
  { id: "3", title: "Rent", amount: 75000, date: "2026-03-05", category: "Housing", icon: "Home" },
  { id: "4", title: "Transport", amount: 3000, date: "2026-03-07", category: "Travel", icon: "Car" },
  { id: "5", title: "Coffee", amount: 1500, date: "2026-03-10", category: "Food", icon: "Coffee" },
];

// Category accent colours — all derived from the existing palette
const CATEGORY_META: Record<string, { bg: string; text: string; dot: string }> = {
  Food: { bg: `${Colors.success}15`, text: Colors.success, dot: Colors.success },
  Bills: { bg: `${Colors.accent}15`, text: Colors.accent, dot: Colors.accent },
  Housing: { bg: `${Colors.primaryFade}15`, text: Colors.primaryFade, dot: Colors.primaryFade },
  Travel: { bg: `${Colors.homeBox2}20`, text: Colors.homeBox2, dot: Colors.homeBox2 },
  Other: { bg: `${Colors.textLight}15`, text: Colors.textLight, dot: Colors.textLight },
};

const getCategoryMeta = (cat: string) =>
  CATEGORY_META[cat] ?? CATEGORY_META["Other"];

const getCategoryIcon = (iconName: string, color: string, size = 18) => {
  const props = { size, color };
  switch (iconName) {
    case "ShoppingBag": return <ShoppingBag {...props} />;
    case "Home": return <Home {...props} />;
    case "Car": return <Car {...props} />;
    case "Coffee": return <Coffee {...props} />;
    default: return <CreditCard {...props} />;
  }
};

const FILTERS = ["All", "Food", "Bills", "Housing", "Travel", "Other"];

// ─────────────────────────────────────────────────────────────────────────────
const Expenses = () => {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const router = useRouter();

  const filtered = useMemo(() => {
    let d = expensesData.filter((e) =>
      e.title.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (selectedFilter !== "All") d = d.filter((e) => e.category === selectedFilter);
    return d;
  }, [query, selectedFilter]);

  const total = expensesData.reduce((s, i) => s + i.amount, 0);
  const highest = Math.max(...expensesData.map((e) => e.amount));
  const avgVal = Math.round(total / expensesData.length);

  const formatDate = (ds: string) => {
    const d = new Date(ds);
    const today = new Date();
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Swipe actions
  const renderLeftActions = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={s.swipeLeft}
    >
      <Edit2 size={18} color={Colors.white} />
      <Text style={s.swipeText}>Edit</Text>
    </LinearGradient>
  );

  const renderRightActions = () => (
    <LinearGradient
      colors={[Colors.error, "#c62828"]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={s.swipeRight}
    >
      <Trash2 size={18} color={Colors.white} />
      <Text style={s.swipeText}>Delete</Text>
    </LinearGradient>
  );

  const handleDelete = (item: (typeof expensesData)[0]) =>
    Alert.alert("Delete Expense", `Remove "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => console.log("delete", item.id) },
    ]);

  // ── Expense Row ────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: (typeof expensesData)[0] }) => {
    const meta = getCategoryMeta(item.category);
    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableRightOpen={() => handleDelete(item)}
      >
        <TouchableOpacity style={s.row} activeOpacity={0.75}>
          {/* Left accent bar */}
          <View style={[s.rowAccent, { backgroundColor: meta.dot }]} />

          {/* Icon */}
          <View style={[s.rowIcon, { backgroundColor: meta.bg }]}>
            {getCategoryIcon(item.icon, meta.dot)}
          </View>

          {/* Content */}
          <View style={s.rowContent}>
            <Text style={s.rowTitle}>{item.title}</Text>
            <View style={s.rowMeta}>
              <Calendar size={11} color={Colors.textMuted} />
              <Text style={s.rowDate}>{formatDate(item.date)}</Text>
              <View style={[s.catPill, { backgroundColor: meta.bg }]}>
                <Text style={[s.catPillText, { color: meta.text }]}>{item.category}</Text>
              </View>
            </View>
          </View>

          {/* Amount */}
          <View style={s.rowRight}>
            <Text style={s.rowAmount}>LKR</Text>
            <Text style={s.rowAmountVal}>{item.amount.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // ── List Header ────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <>
      {/* ── Hero Banner ── */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryFade]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        {/* Decorative shapes */}
        <View style={s.dec1} />
        <View style={s.dec2} />

        <View style={s.heroTop}>
          <View>
            <Text style={s.heroEyebrow}>March 2026</Text>
            <Text style={s.heroTitle}>My Expenses</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => router.push("/addExpenses")}>
            <Plus size={20} color={Colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Floating Summary Card (overlaps hero) ── */}
      <View style={s.summaryCard}>
        {/* Total */}
        <View style={s.summaryMain}>
          <View style={[s.summaryIconBox, { backgroundColor: `${Colors.walletIcon}15` }]}>
            <Wallet size={20} color={Colors.walletIcon} />
          </View>
          <View>
            <Text style={s.summaryLabel}>Total Spent</Text>
            <Text style={s.summaryValue}>LKR {total.toLocaleString()}</Text>
          </View>
          <View style={s.trendPill}>
            <TrendingUp size={11} color={Colors.success} />
            <Text style={[s.trendText, { color: Colors.success }]}>+12%</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Sub stats */}
        <View style={s.subStats}>
          <View style={s.subStat}>
            <Text style={s.subStatLabel}>Average</Text>
            <Text style={s.subStatVal}>LKR {avgVal.toLocaleString()}</Text>
          </View>
          <View style={s.subStatSep} />
          <View style={s.subStat}>
            <Text style={s.subStatLabel}>Highest</Text>
            <Text style={s.subStatVal}>LKR {highest.toLocaleString()}</Text>
          </View>
          <View style={s.subStatSep} />
          <View style={s.subStat}>
            <Text style={s.subStatLabel}>Count</Text>
            <Text style={s.subStatVal}>{expensesData.length} items</Text>
          </View>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={s.searchBox}>
        <Search size={16} color={Colors.textLight} />
        <TextInput
          style={s.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* ── Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtersWrap}
        style={{ marginBottom: 20 }}
      >
        {FILTERS.map((f) => {
          const active = selectedFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[s.chip, active && s.chipActive]}
              onPress={() => setSelectedFilter(f)}
            >
              {active && <View style={s.chipDot} />}
              <Text style={[s.chipText, active && s.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Section Header ── */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Recent Transactions</Text>
        <Text style={s.sectionCount}>{filtered.length} results</Text>
      </View>
    </>
  );

  // ── Empty State ────────────────────────────────────────────────────────────
  const ListEmpty = () => (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Search size={36} color={Colors.textLight} />
      </View>
      <Text style={s.emptyTitle}>Nothing here</Text>
      <Text style={s.emptySub}>Try a different search or filter, or add a new expense.</Text>
      <TouchableOpacity style={s.emptyBtn} onPress={() => router.push("/addExpenses")}>
        <Text style={s.emptyBtnText}>+ Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={s.root}>
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default Expenses;

// ── Styles ────────────────────────────────────────────────────────────────────
const HERO_H = 160;
const CARD_OVERLAP = 40;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 48 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    height: HERO_H,
    paddingTop: 52,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  dec1: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)", top: -80, right: -60,
  },
  dec2: {
    position: "absolute", width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -50, left: 40,
  },
  heroTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  heroEyebrow: { fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: "600", letterSpacing: 1, marginBottom: 4 },
  heroTitle: { fontSize: 28, fontWeight: "800", color: Colors.white, letterSpacing: -0.5 },

  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 6,
  },

  // ── Summary Card ──────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 18,
    marginTop: -CARD_OVERLAP,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  summaryMain: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16,
  },
  summaryIconBox: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  summaryLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  summaryValue: { fontSize: 22, fontWeight: "800", color: Colors.textDark, letterSpacing: -0.5 },
  trendPill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    marginLeft: "auto",
    backgroundColor: `${Colors.success}15`,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  trendText: { fontSize: 11, fontWeight: "700" },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: 14 },

  subStats: { flexDirection: "row", alignItems: "center" },
  subStat: { flex: 1, alignItems: "center" },
  subStatLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 3, fontWeight: "500" },
  subStatVal: { fontSize: 13, color: Colors.textDark, fontWeight: "700" },
  subStatSep: { width: 1, height: 28, backgroundColor: Colors.borderLight },

  // ── Search ────────────────────────────────────────────────────────────────
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface,
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark, fontWeight: "500" },

  // ── Filters ───────────────────────────────────────────────────────────────
  filtersWrap: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white },
  chipText: { fontSize: 13, color: Colors.textMid, fontWeight: "600" },
  chipTextActive: { color: Colors.white },

  // ── Section row ───────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textDark },
  sectionCount: { fontSize: 12, color: Colors.textLight, fontWeight: "500" },

  // ── Expense Row ───────────────────────────────────────────────────────────
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 16, overflow: "hidden",
    shadowColor: Colors.black,
    shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
    elevation: 2,
  },
  rowAccent: { width: 4, alignSelf: "stretch" },
  rowIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    marginLeft: 12, marginVertical: 14,
  },
  rowContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 14 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: Colors.textDark, marginBottom: 6 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  rowDate: { fontSize: 11, color: Colors.textMuted, fontWeight: "500" },

  catPill: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  catPillText: { fontSize: 10, fontWeight: "700" },

  rowRight: { paddingRight: 16, alignItems: "flex-end" },
  rowAmount: { fontSize: 10, color: Colors.textLight, fontWeight: "600", letterSpacing: 0.3 },
  rowAmountVal: { fontSize: 16, fontWeight: "800", color: Colors.primary },

  // ── Swipe ─────────────────────────────────────────────────────────────────
  swipeLeft: {
    justifyContent: "center", alignItems: "center",
    width: 72, borderRadius: 16, marginLeft: 16, marginBottom: 8, gap: 4,
  },
  swipeRight: {
    justifyContent: "center", alignItems: "center",
    width: 72, borderRadius: 16, marginRight: 16, marginBottom: 8, gap: 4,
  },
  swipeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },

  // ── Empty ─────────────────────────────────────────────────────────────────
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${Colors.textLight}12`,
    alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textMid, marginBottom: 8 },
  emptySub: { fontSize: 13, color: Colors.textLight, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25,
  },
  emptyBtnText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
});