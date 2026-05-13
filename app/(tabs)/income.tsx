import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
  CirclePoundSterling,
  FileText,
  HandCoins,
  Layers,
  MapPin,
  Plus,
  Search,
  X
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type LandItem = {
  id: string;
  name: string;
  acres: number;
  date: string;
  notes: string;
  obstacles: number;
  incomeAmount: number;
  advanceAmount: number;
};

const years = ["All", "2024", "2025", "2026"];

const AVATAR_GRADIENTS: Record<string, [string, string]> = {
  A: [Colors.primaryFade, Colors.primary],
  C: [Colors.success, Colors.primary],
  D: [Colors.homeBox2, Colors.primary],
  I: [Colors.accent, Colors.primaryFade],
  K: [Colors.success, Colors.primaryLight],
  N: [Colors.homeBox1, Colors.primaryFade],
  R: [Colors.homeBox2, Colors.primaryLight],
  S: [Colors.primaryFade, Colors.homeBox1],
  T: [Colors.accent, Colors.primary],
};

const getGradient = (name: string): [string, string] =>
  AVATAR_GRADIENTS[name.charAt(0).toUpperCase()] ?? [
    Colors.primaryFade,
    Colors.primary,
  ];

const obstacleColor = (n: number) => {
  if (n === 0) return Colors.success;
  if (n <= 5) return Colors.accent;
  if (n <= 15) return Colors.warn;
  return Colors.error;
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({
  item,
  onClose,
  onUpdate,
  onDelete,
}: {
  item: LandItem | null;
  onClose: () => void;
  onUpdate: (
    id: string,
    name: string,
    acres: number,
    obstacles: number,
    advanceAmount: number,
    incomeAmount: number,
    notes: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAcres, setEditAcres] = useState("");
  const [editObstacles, setEditObstacles] = useState("");
  const [editAdvanceAmount, setEditAdvanceAmount] = useState("");
  const [editIncomeAmount, setEditIncomeAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (item) {
      setEditName(item.name);
      setEditAcres(item.acres.toString());
      setEditObstacles(item.obstacles.toString());
      setEditAdvanceAmount(item.advanceAmount?.toString() || "");
      setEditIncomeAmount(item.incomeAmount?.toString() || "");
      setEditNotes(item.notes || "");
      setIsEditing(false);
    }
  }, [item]);

  if (!item) return null;

  const grad = getGradient(item.name);
  const obsColor = obstacleColor(item.obstacles);

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const handleSave = async () => {
    const acres = parseFloat(editAcres);
    const obstacles = parseInt(editObstacles);
    if (!editName.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    if (isNaN(acres) || acres < 0) {
      Alert.alert("Validation", "Enter a valid area.");
      return;
    }
    if (isNaN(obstacles) || obstacles < 0) {
      Alert.alert("Validation", "Enter a valid obstacle count.");
      return;
    }
    setSaving(true);
    await onUpdate(item.id, editName.trim(), acres, obstacles, editAdvanceAmount ? parseFloat(editAdvanceAmount) : 0,
      editIncomeAmount ? parseFloat(editIncomeAmount) : 0,
      editNotes);
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={d.overlay}>
        <View style={d.sheet}>
          {/* Handle */}
          <View style={d.handle} />

          {/* Hero strip */}
          <LinearGradient
            colors={grad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={d.heroStrip}
          >
            <View style={d.heroLeft}>
              <Text style={d.heroInitial}>{item.name.charAt(0)}</Text>
            </View>
            <View style={d.heroRight}>
              <Text style={d.heroName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={d.heroSub}>
                {isEditing ? "Editing record" : "Land Portfolio Record"}
              </Text>
            </View>
            <TouchableOpacity
              style={d.closeBtn}
              onPress={() => {
                setIsEditing(false);
                onClose();
              }}
            >
              <X size={18} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={d.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isEditing ? (
              /* ── Edit Form ── */
              <View style={d.editForm}>
                <Text style={d.editSectionTitle}>Edit Details</Text>

                <View style={d.fieldGroup}>
                  <Text style={d.label}>Landowner Name</Text>
                  <TextInput
                    style={d.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter name"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={d.fieldGroup}>
                  <Text style={d.label}>Total Area (Acres)</Text>
                  <TextInput
                    style={d.input}
                    value={editAcres}
                    onChangeText={setEditAcres}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={d.fieldGroup}>
                  <Text style={d.label}>Number of land plowing Time</Text>
                  <TextInput
                    style={d.input}
                    value={editObstacles}
                    onChangeText={setEditObstacles}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={d.fieldGroup}>
                  <Text style={d.label}>Advance Amount</Text>
                  <TextInput
                    style={d.input}
                    value={editAdvanceAmount}
                    onChangeText={setEditAdvanceAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={d.fieldGroup}>
                  <Text style={d.label}>Income Amount</Text>
                  <TextInput
                    style={d.input}
                    value={editIncomeAmount}
                    onChangeText={setEditIncomeAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={d.fieldGroup}>
                  <Text style={d.label}>Notes</Text>
                  <TextInput
                    style={d.input}
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Enter notes"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={d.actionRow}>
                  <TouchableOpacity
                    style={d.cancelBtn}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={d.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[d.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={d.saveBtnText}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ── View Mode ── */
              <>
                {/* Stat tiles */}
                <View style={d.tiles}>
                  <View style={[d.tile, d.tileLarge]}>
                    <View style={d.tileIcon}>
                      <MapPin size={16} color={Colors.primaryFade} />
                    </View>
                    <Text style={d.tileLabel}>Total Area</Text>
                    <Text style={d.tileValBig}>
                      {item.acres.toLocaleString()}
                    </Text>
                    <Text style={d.tileUnit}>Acres</Text>
                  </View>

                  <View style={[d.tile, d.tileSmall]}>
                    <View
                      style={[
                        d.tileIcon,
                        { backgroundColor: `${obsColor}18` },
                      ]}
                    >
                      <AlertTriangle size={16} color={obsColor} />
                    </View>
                    <Text style={d.tileLabel}>land plowing</Text>
                    <Text style={[d.tileValMid, { color: obsColor }]}>
                      {item.obstacles}
                    </Text>
                    <Text style={d.tileUnit}>
                      {item.obstacles === 0 ? "Clear" : "found"}
                    </Text>
                  </View>
                </View>

                {/* Income card */}
                <View style={d.infoCard}>
                  <View style={d.infoRow}>
                    <View
                      style={[
                        d.infoIconBox,
                        { backgroundColor: `${Colors.success}15` },
                      ]}
                    >

                      <CirclePoundSterling size={16} color={Colors.primaryFade} />
                    </View>
                    <View>
                      <Text style={d.infoLabel}>Income Amount</Text>
                      <Text style={d.infoVal}>
                        LKR {item.incomeAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Date card */}
                <View style={d.infoCard}>
                  <View style={d.infoRow}>
                    <View
                      style={[
                        d.infoIconBox,
                        { backgroundColor: `${Colors.accent}15` },
                      ]}
                    >
                      <Calendar size={16} color={Colors.accent} />
                    </View>
                    <View>
                      <Text style={d.infoLabel}>Registered Date</Text>
                      <Text style={d.infoVal}>{formatDate(item.date)}</Text>
                    </View>
                  </View>
                </View>

                {/* Notes card */}
                <View style={d.infoCard}>
                  <View style={d.infoRow}>
                    <View
                      style={[
                        d.infoIconBox,
                        { backgroundColor: `${Colors.primaryFade}15` },
                      ]}
                    >
                      <FileText size={16} color={Colors.primaryFade} />
                    </View>
                    <Text style={d.infoLabel}>Notes</Text>
                  </View>
                  <Text style={d.notesText}>{item.notes}</Text>

                </View>

                {/* Advance Amount card */}
                <View style={d.infoCard}>
                  <View style={d.infoRow}>
                    <View
                      style={[
                        d.infoIconBox,
                        { backgroundColor: `${Colors.primaryFade}15` },
                      ]}
                    >
                      <HandCoins size={16} color={Colors.primaryFade} />
                    </View>
                    <Text style={d.infoLabel}>Advance Amount</Text>
                  </View>
                  <Text style={d.notesText}>LKR {item.advanceAmount}</Text>

                </View>

                {/* Obstacle severity */}
                {item.obstacles > 0 && (
                  <View style={[d.severityCard, { borderLeftColor: obsColor }]}>
                    <Text style={[d.severityTitle, { color: obsColor }]}>
                      {item.obstacles <= 5
                        ? "Low obstacle count"
                        : item.obstacles <= 15
                          ? "Moderate obstacles"
                          : "High obstacle count"}
                    </Text>
                    <Text style={d.severityDesc}>
                      {item.obstacles} obstacle
                      {item.obstacles !== 1 ? "s" : ""} recorded.{" "}
                      {item.obstacles > 15
                        ? "Requires immediate field assessment."
                        : "Schedule routine inspection."}
                    </Text>
                  </View>
                )}

                {/* Action buttons */}
                <View style={d.actionRow}>
                  <TouchableOpacity
                    style={d.editBtn}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={d.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={d.deleteBtn}
                    onPress={() => {
                      Alert.alert(
                        "Delete Record",
                        `Remove "${item.name}" from the portfolio?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              onClose(); // close modal first
                              await onDelete(item.id);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={d.deleteBtnText}>Delete</Text>
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

// ── Main Screen ───────────────────────────────────────────────────────────────
const Income = () => {
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [showYearList, setShowYearList] = useState(false);
  const [selected, setSelected] = useState<LandItem | null>(null);
  const [landFlowData, setLandFlowData] = useState<LandItem[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchIncomeData();
    }, [])
  );

  const fetchIncomeData = async () => {
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
          .from("income")
          .select("*")
          .eq("vehicle_info_id", vehicleData.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Fetch error:", error);
          return;
        }

        if (data) {
          const formattedData: LandItem[] = data.map((item: any) => ({
            id: item.id,
            name: item.land_owner_name || "Unknown",
            acres: item.total_area || 0,
            date: item.date || new Date().toISOString(),
            notes: item.notes || "No notes",
            obstacles: item.how_often || 0,
            incomeAmount: item.income_amount || 0,
            advanceAmount: item.advance_amount || 0,
          }));
          setLandFlowData(formattedData);
        }
      }
    } catch (error) {
      console.error("Error fetching income data:", error);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (
    id: string,
    name: string,
    acres: number,
    obstacles: number,
    advanceAmount: number,
    incomeAmount: number,
    notes: string
  ) => {
    try {
      console.log("Attempting to update record with id:", id);
      const { data, error } = await supabase
        .from("income")
        .update({
          land_owner_name: name,
          total_area: acres,
          how_often: obstacles,
          advance_amount: advanceAmount,
          income_amount: incomeAmount,
          notes: notes,
        })
        .eq("id", id)
        .select();

      console.log("Update response data:", data, "error:", error);

      if (error) {
        Alert.alert("Update Error", error.message || "Failed to update record.");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert("Update Warning", "Database returned no error, but no records were actually updated. Is the ID correct?");
        return;
      }

      // Refresh list
      setLandFlowData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, name, acres, obstacles } : item
        )
      );

      // Refresh modal so it shows updated values
      setSelected((prev) =>
        prev?.id === id ? { ...prev, name, acres, obstacles } : prev
      );
    } catch (e: any) {
      console.error("Catch error in handleUpdate:", e);
      Alert.alert("Error", e.message ?? "Something went wrong.");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      console.log("Attempting to delete record with id:", id);
      const { data, error } = await supabase.from("income").delete().eq("id", id).select();

      console.log("Delete response data:", data, "error:", error);

      if (error) {
        Alert.alert("Delete Error", error.message || "Failed to delete record.");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert("Delete Warning", "Database returned no error, but no records were actually deleted.");
        return;
      }

      // Remove from list after modal is already closed
      setLandFlowData((prev) => prev.filter((item) => item.id !== id));
    } catch (e: any) {
      console.error("Catch error in handleDelete:", e);
      Alert.alert("Error", e.message ?? "Something went wrong.");
    }
  };

  const totalAcres = landFlowData.reduce((s, i) => s + i.acres, 0);
  const totalValue = landFlowData.reduce((s, i) => s + i.incomeAmount, 0);
  const maxAcres = Math.max(...landFlowData.map((d) => d.acres), 1);

  const filtered = useMemo(() => {
    return landFlowData.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.trim().toLowerCase());
      const itemYear = new Date(item.date).getFullYear().toString();
      const matchesYear =
        selectedYear === "All" || itemYear === selectedYear;
      return matchesSearch && matchesYear;
    });
  }, [search, selectedYear, landFlowData]);

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ── Row ───────────────────────────────────────────────────────────────────
  const renderItem = ({
    item,
    index,
  }: {
    item: LandItem;
    index: number;
  }) => {
    const grad = getGradient(item.name);
    const obsColor = obstacleColor(item.obstacles);
    const barPct = Math.max((item.acres / maxAcres) * 100, 2);

    return (
      <TouchableOpacity
        style={s.row}
        activeOpacity={0.72}
        onPress={() => setSelected(item)}
      >
        {/* Left accent */}
        <View style={[s.rowAccent, { backgroundColor: grad[0] }]} />

        {/* Rank + Avatar */}
        <View style={s.rowLeft}>
          <Text style={s.rank}>#{index + 1}</Text>
          <LinearGradient colors={grad} style={s.avatar}>
            <Text style={s.avatarText}>{item.name.charAt(0)}</Text>
          </LinearGradient>
        </View>

        {/* Body */}
        <View style={s.rowBody}>
          <Text style={s.rowName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Progress bar */}
          <View style={s.barTrack}>
            <LinearGradient
              colors={[Colors.primaryFade, Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.barFill, { width: `${barPct}%` }]}
            />
          </View>

          <View style={s.rowMeta}>
            <Calendar size={10} color={Colors.textMuted} />
            <Text style={s.rowDate}>{formatDate(item.date)}</Text>
            <View style={s.metaSep} />
            <AlertTriangle size={10} color={obsColor} />
            <Text style={[s.rowObs, { color: obsColor }]}>
              {item.obstacles} obstacle{item.obstacles !== 1 ? "s" : ""}
            </Text>
          </View>

          <Text style={s.rowNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        </View>

        {/* Right */}
        <View style={s.rowRight}>
          <Text style={s.rowAcres}>{item.acres.toLocaleString()}</Text>
          <Text style={s.rowUnit}>acres</Text>
          <ChevronRight
            size={14}
            color={Colors.textMuted}
            style={{ marginTop: 6 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // ── List Header ───────────────────────────────────────────────────────────
  const ListHeader = () => (
    <>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryFade]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.heroDec1} />
        <View style={s.heroDec2} />
        <View style={s.heroTop}>
          <View>
            <Text style={s.heroEyebrow}>Land Portfolio</Text>
            <Text style={s.heroTitle}>Income{"\n"}Overview</Text>
          </View>
          <View style={s.heroIconBox}>
            <Layers color={Colors.white} size={22} />
          </View>
        </View>
      </LinearGradient>

      <View style={s.statsCard}>
        <View style={s.statsTop}>
          <View style={s.statMain}>
            <Text style={s.statMainLabel}>Total Land</Text>
            <Text style={s.statMainVal}>{totalAcres.toLocaleString()}</Text>
            <Text style={s.statMainUnit}>Acres</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statSide}>
            <View>
              <Text style={s.statSideLabel}>Portfolio Value</Text>
              <Text style={s.statSideVal}>
                LKR {totalValue.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text style={s.statSideLabel}>Landowners</Text>
              <Text style={s.statSideVal}>{landFlowData.length}</Text>
            </View>
          </View>
        </View>
        <View style={s.locationStrip}>
          <MapPin size={12} color={Colors.primaryFade} />
          <Text style={s.locationText}>
            Sri Lanka · Active Portfolio · FY 2026
          </Text>
        </View>
      </View>

      <View style={s.filterRow}>
        <View style={s.searchBox}>
          <Search size={15} color={Colors.textLight} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search landowners..."
            placeholderTextColor={Colors.textMuted}
            style={s.searchInput}
          />
        </View>
        <View style={s.yearWrap}>
          <Pressable
            style={s.yearBtn}
            onPress={() => setShowYearList((v) => !v)}
          >
            <Text style={s.yearBtnText}>{selectedYear}</Text>
            <ChevronDown size={14} color={Colors.primary} />
          </Pressable>
          {showYearList && (
            <View style={s.dropdown}>
              {years.map((y) => (
                <Pressable
                  key={y}
                  style={[s.dropItem, selectedYear === y && s.dropItemActive]}
                  onPress={() => {
                    setSelectedYear(y);
                    setShowYearList(false);
                  }}
                >
                  <Text
                    style={[
                      s.dropText,
                      selectedYear === y && s.dropTextActive,
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

      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Landowners</Text>
        <View style={s.countPill}>
          <Text style={s.countText}>{filtered.length} records</Text>
        </View>
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Search size={32} color={Colors.textLight} />
      </View>
      <Text style={s.emptyTitle}>No records found</Text>
      <Text style={s.emptySub}>Adjust your search or year filter.</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/addIncome")}
      >
        <LinearGradient
          colors={[Colors.primaryFade, Colors.primary]}
          style={s.fabGrad}
        >
          <Plus color={Colors.white} size={26} strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      <DetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </View>
  );
};

export default Income;

// ── List Styles ───────────────────────────────────────────────────────────────
const HERO_H = 200;
const CARD_PULL = 45;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 110 },

  hero: {
    height: HERO_H,
    paddingTop: 52,
    paddingHorizontal: 22,
    overflow: "hidden",
  },
  heroDec1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -100,
    right: -80,
  },
  heroDec2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -40,
    left: 30,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -1,
    lineHeight: 36,
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  statsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: -CARD_PULL,
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: Colors.primary,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  statsTop: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 14,
  },
  statMain: { flex: 1.1, paddingRight: 16 },
  statMainLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statMainVal: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -1,
    lineHeight: 40,
  },
  statMainUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryFade,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  statSide: { flex: 1, justifyContent: "space-between", gap: 8 },
  statSideLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statSideVal: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textDark,
  },
  locationStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryFade,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
    zIndex: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: Colors.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 13,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "500",
  },
  yearWrap: { position: "relative" },
  yearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 13,
  },
  yearBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  dropdown: {
    position: "absolute",
    top: 52,
    right: 0,
    zIndex: 99,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    width: 110,
    paddingVertical: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dropItem: { paddingVertical: 11, paddingHorizontal: 14 },
  dropItemActive: { backgroundColor: Colors.primarySoft },
  dropText: { fontSize: 13, color: Colors.textMid, fontWeight: "500" },
  dropTextActive: { color: Colors.primary, fontWeight: "800" },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textDark,
  },
  countPill: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryFade,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  rowAccent: { width: 4, alignSelf: "stretch" },
  rowLeft: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  rank: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.textMuted,
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 17, fontWeight: "800", color: Colors.white },
  rowBody: { flex: 1, paddingVertical: 13, paddingRight: 4 },
  rowName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 6,
  },
  barTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 6,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 2 },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  rowDate: { fontSize: 10, color: Colors.textMuted, fontWeight: "500" },
  metaSep: {
    width: 1,
    height: 10,
    backgroundColor: Colors.border,
    marginHorizontal: 2,
  },
  rowObs: { fontSize: 10, fontWeight: "700" },
  rowNotes: { fontSize: 11, color: Colors.textLight, fontStyle: "italic" },
  rowRight: {
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowAcres: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  rowUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textLight,
    marginTop: 1,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textMid,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 32,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
  fabGrad: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ── Detail Modal Styles ───────────────────────────────────────────────────────
const d = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,20,50,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    overflow: "hidden",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 10,
  },

  heroStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  heroLeft: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitial: { fontSize: 24, fontWeight: "800", color: Colors.white },
  heroRight: { flex: 1 },
  heroName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  body: { padding: 16, paddingBottom: 48 },

  tiles: { flexDirection: "row", gap: 12, marginBottom: 14 },
  tile: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  tileLarge: { flex: 1.6 },
  tileSmall: { flex: 1 },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  tileValBig: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.8,
  },
  tileValMid: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  tileUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textLight,
    marginTop: 2,
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoVal: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 21,
    marginTop: 8,
  },

  severityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  severityTitle: { fontSize: 13, fontWeight: "800", marginBottom: 4 },
  severityDesc: { fontSize: 13, color: Colors.textMid, lineHeight: 19 },

  // Edit form
  editForm: { paddingBottom: 8 },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  fieldGroup: { marginBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: "500",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.primarySoft,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primaryMid,
  },
  editBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: `${Colors.error}12`,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  deleteBtnText: {
    color: Colors.error,
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: Colors.textMid,
    fontWeight: "700",
    fontSize: 15,
  },
});