import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import styles from "../../assets/styles/profile.styles";
import COLORS from "../../constants/colors";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";

export default function Profile() {
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [cleanedToday, setCleanedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTime = await AsyncStorage.getItem("reminderTime");
        const savedCleaned = await AsyncStorage.getItem("cleanedToday");
        const savedDate = await AsyncStorage.getItem("cleanedDate");

        const today = new Date().toDateString();
        setReminderTime(savedTime ? new Date(savedTime) : defaultReminderTime());
        setCleanedToday(savedCleaned === "true" && savedDate === today);
      } catch (error) {
        console.error("Failed to load reminder data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const defaultReminderTime = () => {
    const date = new Date();
    date.setHours(20, 0, 0, 0);
    return date;
  };

  // Reminder checker
  useEffect(() => {
    if (isLoading) return;

    const checkReminder = setInterval(() => {
      const now = new Date();
      const reminder = new Date(reminderTime);

      if (
        !cleanedToday &&
        now.getHours() === reminder.getHours() &&
        now.getMinutes() === reminder.getMinutes()
      ) {
        Alert.alert(
          "Litter Box Reminder",
          "It's time to clean your litter box! 🧼",
          [
            { text: "Later", onPress: handleLater, style: "cancel" },
            { text: "Cleaned", onPress: handleCleaned },
          ]
        );
      }
    }, 60000);

    return () => clearInterval(checkReminder);
  }, [reminderTime, cleanedToday, isLoading]);

  const handleLater = () => {
    const tenMinsLater = new Date(Date.now() + 10 * 60 * 1000);
    Alert.alert("Reminder Snoozed 😺", "I’ll remind you again in 10 minutes!");
    setReminderTime(tenMinsLater);
  };

  const handleCleaned = async () => {
    const today = new Date().toDateString();
    setCleanedToday(true);
    await AsyncStorage.setItem("cleanedToday", "true");
    await AsyncStorage.setItem("cleanedDate", today);
    Alert.alert("Great job! 🧽", "Litter box cleaned. Reminder will reset tomorrow.");
  };

  const handleChangeTime = async (event, selectedTime) => {
    setShowPicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
      await AsyncStorage.setItem("reminderTime", selectedTime.toISOString());
      Alert.alert(
        "Reminder Updated",
        `You'll be reminded daily at ${selectedTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* 🧹 Reminder Card */}
      <View style={[styles.card, { alignItems: "center", paddingVertical: 30 }]}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.primary} />
        <Text style={[styles.title, { marginTop: 10 }]}>Daily Litter Box Reminder</Text>

        {cleanedToday ? (
          <>
            <Text style={[styles.subtitle, { textAlign: "center", marginTop: 8 }]}>
              You’ve already cleaned the litter box today! 🎉
            </Text>
            <Text style={styles.subtitleSmall}>
              Next reminder at{" "}
              {reminderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} tomorrow.
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.subtitle, { textAlign: "center", marginTop: 10 }]}>
              It’s time to clean your litter box! 🧼
            </Text>
            <Text style={[styles.subtitleSmall, { marginTop: 4 }]}>
              Reminder set for{" "}
              {reminderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} today.
            </Text>

            {/* Centered Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 25, gap: 15 }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: COLORS.border,
                    paddingHorizontal: 25,
                    paddingVertical: 12,
                    borderRadius: 12,
                  },
                ]}
                onPress={handleLater}
              >
                <Text style={[styles.buttonText, { color: COLORS.textPrimary }]}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: COLORS.primary,
                    paddingHorizontal: 25,
                    paddingVertical: 12,
                    borderRadius: 12,
                  },
                ]}
                onPress={handleCleaned}
              >
                <Text style={[styles.buttonText, { color: COLORS.white }]}>Cleaned</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Change Time Button */}
        <TouchableOpacity
          style={{
            marginTop: 25,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
          }}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          <Text style={[styles.link, { color: COLORS.primary, fontWeight: "600" }]}>
            Change Reminder Time
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChangeTime}
        />
      )}
    </View>
  );
}
