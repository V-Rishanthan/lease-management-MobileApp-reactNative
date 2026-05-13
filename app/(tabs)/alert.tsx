import { supabase } from "@/lib/supabase";
import { cancelNotification, scheduleNotification } from "@/services/notifications";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { TimerPickerModal } from "react-native-timer-picker";
import Colors from "../../constants/Colors";

const reminderOptions = [
  { label: "7 Days", value: "7 Days Before" },
  { label: "3 Days", value: "3 Days Before" },
  { label: "1 Day", value: "1 Day Before" },
  { label: "Same Day", value: "Same Day" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

type ReminderItem = {
  id: string;
  date: string;
  time: string;
  reminder_status: string;
};

const AlertScreen = () => {
  const router = useRouter();
  const [dateTime, setDateTime] = useState(new Date());
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("3 Days Before");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  });
  const [loading, setLoading] = useState(false);
  const [vehicleInfoId, setVehicleInfoId] = useState<string | null>(null);
  const [totalReminders, setTotalReminders] = useState(0);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // Fetch vehicle_info_id and total reminders
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
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
        setVehicleInfoId(vehicleData.id);

        // Fetch all reminders
        const { data: reminderData } = await supabase
          .from("reminder")
          .select("id, date, time, reminder_status")
          .eq("vehicle_info_id", vehicleData.id)
          .order("date", { ascending: true });

        if (reminderData) {
          setReminders(reminderData);
          setTotalReminders(reminderData.length);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

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

  // Handle time change from TimerPicker
  const handleTimeConfirm = (pickerValue: any) => {
    const { hours, minutes } = pickerValue;
    const newDateTime = new Date(dateTime);
    newDateTime.setHours(hours, minutes, 0, 0);
    setDateTime(newDateTime);
    setShowTimePickerModal(false);
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

  // Calculate reminder date based on selected options
  const calculateReminderDate = () => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const reminderDate = new Date(year, month, day);

    // Set the time
    reminderDate.setHours(dateTime.getHours(), dateTime.getMinutes(), 0, 0);

    // Subtract advance notice days
    const daysMap: Record<string, number> = {
      "Same Day": 0,
      "1 Day Before": -1,
      "3 Days Before": -3,
      "7 Days Before": -7,
    };

    const daysToSubtract = daysMap[selectedOption] || 0;
    reminderDate.setDate(reminderDate.getDate() + daysToSubtract);

    return reminderDate;
  };

  // Save reminder handler
  const handleSaveReminder = async () => {
    if (!vehicleInfoId) {
      Alert.alert("Error", "User profile not found. Please set up your profile first.");
      return;
    }

    const reminderDate = calculateReminderDate();

    // Check if reminder date is in the past
    if (reminderDate <= new Date()) {
      Alert.alert("Invalid Date", "Please select a future date and time for the reminder.");
      return;
    }

    setLoading(true);
    try {
      // Format date for database (YYYY-MM-DD)
      const formattedDate = reminderDate.toISOString().split('T')[0];
      // Format time for database (HH:MM AM/PM)
      const formattedTime = formatTime();

      // Save to Supabase
      const { data, error } = await supabase
        .from("reminder")
        .insert({
          vehicle_info_id: vehicleInfoId,
          date: formattedDate,
          time: formattedTime,
          reminder_status: pushEnabled ? "active" : "inactive",
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        Alert.alert("Error", "Failed to save reminder to database.");
        return;
      }

      // Schedule local notification if push notifications are enabled
      if (pushEnabled && data) {
        const notificationId = await scheduleNotification(
          data.id,
          reminderDate,
          formattedTime
        );

        if (notificationId) {
          console.log("Notification scheduled with ID:", notificationId);
        }
      }

      Alert.alert(
        "Success",
        pushEnabled
          ? "Reminder saved! You'll receive a notification at the scheduled time."
          : "Reminder saved successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Refresh total reminders
              fetchUserData();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving reminder:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle notifications handler (for new reminder form)
  const handleToggleNotifications = async (value: boolean) => {
    setPushEnabled(value);

    if (!value) {
      Alert.alert(
        "Disable Notifications",
        "Are you sure you want to disable push notifications? You won't receive alerts for this reminder.",
        [
          { text: "Cancel", style: "cancel", onPress: () => setPushEnabled(true) },
          { text: "Disable", style: "destructive", onPress: () => setPushEnabled(false) },
        ]
      );
    }
  };

  // Toggle an existing reminder on/off
  const handleToggleReminder = async (item: ReminderItem, value: boolean) => {
    const newStatus = value ? "active" : "inactive";
    try {
      const { error } = await supabase
        .from("reminder")
        .update({ reminder_status: newStatus })
        .eq("id", item.id);

      if (error) { Alert.alert("Error", error.message); return; }

      // Update local state immediately
      setReminders((prev) =>
        prev.map((r) => r.id === item.id ? { ...r, reminder_status: newStatus } : r)
      );

      if (value) {
        // Reschedule notification
        const reminderDate = new Date(`${item.date}T00:00:00`);
        await scheduleNotification(item.id, reminderDate, item.time);
      } else {
        // Cancel notification
        await cancelNotification(item.id);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
    }
  };

  // Delete an existing reminder
  const handleDeleteReminder = (item: ReminderItem) => {
    Alert.alert("Delete Reminder", `Remove reminder for ${item.date} at ${item.time}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelNotification(item.id);
            const { error } = await supabase.from("reminder").delete().eq("id", item.id);
            if (error) { Alert.alert("Error", error.message); return; }
            setReminders((prev) => prev.filter((r) => r.id !== item.id));
            setTotalReminders((n) => Math.max(0, n - 1));
          } catch (e: any) {
            Alert.alert("Error", e.message ?? "Something went wrong.");
          }
        },
      },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO HEADER ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryFade]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroHeader}
        >
          <View style={s.heroDec1} />
          <View style={s.heroDec2} />
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroEyebrow}>Reminder Settings</Text>
              <Text style={s.heroTitle}>Payment{"\n"}Alert</Text>
            </View>
            <View style={s.heroIconBox}>
              <Bell color={Colors.white} size={22} />
            </View>
          </View>
        </LinearGradient>

        {/* ── Summary Card ── */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Reminder Summary</Text>

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Date & Time</Text>
            <Text style={s.summaryValueText}>
              {formatSelectedDate()} · {formatTime()}
            </Text>
          </View>
          <View style={s.summaryDivider} />

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Advance Notice</Text>
            <Text style={s.summaryValueText}>{selectedOption}</Text>
          </View>
          <View style={s.summaryDivider} />

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total Reminders</Text>
            <Text style={s.summaryValueText}>{totalReminders}</Text>
          </View>
          <View style={s.summaryDivider} />

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Notifications</Text>
            <View
              style={[
                s.statusPill,
                {
                  backgroundColor: pushEnabled
                    ? Colors.successLight
                    : Colors.errorLight,
                },
              ]}
            >
              <Text
                style={[
                  s.statusPillText,
                  {
                    color: pushEnabled ? Colors.success : Colors.error,
                  },
                ]}
              >
                {pushEnabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── CALENDAR SECTION ── */}
        <View style={s.sectionLabel}>
          <Calendar size={13} color={Colors.textLight} />
          <Text style={s.sectionLabelText}>SELECT DATE</Text>
        </View>

        <View style={s.calendarCard}>
          {/* Month navigation */}
          <View style={s.monthNav}>
            <TouchableOpacity style={s.chevBtn} onPress={prevMonth}>
              <ChevronLeft size={17} color={Colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={s.monthLabel}>
              <Text style={s.monthName}>
                {monthNames[currentMonth.getMonth()]}
              </Text>
              <Text style={s.monthYear}>{currentMonth.getFullYear()}</Text>
            </View>
            <TouchableOpacity style={s.chevBtn} onPress={nextMonth}>
              <ChevronRight size={17} color={Colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Weekday labels */}
          <View style={s.weekLabels}>
            {DAYS.map((d, i) => (
              <Text key={i} style={s.weekLabel}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={s.calendarGrid}>
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
                    return <View key={`b-${i}`} style={s.calDateCell} />;
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
                      style={s.calDateCell}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={[Colors.primaryFade, Colors.primary]}
                          style={s.dateBubbleActive}
                        >
                          <Text style={s.dateTextActive}>{day}</Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={[
                            s.dateBubble,
                            isToday && s.dateBubbleToday,
                          ]}
                        >
                          <Text
                            style={[
                              s.dateText,
                              isToday && s.dateTextToday,
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

          {/* Selected date display */}
          <View style={s.selectedDateBar}>
            <View style={s.selectedDateLeft}>
              <View style={s.selectedDateIcon}>
                <Calendar size={14} color={Colors.primary} />
              </View>
              <Text style={s.selectedDateLabel}>Selected</Text>
            </View>
            <Text style={s.selectedDateValue}>{formatSelectedDate()}</Text>
          </View>
        </View>

        {/* ── TIME SECTION WITH TIMERPICKER ── */}
        <View style={s.sectionLabel}>
          <Clock size={13} color={Colors.textLight} />
          <Text style={s.sectionLabelText}>SELECT TIME</Text>
        </View>

        <View style={s.timeCard}>
          <View style={s.timeLeft}>
            <View style={s.timeIcon}>
              <Clock size={16} color={Colors.white} strokeWidth={2} />
            </View>
            <View style={s.timeContent}>
              <Text style={s.timeLabel}>Reminder Time</Text>
              <Text style={s.timeValue}>{formatTime()}</Text>
            </View>
          </View>

          {/* AM/PM toggle */}
          <View style={s.ampmGroup}>
            <Pressable
              style={[
                s.ampmBtn,
                dateTime.getHours() < 12 && s.ampmBtnActive,
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
                  s.ampmText,
                  dateTime.getHours() < 12 && s.ampmTextActive,
                ]}
              >
                AM
              </Text>
            </Pressable>
            <Pressable
              style={[
                s.ampmBtn,
                dateTime.getHours() >= 12 && s.ampmBtnActive,
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
                  s.ampmText,
                  dateTime.getHours() >= 12 && s.ampmTextActive,
                ]}
              >
                PM
              </Text>
            </Pressable>
          </View>

          {/* Edit time button with TimerPicker */}
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => setShowTimePickerModal(true)}
          >
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* TimerPicker Modal */}
        <TimerPickerModal
          visible={showTimePickerModal}
          setIsVisible={setShowTimePickerModal}
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePickerModal(false)}
          modalTitle="Select Time"
          modalTitleStyle={{ fontSize: 20, fontWeight: 'bold', color: Colors.textDark }}
          modalCancelButtonText="Cancel"
          modalConfirmButtonText="Confirm"
          modalCancelButtonTextStyle={{ color: Colors.error }}
          modalConfirmButtonTextStyle={{ color: Colors.primary }}
          pickerProps={{
            allowFontScaling: true,
            initialHours: dateTime.getHours() % 12 || 12,
            initialMinutes: dateTime.getMinutes(),
            use12HourPicker: true,
            hourPickerProps: {
              itemTextStyle: { color: Colors.textDark, fontSize: 20, fontWeight: '500' },
              containerStyle: { backgroundColor: Colors.surface },
            },
            minutePickerProps: {
              itemTextStyle: { color: Colors.textDark, fontSize: 20, fontWeight: '500' },
              containerStyle: { backgroundColor: Colors.surface },
            },
          }}
          modalStyle={{
            backgroundColor: Colors.background,
            borderRadius: 20,
            padding: 20,
          }}
          modalOverlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        />

        {/* ── REMINDER OPTIONS ── */}
        <View style={s.sectionLabel}>
          <Sparkles size={13} color={Colors.textLight} />
          <Text style={s.sectionLabelText}>ADVANCE NOTICE</Text>
        </View>

        <View style={s.optionsGrid}>
          {reminderOptions.map((opt) => {
            const active = selectedOption === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={s.optionCol}
                onPress={() => setSelectedOption(opt.value)}
              >
                {active ? (
                  <LinearGradient
                    colors={[Colors.primaryFade, Colors.primary]}
                    style={s.optionPillActive}
                  >
                    <Text style={s.optionTextActive}>{opt.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={s.optionPill}>
                    <Text style={s.optionText}>{opt.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── NOTIFICATIONS TOGGLE ── */}
        <View style={s.sectionLabel}>
          <Bell size={13} color={Colors.textLight} />
          <Text style={s.sectionLabelText}>NOTIFICATIONS</Text>
        </View>

        <View style={s.notifCard}>
          <View style={s.notifLeft}>
            <View style={s.notifIcon}>
              <Bell size={16} color={Colors.white} strokeWidth={2} />
            </View>
            <View>
              <Text style={s.notifTitle}>Push Notifications</Text>
              <Text style={s.notifSub}>
                {pushEnabled
                  ? "You'll receive alerts on your device"
                  : "Notifications are turned off"}
              </Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={handleToggleNotifications}
            thumbColor={Colors.white}
            trackColor={{ true: Colors.primary, false: Colors.borderLight }}
            ios_backgroundColor={Colors.borderLight}
          />
        </View>

        {/* ── SCHEDULED REMINDERS LIST ── */}
        <View style={s.sectionLabel}>
          <Bell size={13} color={Colors.textLight} />
          <Text style={s.sectionLabelText}>SCHEDULED REMINDERS</Text>
        </View>

        {reminders.length === 0 ? (
          <View style={s.emptyReminders}>
            <Bell size={32} color={Colors.textLight} />
            <Text style={s.emptyRemindersText}>No reminders yet</Text>
            <Text style={s.emptyRemindersSub}>Set a date and save to create one</Text>
          </View>
        ) : (
          reminders.map((item) => {
            const isActive = item.reminder_status === "active";
            return (
              <View key={item.id} style={s.reminderCard}>
                <View style={[s.reminderAccent, { backgroundColor: isActive ? Colors.success : Colors.textLight }]} />
                <View style={s.reminderBody}>
                  <View style={s.reminderRow}>
                    <View style={s.reminderIconBox}>
                      <Calendar size={14} color={Colors.primary} />
                    </View>
                    <View style={s.reminderInfo}>
                      <Text style={s.reminderDate}>{item.date}</Text>
                      <Text style={s.reminderTime}>{item.time}</Text>
                    </View>
                    <View style={[
                      s.reminderStatusPill,
                      { backgroundColor: isActive ? Colors.successLight : Colors.errorLight },
                    ]}>
                      <Text style={[s.reminderStatusText, { color: isActive ? Colors.success : Colors.error }]}>
                        {isActive ? "Active" : "Off"}
                      </Text>
                    </View>
                  </View>
                  <View style={s.reminderActions}>
                    <Switch
                      value={isActive}
                      onValueChange={(val) => handleToggleReminder(item, val)}
                      thumbColor={Colors.white}
                      trackColor={{ true: Colors.primary, false: Colors.borderLight }}
                      ios_backgroundColor={Colors.borderLight}
                    />
                    <TouchableOpacity
                      style={s.reminderDeleteBtn}
                      onPress={() => handleDeleteReminder(item)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── SAVE BUTTON ── */}
      <TouchableOpacity
        style={[s.fabWrap, loading && { opacity: 0.7 }]}
        onPress={handleSaveReminder}
        disabled={loading}
      >
        <LinearGradient
          colors={[Colors.primaryFade, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.fab}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} style={{ marginRight: 8 }} />
          ) : (
            <Save size={18} color={Colors.white} strokeWidth={2} />
          )}
          <Text style={s.fabText}>
            {loading ? "Saving..." : "Save Reminder"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default AlertScreen;
// ── Styles ────────────────────────────────────────────────────────────────────
const HERO_H = 200;
const CARD_PULL = 45;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 80 },

  // ── HERO HEADER (Income Style) ──────────────────────────────────────────
  heroHeader: {
    height: HERO_H,
    paddingTop: 52,
    paddingHorizontal: 22,
    overflow: "hidden",
    marginBottom: 0,
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

  // ── SUMMARY CARD (pulled up) ────────────────────────────────────────────
  summaryCard: {
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
  summaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryDivider: { height: 1, backgroundColor: Colors.borderLight },
  summaryLabel: { fontSize: 13, color: Colors.textLight, fontWeight: "600" },
  summaryValueText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textDark,
    maxWidth: "55%",
    textAlign: "right",
  },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 10, fontWeight: "800" },

  // ── SECTION LABELS ──────────────────────────────────────────────────────
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textLight,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── CALENDAR CARD ───────────────────────────────────────────────────────
  calendarCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 12,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  chevBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primaryMid,
  },
  monthLabel: { alignItems: "center" },
  monthName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  monthYear: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "500",
    marginTop: 1,
  },
  weekLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    width: "14.28%",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  calDateCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 1,
  },
  dateBubble: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBubbleToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dateBubbleActive: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: { fontSize: 12, fontWeight: "500", color: Colors.textDark },
  dateTextActive: { fontSize: 12, fontWeight: "700", color: Colors.white },
  dateTextToday: { fontWeight: "700", color: Colors.primary },

  selectedDateBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectedDateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedDateIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  selectedDateValue: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primary,
  },

  // ── TIME CARD ───────────────────────────────────────────────────────────
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  timeLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  timeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  timeContent: { gap: 2 },
  timeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  timeValue: { fontSize: 16, fontWeight: "800", color: Colors.textDark },
  ampmGroup: {
    flexDirection: "row",
    backgroundColor: Colors.borderLight,
    padding: 2,
    borderRadius: 10,
    gap: 2,
  },
  ampmBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ampmBtnActive: { backgroundColor: Colors.primary },
  ampmText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted },
  ampmTextActive: { color: Colors.white },
  editBtn: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editBtnText: { fontSize: 12, fontWeight: "700", color: Colors.primary },

  // ── OPTIONS GRID ────────────────────────────────────────────────────────
  optionsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  optionCol: { flex: 1 },
  optionPill: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  optionPillActive: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  optionText: { fontSize: 12, fontWeight: "700", color: Colors.textMid },
  optionTextActive: { fontSize: 12, fontWeight: "700", color: Colors.white },

  // ── NOTIFICATIONS ───────────────────────────────────────────────────────
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    marginBottom: 12,
  },
  notifLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTitle: { fontSize: 14, fontWeight: "700", color: Colors.textDark, marginBottom: 2 },
  notifSub: { fontSize: 11, color: Colors.textLight },

  // ── FAB BUTTON ──────────────────────────────────────────────────────────
  fabWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  fab: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  fabText: {
    color: Colors.white,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── SCHEDULED REMINDERS LIST ────────────────────────────────────────────
  emptyReminders: {
    alignItems: "center",
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    marginBottom: 12,
  },
  emptyRemindersText: { fontSize: 15, fontWeight: "700", color: Colors.textMid, marginTop: 8 },
  emptyRemindersSub: { fontSize: 12, color: Colors.textLight },

  reminderCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  reminderAccent: { width: 4 },
  reminderBody: { flex: 1, padding: 14, gap: 10 },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reminderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderInfo: { flex: 1, gap: 2 },
  reminderDate: { fontSize: 13, fontWeight: "700", color: Colors.textDark },
  reminderTime: { fontSize: 11, color: Colors.textLight, fontWeight: "500" },
  reminderStatusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  reminderStatusText: { fontSize: 10, fontWeight: "800" },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
  },
  reminderDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
});