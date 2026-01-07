import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";

import styles from "../../assets/styles/profile.styles";
import COLORS from "../../constants/colors";
import ProfileHeader from "../../components/ProfileHeader";
import { generateAllAlerts } from "../../services/alertService";
import { API_URL } from "../../constants/api";

export default function Profile() {
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [cleanedToday, setCleanedToday] = useState(false);
  const [monitoringMode, setMonitoringMode] = useState("standard");
  const [isLoading, setIsLoading] = useState(true);

  // Personal App State
  const [ownerName, setOwnerName] = useState("Me");
  const [ownerAvatar, setOwnerAvatar] = useState(null);
  const [isEditingNameModal, setIsEditingNameModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [catName, setCatName] = useState("My Cat");

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const savedTime = await AsyncStorage.getItem("reminderTime");
          const savedCleaned = await AsyncStorage.getItem("cleanedToday");
          const savedOwner = await AsyncStorage.getItem("ownerName");
          const savedAvatar = await AsyncStorage.getItem("ownerAvatar");
          const savedMode = await AsyncStorage.getItem("monitoringMode");
          const savedCat = await AsyncStorage.getItem("myCat");

          const today = new Date().toDateString();
          setReminderTime(savedTime ? new Date(savedTime) : defaultReminderTime());
          // Fix: savedDate was not defined in original code, assuming logic checks last clean date
          const savedCleanDate = await AsyncStorage.getItem("cleanedDate");
          setCleanedToday(savedCleaned === "true" && savedCleanDate === today);

          if (savedOwner) setOwnerName(savedOwner);
          if (savedAvatar) setOwnerAvatar(savedAvatar);
          if (savedMode) setMonitoringMode(savedMode);
          if (savedCat) {
            const parsedCat = JSON.parse(savedCat);
            if (parsedCat.name) setCatName(parsedCat.name);
          }

          // Initial alert check
          const nameToUse = savedCat ? JSON.parse(savedCat).name : "My Cat";
          checkForAlerts(false, nameToUse);
        } catch (error) {
          console.error("Failed to load reminder data", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const checkForAlerts = async (showPopup = true, specificCatName = null) => {
    try {
      const response = await fetch(`${API_URL}/cats/visits`);
      if (!response.ok) return; // Silent fail if API issues

      const visits = await response.json();
      const nameForAlerts = specificCatName || catName;
      const newAlerts = generateAllAlerts(visits, nameForAlerts, monitoringMode);
      setAlerts(newAlerts);

      if (showPopup) {
        if (newAlerts.length > 0) {
          Alert.alert("Analysis Complete", `Found ${newAlerts.length} potential health alert(s).`);
        } else {
          Alert.alert("Analysis Complete", "No health alerts detected. Good job!");
        }
      }
    } catch (e) {
      console.log("Error checking alerts", e);
      if (showPopup) Alert.alert("Error", "Could not check analysis");
    }
  };

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

  const openNameEditor = () => {
    setTempName(ownerName);
    setIsEditingNameModal(true);
  };

  const saveOwnerName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      await AsyncStorage.setItem("ownerName", tempName);
      setOwnerName(tempName);
      setIsEditingNameModal(false);
    } catch (e) {
      Alert.alert("Error", "Failed to save name");
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Sorry, we need camera roll permissions to make this work!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setOwnerAvatar(uri);
        await AsyncStorage.setItem("ownerAvatar", uri);
      }
    } catch (e) {
      console.error("Pick image error", e);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleModeSelect = async (mode) => {
    try {
      setMonitoringMode(mode);
      await AsyncStorage.setItem("monitoringMode", mode);
    } catch (e) {
      console.error("Failed to save mode", e);
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <ProfileHeader
        name={ownerName}
        avatar={ownerAvatar}
        onEditName={openNameEditor}
        onEditAvatar={pickImage}
      />



      {showPicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChangeTime}
        />
      )}

      {/* EDIT NAME MODAL */}
      <Modal
        visible={isEditingNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingNameModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', width: '80%', padding: 20, borderRadius: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Edit Your Name</Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20
              }}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
              autoFocus
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity onPress={() => setIsEditingNameModal(false)} style={{ padding: 10 }}>
                <Text style={{ color: COLORS.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveOwnerName}
                style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HEALTH MONITORING SETTINGS */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
          <Ionicons name="fitness-outline" size={24} color={COLORS.primary} />
          <Text style={[styles.title, { marginLeft: 10, marginTop: 0 }]}>Health Monitoring</Text>
        </View>

        <Text style={[styles.subtitle, { marginBottom: 10 }]}>Monitoring Mode</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {["strict", "standard", "kitten"].map((mode) => {
            const isSelected = monitoringMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? COLORS.primary : COLORS.border,
                  backgroundColor: isSelected ? COLORS.primary : "transparent",
                }}
                onPress={() => handleModeSelect(mode)}
              >
                <Text style={{
                  color: isSelected ? COLORS.white : COLORS.textSecondary,
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 12
                }}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.subtitleSmall, { color: COLORS.textSecondary, lineHeight: 18 }]}>
          • <Text style={{ fontWeight: "600" }}>Strict:</Text> For senior cats or cats with health conditions{"\n"}
          • <Text style={{ fontWeight: "600" }}>Standard:</Text> Default monitoring for adult cats{"\n"}
          • <Text style={{ fontWeight: "600" }}>Kitten:</Text> Higher thresholds for young, active cats
        </Text>

        <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border }}>
          <Text style={[styles.subtitle, { marginBottom: 8 }]}>Baseline Status</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
              Baseline established • 7+ days of data
            </Text>
          </View>
        </View>
      </View>

      {/* ACTIVE ALERTS PREVIEW */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.title, { marginLeft: 10, marginTop: 0 }]}>Active Alerts</Text>
          </View>
          <View style={{ backgroundColor: alerts.length > 0 ? COLORS.error || "red" : COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "700" }}>{alerts.length}</Text>
          </View>
        </View>

        {alerts.length === 0 ? (
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: "center", paddingVertical: 20 }}>
            No active alerts. Your cat's health metrics are normal!
          </Text>
        ) : (
          <View style={{ marginBottom: 20, gap: 10 }}>
            {alerts.map((alert) => (
              <View key={alert.id} style={{
                backgroundColor: '#FEF2F2',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: alert.severity === 'critical' ? 'red' : 'orange'
              }}>
                <Text style={{ fontWeight: 'bold', color: '#B91C1C', marginBottom: 4 }}>
                  {alert.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={{ fontSize: 13, color: '#450a0a', lineHeight: 18 }}>
                  {alert.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: COLORS.primary,
            gap: 6,
          }}
          onPress={() => checkForAlerts(true)}
        >
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Check for Alerts</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
