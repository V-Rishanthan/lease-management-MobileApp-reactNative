import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Calendar,
  Car,
  CreditCard,
  DollarSign,
  Edit2,
  Fuel,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Tag,
  Trash2,
  Wallet,
  Wrench,
  X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
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

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
};

// Category accent colours — all derived from the existing palette
const CATEGORY_META: Record<string, { bg: string; text: string; dot: string }> = {
  Fuel: { bg: `${Colors.accent}15`, text: Colors.accent, dot: Colors.accent },
  Maintenance: { bg: `${Colors.primaryFade}15`, text: Colors.primaryFade, dot: Colors.primaryFade },
  Repairs: { bg: `${Colors.homeBox2}20`, text: Colors.homeBox2, dot: Colors.homeBox2 },
  "Driver Salary": { bg: `${Colors.success}15`, text: Colors.success, dot: Colors.success },
  "Spare Parts": { bg: `${Colors.warn ?? Colors.accent}15`, text: Colors.warn ?? Colors.accent, dot: Colors.warn ?? Colors.accent },
  Insurance: { bg: `${Colors.primaryLight ?? Colors.primary}15`, text: Colors.primaryLight ?? Colors.primary, dot: Colors.primaryLight ?? Colors.primary },
  "Loan/Lease Payment": { bg: `${Colors.error}15`, text: Colors.error, dot: Colors.error },
  Transport: { bg: `${Colors.homeBox2}20`, text: Colors.homeBox2, dot: Colors.homeBox2 },
  Other: { bg: `${Colors.textLight}15`, text: Colors.textLight, dot: Colors.textLight },
};

const getCategoryMeta = (cat: string) =>
  CATEGORY_META[cat] ?? CATEGORY_META["Other"];

const getCategoryIcon = (category: string, color: string, size = 18) => {
  const props = { size, color };
  switch (category) {
    case "Fuel": return <Fuel {...props} />;
    case "Maintenance": return <Wrench {...props} />;
    case "Repairs": return <Wrench {...props} />;
    case "Driver Salary": return <CreditCard {...props} />;
    case "Spare Parts": return <ShoppingBag {...props} />;
    case "Insurance": return <Shield {...props} />;
    case "Loan/Lease Payment": return <CreditCard {...props} />;
    case "Transport": return <Car {...props} />;
    default: return <CreditCard {...props} />;
  }
};

const FILTERS = ["All", "Fuel", "Maintenance", "Repairs", "Insurance", "Transport", "Other"];

