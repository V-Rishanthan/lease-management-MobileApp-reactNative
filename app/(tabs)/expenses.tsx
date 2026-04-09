import Colors from "@/constants/Colors";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Filter,
  Search,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const expensesData = [
  { id: "1", title: "Groceries", amount: 4500, date: "2026-03-01" },
  { id: "2", title: "Utilities", amount: 12000, date: "2026-03-03" },
  { id: "3", title: "Rent", amount: 75000, date: "2026-03-05" },
  { id: "4", title: "Transport", amount: 3000, date: "2026-03-07" },
  { id: "5", title: "Subscriptions", amount: 1500, date: "2026-03-10" },
];

const Expenses = () => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    return expensesData.filter((e) =>
      e.title.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [query]);

  const total = expensesData.reduce((s, i) => s + i.amount, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.header}>Expenses</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>TOTAL EXPENSES</Text>
                  <View style={styles.trendBadge}>
                    <ArrowUpRight size={12} color={Colors.error} />
                    <Text style={styles.trendText}>+12%</Text>
                  </View>
                </View>
                <Text style={styles.cardAmount}>
                  LKR {total.toLocaleString()}
                </Text>
                <Text style={styles.cardSubtext}>This month</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.iconWrap}>
                  <CreditCard size={24} color={Colors.white} />
                </View>
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.searchContainer}>
                <Search
                  size={18}
                  color={Colors.textLight}
                  style={styles.searchIcon}
                />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search expenses"
                  placeholderTextColor={Colors.textLight}
                  style={styles.searchInput}
                />
              </View>
              <Pressable style={styles.filterBtn} onPress={() => {}}>
                <Filter size={16} color={Colors.textMid} />
                <Text style={styles.filterBtnText}>Month</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.section}>Recent</Text>
              <Text style={styles.sectionCount}>{filtered.length} items</Text>
            </View>
          </>
        )}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.item, index === 0 && styles.firstItem]}
          >
            <View style={styles.itemIcon}>
              <View
                style={[
                  styles.itemIconBg,
                  { backgroundColor: `${Colors.primary}10` },
                ]}
              >
                <CreditCard size={20} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemAmount}>
                  LKR {item.amount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.itemFooter}>
                <Calendar size={12} color={Colors.textLight} />
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expenses found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default Expenses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },

  card: {
    backgroundColor: Colors.primaryFade,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    shadowColor: Colors.primaryFade,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardLeft: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardLabel: {
    color: Colors.white,
    opacity: 0.8,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  cardAmount: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtext: {
    color: Colors.white,
    opacity: 0.7,
    fontSize: 12,
  },
  cardRight: { marginLeft: 12 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textDark,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnText: {
    color: Colors.textMid,
    fontWeight: "600",
    fontSize: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  section: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textLight,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  firstItem: {
    paddingTop: 0,
  },
  itemIcon: {
    marginRight: 14,
  },
  itemIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textMid,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemDate: {
    color: Colors.textLight,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textMid,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
