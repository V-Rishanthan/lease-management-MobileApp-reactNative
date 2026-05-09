import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

const reminderOptions = [
  { label: "7 Days", value: "7 Days Before" },
  { label: "3 Days", value: "3 Days Before" },
  { label: "1 Day", value: "1 Day Before" },
  { label: "Same Day", value: "Same Day" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const AlertScreen = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedOption, setSelectedOption] = useState("3 Days Before");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const onTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) setDateTime(selected);
  };

  const formatSelectedDate = () => {
    const [year, month, day] = selectedDate.split("-");
    return `${monthNames[parseInt(month)]} ${parseInt(day)}, ${year}`;
  };

  const formatTime = () => {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={["#4A56C8", "#1C2478"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Bell size={22} color={Colors.white} />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.header}>Set Reminder</Text>
            <Text style={styles.headerSubtext}>Never miss a payment again</Text>
          </View>
        </View>

        {/* ── CALENDAR CARD ── */}
        <View style={styles.calendarCard}>
          {/* Month Nav */}
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.chevButton} onPress={prevMonth}>
              <ChevronLeft size={18} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthNames[currentMonth.getMonth()]}{" "}
              <Text style={styles.monthYear}>{currentMonth.getFullYear()}</Text>
            </Text>
            <TouchableOpacity style={styles.chevButton} onPress={nextMonth}>
              <ChevronRight size={18} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.weekDaysRow}>
            {DAYS.map((d, i) => (
              <Text key={i} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>

          {/* Dates */}
          <View style={styles.datesGrid}>
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDay = new Date(year, month, 1).getDay();
              const blanks = Array(firstDay).fill(null);

              return [...blanks, ...Array.from({ length: daysInMonth })].map(
                (_, i) => {
                  const day = i + 1 - firstDay;
                  if (day <= 0 || day > daysInMonth) {
                    return <View key={`b-${i}`} style={styles.dateCell} />;
                  }
                  const keyDate = `${year}-${month}-${day}`;
                  const isSelected = selectedDate === keyDate;
                  const isToday =
                    new Date().toDateString() ===
                    new Date(year, month, day).toDateString();

                  return (
                    <Pressable
                      key={keyDate}
                      onPress={() => setSelectedDate(keyDate)}
                      style={styles.dateCell}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={["#4A56C8", "#1C2478"]}
                          style={styles.dateCellSelectedGrad}
                        >
                          <Text style={styles.dateTextSelected}>{day}</Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={[
                            styles.dateCellInner,
                            isToday && styles.dateCellToday,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              isToday && styles.todayText,
                            ]}
                          >
                            {day}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                },
              );
            })()}
          </View>

          {/* Selected date row */}
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Selected</Text>
            <Text style={styles.selectedValue}>{formatSelectedDate()}</Text>
          </View>
        </View>

        {/* ── TIME PICKER ── */}
        <View style={styles.timeCard}>
          <View style={styles.timeLeft}>
            <View style={styles.timeIconWrap}>
              <Clock size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.timeCardLabel}>REMINDER TIME</Text>
              <Text style={styles.timeCardValue}>{formatTime()}</Text>
            </View>
          </View>

          <View style={styles.amPmRow}>
            <Pressable
              style={[
                styles.amPmBtn,
                dateTime.getHours() < 12 && styles.amPmBtnActive,
              ]}
              onPress={() =>
                setDateTime((d) => {
                  const nd = new Date(d);
                  if (nd.getHours() >= 12) nd.setHours(nd.getHours() - 12);
                  return nd;
                })
              }
            >
              <Text
                style={[
                  styles.amPmText,
                  dateTime.getHours() < 12 && styles.amPmTextActive,
                ]}
              >
                AM
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.amPmBtn,
                dateTime.getHours() >= 12 && styles.amPmBtnActive,
              ]}
              onPress={() =>
                setDateTime((d) => {
                  const nd = new Date(d);
                  if (nd.getHours() < 12) nd.setHours(nd.getHours() + 12);
                  return nd;
                })
              }
            >
              <Text
                style={[
                  styles.amPmText,
                  dateTime.getHours() >= 12 && styles.amPmTextActive,
                ]}
              >
                PM
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity
            style={styles.editTimeBtn}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.editTimeBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── REMINDER OPTIONS ── */}
        <View style={styles.sectionHeader}>
          <BellRing size={14} color={Colors.textMuted} />
          <Text style={styles.sectionTitle}>REMIND ME</Text>
        </View>

        <View style={styles.optionsRow}>
          {reminderOptions.map((opt) => {
            const active = selectedOption === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedOption(opt.value)}
                style={styles.optionCell}
              >
                {active ? (
                  <LinearGradient
                    colors={["#4A56C8", "#1C2478"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionChipActive}
                  >
                    <Text style={styles.optionTextActive}>{opt.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.optionChip}>
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── PUSH NOTIFICATIONS ── */}
        <View style={styles.pushRow}>
          <View style={styles.pushIconWrap}>
            <Bell size={16} color={Colors.primary} />
          </View>
          <View style={styles.pushTextWrap}>
            <Text style={styles.pushTitle}>Push Notifications</Text>
            <Text style={styles.pushSubtitle}>
              Receive alerts on your device
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            thumbColor={Colors.white}
            trackColor={{ true: Colors.primary, false: Colors.borderLight }}
            ios_backgroundColor={Colors.borderLight}
          />
        </View>

        {/* ── SUMMARY ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>
              {formatSelectedDate()} · {formatTime()}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Advance Notice</Text>
            <Text style={styles.summaryValue}>{selectedOption}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Notifications</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: pushEnabled
                    ? Colors.successLight
                    : Colors.errorLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: pushEnabled ? Colors.success : Colors.error },
                ]}
              >
                {pushEnabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 96 }} />

        {/* ── SAVE BUTTON ── */}
        <TouchableOpacity style={styles.saveBtnWrap} onPress={() => {}}>
          <LinearGradient
            colors={["#4A56C8", "#1C2478"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <Save size={18} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save Reminder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={dateTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default AlertScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scroll: {
    padding: 20,
    paddingTop: 12,
  },

  /* ─── HEADER ─── */
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    marginTop: 8,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    gap: 3,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.4,
  },

  headerSubtext: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: "500",
  },

  /* ─── SECTION LABEL ─── */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 20,
  },

  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  /* ─── CALENDAR CARD ─── */
  calendarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  monthText: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.3,
  },

  monthYear: {
    fontWeight: "500",
    color: Colors.textLight,
  },

  chevButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },

  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  weekDay: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    width: "14.28%",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  dateCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },

  dateCellInner: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },

  dateCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  dateCellSelectedGrad: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },

  dateText: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: "500",
  },

  dateTextSelected: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },

  todayText: {
    color: Colors.primary,
    fontWeight: "700",
  },

  selectedInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  selectedLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },

  selectedValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* ─── TIME CARD ─── */
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },

  timeLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  timeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF0FD",
    alignItems: "center",
    justifyContent: "center",
  },

  timeCardLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 2,
  },

  timeCardValue: {
    color: Colors.textDark,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  amPmRow: {
    flexDirection: "row",
    backgroundColor: Colors.borderLight,
    padding: 3,
    borderRadius: 10,
    gap: 3,
  },

  amPmBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  amPmBtnActive: {
    backgroundColor: Colors.primary,
  },

  amPmText: {
    color: Colors.textMid,
    fontWeight: "600",
    fontSize: 12,
  },

  amPmTextActive: {
    color: Colors.white,
  },

  editTimeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  editTimeBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  /* ─── OPTIONS ─── */
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionCell: {
    flex: 1,
  },

  optionChip: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },

  optionChipActive: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  optionText: {
    color: Colors.textMid,
    fontSize: 12,
    fontWeight: "600",
  },

  optionTextActive: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  /* ─── PUSH ROW ─── */
  pushRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
    gap: 12,
  },

  pushIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF0FD",
    alignItems: "center",
    justifyContent: "center",
  },

  pushTextWrap: {
    flex: 1,
  },

  pushTitle: {
    color: Colors.textDark,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
  },

  pushSubtitle: {
    color: Colors.textLight,
    fontSize: 12,
  },

  /* ─── SUMMARY ─── */
  summaryCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
    letterSpacing: 0.1,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },

  summaryLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "500",
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textDark,
    maxWidth: "55%",
    textAlign: "right",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* ─── SAVE BUTTON ─── */
  saveBtnWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  saveBtn: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  saveBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.1,
  },
});