const CATEGORIES = [
  "Fuel", "Maintenance", "Repairs", "Driver Salary", "Spare Parts",
  "Insurance", "Loan/Lease Payment", "Transport", "Other",
];

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({
  item,
  onClose,
  onUpdate,
  onDelete,
}: {
  item: ExpenseItem | null;
  onClose: () => void;
  onUpdate: (id: string, name: string, category: string, price: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (item) {
      setEditName(item.title);
      setEditCategory(item.category);
      setEditPrice(item.amount.toString());
      setIsEditing(false);
    }
  }, [item]);

  if (!item) return null;

  const meta = getCategoryMeta(item.category);

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Validation", "Enter a valid positive amount.");
      return;
    }
    if (!editCategory.trim()) {
      Alert.alert("Validation", "Category cannot be empty.");
      return;
    }
    setSaving(true);
    await onUpdate(item.id, editName.trim(), editCategory, price);
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />

          {/* Hero strip */}
          <LinearGradient
            colors={[Colors.primaryFade, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dm.heroStrip}
          >
            <View style={[dm.heroIcon, { backgroundColor: meta.bg }]}>
              {getCategoryIcon(item.category, Colors.white, 22)}
            </View>
            <View style={dm.heroRight}>
              <Text style={dm.heroName} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={dm.heroSub}>
                {isEditing ? "Editing record" : item.category}
              </Text>
            </View>
            <TouchableOpacity
              style={dm.closeBtn}
              onPress={() => { setIsEditing(false); onClose(); }}
            >
              <X size={18} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={dm.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isEditing ? (
              /* ── Edit Form ── */
              <View style={dm.editForm}>
                <Text style={dm.editSectionTitle}>Edit Details</Text>

                <View style={dm.fieldGroup}>
                  <Text style={dm.label}>Expense Name</Text>
                  <TextInput
                    style={dm.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter name"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={dm.fieldGroup}>
                  <Text style={dm.label}>Price (LKR)</Text>
                  <TextInput
                    style={dm.input}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={dm.fieldGroup}>
                  <Text style={dm.label}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                    {CATEGORIES.map((cat) => {
                      const active = editCategory === cat;
                      return (
                        <TouchableOpacity key={cat} onPress={() => setEditCategory(cat)}>
                          {active ? (
                            <LinearGradient
                              colors={["#4A56C8", "#1C2478"]}
                              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                              style={dm.catChipActive}
                            >
                              <Text style={dm.catChipTextActive}>{cat}</Text>
                            </LinearGradient>
                          ) : (
                            <View style={dm.catChip}>
                              <Text style={dm.catChipText}>{cat}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={dm.actionRow}>
                  <TouchableOpacity style={dm.cancelBtn} onPress={() => setIsEditing(false)}>
                    <Text style={dm.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[dm.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={dm.saveBtnText}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ── View Mode ── */
              <>
                {/* Amount card */}
                <View style={dm.infoCard}>
                  <View style={dm.infoRow}>
                    <View style={[dm.infoIconBox, { backgroundColor: `${Colors.success}15` }]}>
                      <DollarSign size={16} color={Colors.success} />
                    </View>
                    <View>
                      <Text style={dm.infoLabel}>Amount</Text>
                      <Text style={dm.infoVal}>LKR {item.amount.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>

                {/* Category card */}
                <View style={dm.infoCard}>
                  <View style={dm.infoRow}>
                    <View style={[dm.infoIconBox, { backgroundColor: meta.bg }]}>
                      <Tag size={16} color={meta.dot} />
                    </View>
                    <View>
                      <Text style={dm.infoLabel}>Category</Text>
                      <Text style={dm.infoVal}>{item.category}</Text>
                    </View>
                  </View>
                </View>

                {/* Date card */}
                <View style={dm.infoCard}>
                  <View style={dm.infoRow}>
                    <View style={[dm.infoIconBox, { backgroundColor: `${Colors.accent}15` }]}>
                      <Calendar size={16} color={Colors.accent} />
                    </View>
                    <View>
                      <Text style={dm.infoLabel}>Date</Text>
                      <Text style={dm.infoVal}>{formatDate(item.date)}</Text>
                    </View>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={dm.actionRow}>
                  <TouchableOpacity style={dm.editBtn} onPress={() => setIsEditing(true)}>
                    <Text style={dm.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={dm.deleteBtn}
                    onPress={() => {
                      Alert.alert(
                        "Delete Expense",
                        `Remove "${item.title}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              onClose();
                              await onDelete(item.id);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={dm.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Detail Modal Styles ───────────────────────────────────────────────────────
const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "85%", overflow: "hidden",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: "center", marginTop: 10, marginBottom: 6,
  },
  heroStrip: {
    flexDirection: "row", alignItems: "center", padding: 18, gap: 14,
  },
  heroIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  heroRight: { flex: 1 },
  heroName: { color: Colors.white, fontSize: 18, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  body: { padding: 18, paddingBottom: 40 },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  infoLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600", marginBottom: 2 },
  infoVal: { fontSize: 15, color: Colors.textDark, fontWeight: "700" },
  editForm: { gap: 14 },
  editSectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textDark, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: "600", color: Colors.textDark,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  catChipText: { fontSize: 12, fontWeight: "600", color: Colors.textMid },
  catChipTextActive: { fontSize: 12, fontWeight: "600", color: Colors.white },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  editBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: `${Colors.primary}12`, alignItems: "center",
  },
  editBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
  deleteBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.errorLight, alignItems: "center",
  },
  deleteBtnText: { color: Colors.error, fontWeight: "700", fontSize: 15 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.borderLight, alignItems: "center",
  },
  cancelBtnText: { color: Colors.textMid, fontWeight: "700", fontSize: 15 },
  saveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: "center",
  },
  saveBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
});

// ─────────────────────────────────────────────────────────────────────────────
const Expenses = () => {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [expensesData, setExpensesData] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ExpenseItem | null>(null);
  const router = useRouter();

  // ── Fetch expenses from Supabase ─────────────────────────────────────────
  const fetchExpenses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vehicleData } = await supabase
        .from("vehicle_info")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (vehicleData) {
        const { data, error } = await supabase
          .from("expense")
          .select("*")
          .eq("vehicle_info_id", vehicleData.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Fetch expense error:", error);
          return;
        }

        if (data) {
          const formatted: ExpenseItem[] = data.map((item: any) => ({
            id: item.id,
            title: item.expense_name || "Unknown",
            amount: item.price || 0,
            date: item.date || new Date().toISOString(),
            category: item.category || "Other",
          }));
          setExpensesData(formatted);
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  // ── Update expense ──────────────────────────────────────────────────────
  const handleUpdate = async (id: string, name: string, category: string, price: number) => {
    try {
      const { data, error } = await supabase
        .from("expense")
        .update({ expense_name: name, category, price })
        .eq("id", id)
        .select();

      if (error) {
        Alert.alert("Update Error", error.message);
        return;
      }
      if (!data || data.length === 0) {
        Alert.alert("Warning", "No records were updated.");
        return;
      }
      // Refresh list & modal
      setExpensesData((prev) =>
        prev.map((e) => (e.id === id ? { ...e, title: name, category, amount: price } : e))
      );
      setSelected((prev) =>
        prev?.id === id ? { ...prev, title: name, category, amount: price } : prev
      );
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
    }
  };

  // ── Delete expense ───────────────────────────────────────────────────────
  const handleDelete = (item: ExpenseItem) =>
    Alert.alert("Delete Expense", `Remove "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("expense")
              .delete()
              .eq("id", item.id);

            if (error) {
              Alert.alert("Error", error.message || "Failed to delete expense.");
              return;
            }
            setExpensesData((prev) => prev.filter((e) => e.id !== item.id));
          } catch (e: any) {
            Alert.alert("Error", e.message ?? "Something went wrong.");
          }
        },
      },
    ]);

  const filtered = useMemo(() => {
    let d = expensesData.filter((e) =>
      e.title.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (selectedFilter !== "All") d = d.filter((e) => e.category === selectedFilter);
    return d;
  }, [query, selectedFilter, expensesData]);

  const total = expensesData.reduce((s, i) => s + i.amount, 0);
  const highest = expensesData.length > 0 ? Math.max(...expensesData.map((e) => e.amount)) : 0;
  const avgVal = expensesData.length > 0 ? Math.round(total / expensesData.length) : 0;

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

  // ── Expense Row ────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ExpenseItem }) => {
    const meta = getCategoryMeta(item.category);
    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableLeftOpen={() => setSelected(item)}
        onSwipeableRightOpen={() => handleDelete(item)}
      >
        <TouchableOpacity
          style={s.row}
          activeOpacity={0.75}
          onPress={() => setSelected(item)}
        >
          {/* Left accent bar */}
          <View style={[s.rowAccent, { backgroundColor: meta.dot }]} />

          {/* Icon */}
          <View style={[s.rowIcon, { backgroundColor: meta.bg }]}>
            {getCategoryIcon(item.category, meta.dot)}
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
            <Text style={s.heroEyebrow}>Expense Tracker</Text>
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
  if (isLoading) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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

      {/* ── Detail Modal ── */}
      <DetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
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