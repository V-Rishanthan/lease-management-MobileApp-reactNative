import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  Calendar,
  ChevronDown,
  Filter,
  Plus,
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
  View,
} from "react-native";

const landFlowData = [
  { id: "1", name: "Kasun Perera", acres: 2, date: "2026-03-05" },

  { id: "2", name: "Nimal Fernando", acres: 2.5, date: "2025-11-12" },

  { id: "3", name: "Saman Silva", acres: 45, date: "2026-01-20" },

  { id: "4", name: "Chathura Jayasinghe", acres: 15000, date: "2024-10-02" },

  { id: "5", name: "Dilani Perera", acres: 5, date: "2026-02-15" },

  { id: "6", name: "Rukmal Wijesinghe", acres: 50, date: "2026-02-15" },

  { id: "7", name: "Tharindu Bandara", acres: 50, date: "2026-02-15" },

  { id: "8", name: "Iresha Liyanage", acres: 100, date: "2026-02-15" },

  { id: "9", name: "Chaminda Gunaratne", acres: 5100, date: "2026-02-15" },

  { id: "10", name: "Sajith Kumara", acres: 50000, date: "2026-02-15" },

  { id: "11", name: "Nadeesha Fernando", acres: 50000, date: "2026-02-15" },

  { id: "12", name: "Ashan Wickramasinghe", acres: 50000, date: "2026-02-15" },
];

const years = ["All", "2024", "2025", "2026"];

const Income = () => {
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [showYearList, setShowYearList] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    return landFlowData.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.trim().toLowerCase());
      const itemYear = new Date(item.date).getFullYear().toString();
      const matchesYear = selectedYear === "All" || itemYear === selectedYear;
      return matchesSearch && matchesYear;
    });
  }, [search, selectedYear]);

  const renderItem = ({ item }: { item: (typeof landFlowData)[0] }) => (
    <View style={styles.transactionCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.dateRow}>
          <Calendar size={12} color={Colors.textLight} />
          <Text style={styles.itemDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.itemValue}>
        <Text style={styles.itemAcres}>{item.acres.toLocaleString()}</Text>
        <Text style={styles.acresUnit}>Acres</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Income Overview</Text>

            {/* Filter Bar */}
            <View style={styles.filterRow}>
              <View style={styles.searchWrapper}>
                <Search
                  size={18}
                  color={Colors.textLight}
                  style={styles.searchIcon}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search owners..."
                  placeholderTextColor={Colors.textMuted}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Pressable
                  style={styles.yearButton}
                  onPress={() => setShowYearList((s) => !s)}
                >
                  <Text style={styles.yearButtonText}>{selectedYear}</Text>
                  <ChevronDown size={16} color={Colors.textDark} />
                </Pressable>

                {showYearList && (
                  <View style={styles.dropdownMenu}>
                    {years.map((y) => (
                      <Pressable
                        key={y}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedYear(y);
                          setShowYearList(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedYear === y && styles.activeYearText,
                          ]}
                        >
                          {y}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Premium Summary Card */}
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.cardLabel}>Portfolio Value</Text>
                <Text style={styles.cardAmount}>LKR 250,000</Text>
                <View style={styles.trendContainer}>
                  <View style={styles.trendPill}>
                    <Text style={styles.trendText}>+12.5%</Text>
                  </View>
                  <Text style={styles.trendSub}>vs last month</Text>
                </View>
              </View>
              <View style={styles.cardIconCircle}>
                <Filter color={Colors.white} size={22} />
              </View>
            </View>

            <Text style={styles.sectionLabel}>Recent Transactions</Text>
          </View>
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push("/addIncome")}>
        <Plus color={Colors.white} size={30} />
      </Pressable>
    </View>
  );
};

export default Income;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 20, paddingBottom: 100 },
  headerSection: { marginBottom: 20, marginTop: 40 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // Search & Filter
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    zIndex: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: "500",
  },

  dropdownContainer: { marginLeft: 10 },
  yearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  yearButtonText: { marginRight: 6, fontWeight: "700", color: Colors.textDark },
  dropdownMenu: {
    position: "absolute",
    top: 54,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: 120,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 10 },
  dropdownItemText: { fontSize: 14, color: Colors.textMid },
  activeYearText: { color: Colors.primary, fontWeight: "700" },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.primaryFade,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    overflow: "hidden",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardAmount: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 4,
  },
  trendContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  trendPill: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  trendText: { color: Colors.success, fontSize: 12, fontWeight: "700" },
  trendSub: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  cardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // List Items
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  itemDate: { fontSize: 13, color: Colors.textLight },
  itemValue: { alignItems: "flex-end" },
  itemAcres: { fontSize: 16, fontWeight: "800", color: Colors.textDark },
  acresUnit: { fontSize: 12, color: Colors.textMid, fontWeight: "600" },
  separator: { height: 12 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryFade,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
});
