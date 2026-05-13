import Constants from "expo-constants";
import { Platform } from "react-native";

// Detect if running inside Expo Go (push notifications removed in SDK 53+)
const isExpoGo = Constants.appOwnership === "expo";

// Lazy-load expo-notifications only outside Expo Go to avoid the
// DevicePushTokenAutoRegistration crash that happens on import.
let Notifications: any = null;

function getNotifications() {
  if (!Notifications && !isExpoGo) {
    try {
      Notifications = require("expo-notifications");

      // Configure how notifications appear when the app is foregrounded
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Create an Android channel
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("payment-reminders", {
          name: "Payment Reminders",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });
      }
    } catch (e) {
      console.warn("expo-notifications could not be loaded:", e);
    }
  }
  return Notifications;
}

// ── Register for push permissions ─────────────────────────────────────────────
export async function registerForPushNotificationsAsync() {
  const N = getNotifications();
  if (!N) {
    console.log("Notifications not available (Expo Go). Skipping registration.");
    return null;
  }

  const { status: existingStatus } = await N.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permissions not granted");
    return null;
  }

  return true;
}

// ── Schedule a notification ───────────────────────────────────────────────────
export async function scheduleNotification(
  reminderId: string,
  date: Date,
  time: string
): Promise<string | null> {
  const N = getNotifications();
  if (!N) {
    console.log("Notifications not available (Expo Go). Reminder saved to DB only.");
    return null;
  }

  try {
    // Parse the time string (format: "HH:MM AM/PM")
    const timeRegex = /(\d+):(\d+)\s+(AM|PM)/i;
    const match = time.match(timeRegex);

    if (!match) {
      console.error("Invalid time format");
      return null;
    }

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const notificationDate = new Date(date);
    notificationDate.setHours(hours, minutes, 0, 0);

    if (notificationDate <= new Date()) {
      console.log("Notification date is in the past, skipping");
      return null;
    }

    // Request permissions before scheduling
    await registerForPushNotificationsAsync();

    const notificationId = await N.scheduleNotificationAsync({
      content: {
        title: "⏰ Payment Reminder",
        body: "Your scheduled payment is due! Check your app for details.",
        sound: true,
        priority: N.AndroidNotificationPriority.HIGH,
        data: { reminderId, type: "payment_reminder" },
        badge: 1,
        color: "#FF6B6B",
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
      identifier: `reminder-${reminderId}`,
    });

    console.log("Scheduled notification:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

// ── Cancel a specific reminder's notification ─────────────────────────────────
export async function cancelNotification(reminderId: string): Promise<boolean> {
  const N = getNotifications();
  if (!N) return true; // nothing to cancel in Expo Go

  try {
    await N.cancelScheduledNotificationAsync(`reminder-${reminderId}`);
    console.log("Cancelled notification for reminder:", reminderId);
    return true;
  } catch (error) {
    console.error("Error cancelling notification:", error);
    return false;
  }
}

// ── Cancel all ────────────────────────────────────────────────────────────────
export async function cancelAllNotifications(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return true;

  try {
    await N.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
    return true;
  } catch (error) {
    console.error("Error cancelling all notifications:", error);
    return false;
  }
}