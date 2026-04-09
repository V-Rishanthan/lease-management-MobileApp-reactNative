import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Bell,
  BellRing,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock as ClockIcon,
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
  "7 Days Before",
  "3 Days Before",
  "1 Day Before",
  "Same Day",
];

const AlertScreen = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOption, setSelectedOption] = useState(reminderOptions[1]);
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
        <View style={styles.headerSection}>
          <Bell size={28} color={Colors.primary} />
          <Text style={styles.header}>Set Reminder</Text>
          <Text style={styles.headerSubtext}>Never miss a payment again</Text>
        </View>

        <Text style={styles.sectionTitle}>
          <Calendar size={14} color={Colors.textMuted} /> DATE & TIME
        </Text>

        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.chevButton} onPress={prevMonth}>
              <ChevronLeft size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity style={styles.chevButton} onPress={nextMonth}>
              <ChevronRight size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <Text key={d} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.datesGrid}>
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDayOfMonth = new Date(year, month, 1).getDay();
              const blanks = Array(firstDayOfMonth).fill(null);

              return [...blanks, ...Array.from({ length: daysInMonth })].map(
                (_, i) => {
                  const day = i + 1 - firstDayOfMonth;
                  if (day <= 0 || day > daysInMonth) {
                    return <View key={`blank-${i}`} style={styles.dateCell} />;
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
                      style={[
                        styles.dateCell,
                        isSelected && styles.dateCellSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          isSelected && styles.dateTextSelected,
                          isToday && !isSelected && styles.todayText,
                        ]}
                      >
                        {day}
                      </Text>
                      {isToday && !isSelected && (
                        <View style={styles.todayDot} />
                      )}
                    </Pressable>
                  );
                },
              );
            })()}
          </View>

          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Selected Date</Text>
            <Text style={styles.selectedValue}>{formatSelectedDate()}</Text>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>
                <Clock size={12} color={Colors.textMuted} /> Time
              </Text>
              <TouchableOpacity
                style={styles.timeDisplay}
                onPress={() => setShowTimePicker(true)}
              >
                <ClockIcon size={18} color={Colors.primary} />
                <Text style={styles.timeDisplayText}>{formatTime()}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.amPmGroup}>
              <Text style={styles.timeLabel}>Period</Text>
              <View style={styles.amPmRow}>
                <Pressable
                  style={[
                    styles.amPmBtn,
                    dateTime.getHours() < 12 && styles.amPmBtnActive,
                  ]}
                  onPress={() => {
                    setDateTime((d) => {
                      const nd = new Date(d);
                      if (nd.getHours() >= 12) nd.setHours(nd.getHours() - 12);
                      return nd;
                    });
                  }}
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
                  onPress={() => {
                    setDateTime((d) => {
                      const nd = new Date(d);
                      if (nd.getHours() < 12) nd.setHours(nd.getHours() + 12);
                      return nd;
                    });
                  }}
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
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          <BellRing size={14} color={Colors.textMuted} /> REMINDER OPTIONS
        </Text>

        <View style={styles.optionsWrapper}>
          <View style={styles.optionsRow}>
            {reminderOptions.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setSelectedOption(opt)}
                style={[
                  styles.optionChip,
                  selectedOption === opt && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === opt && styles.optionTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.pushRow}>
          <View style={styles.pushTextWrap}>
            <Text style={styles.pushTitle}>Push Notifications</Text>
            <Text style={styles.pushSubtitle}>
              Receive alerts on your device
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            thumbColor={pushEnabled ? Colors.white : undefined}
            trackColor={{ true: Colors.primary, false: Colors.borderLight }}
            ios_backgroundColor={Colors.borderLight}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Reminder Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>
              {formatSelectedDate()} at {formatTime()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Reminder</Text>
            <Text style={styles.summaryValue}>{selectedOption}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Notifications</Text>
            <Text style={styles.summaryValue}>
              {pushEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />

        <TouchableOpacity style={styles.saveBtn} onPress={() => {}}>
          <Save size={20} color={Colors.white} />
          <Text style={styles.saveBtnText}>Save Reminder</Text>
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
  },

  headerSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },

  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  calendarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },
  chevButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  chevText: { color: Colors.textMuted },

  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  weekDay: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: "600",
    width: 40,
    textAlign: "center",
  },

  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  dateCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  dateCellSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dateText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: "500",
  },
  dateTextSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  todayText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  todayDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  selectedInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },
  timeGroup: {
    flex: 1,
    marginRight: 12,
  },
  timeLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.borderLight,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  timeDisplayText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },

  amPmGroup: {
    width: 120,
  },
  amPmRow: {
    flexDirection: "row",
    backgroundColor: Colors.borderLight,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  amPmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  amPmBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  amPmText: {
    color: Colors.textMid,
    fontWeight: "600",
    fontSize: 14,
  },
  amPmTextActive: {
    color: Colors.white,
  },

  optionsWrapper: {
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  optionText: {
    color: Colors.textMid,
    fontSize: 14,
    fontWeight: "500",
  },
  optionTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },

  pushRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  pushTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  pushTitle: {
    color: Colors.textDark,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  pushSubtitle: {
    color: Colors.textLight,
    fontSize: 12,
  },

  summaryCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
  },

  saveBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
