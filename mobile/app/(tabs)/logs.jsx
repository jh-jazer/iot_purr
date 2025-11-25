import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/logs.styles";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch logs (replace URL with your backend endpoint)
  const fetchLogs = async () => {
    try {
      // const response = await fetch("https://your-backend-url.onrender.com/api/logs");
      // const data = await response.json();

      // Mock data based on user request
      const demoData = [
        {
          _id: "1",
          date: "2025-11-25",
          entryTime: "08:30 AM",
          exitTime: "08:35 AM",
          catWeight: 4.8,
          wasteWeight: 75,
          visitNumber: 3,
        },
        {
          _id: "2",
          date: "2025-11-25",
          entryTime: "01:15 PM",
          exitTime: "01:20 PM",
          catWeight: 4.85,
          wasteWeight: 0, // Maybe just peed or didn't leave waste? Or just 0 change.
          visitNumber: 2,
        },
        {
          _id: "3",
          date: "2025-11-25",
          entryTime: "06:00 AM",
          exitTime: "06:05 AM",
          catWeight: 4.7,
          wasteWeight: 60,
          visitNumber: 1,
        },
      ];

      setLogs(demoData);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      {/* Header: Date & Visit # */}
      <View style={styles.logHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.catName}>{item.date}</Text>
        </View>
        <View style={{ backgroundColor: COLORS.inputBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={[styles.logTime, { color: COLORS.primary, fontWeight: "600" }]}>
            Visit #{item.visitNumber}
          </Text>
        </View>
      </View>

      {/* Time Details */}
      <View style={[styles.logDetails, { marginBottom: 12 }]}>
        <View style={styles.logItem}>
          <Ionicons name="enter-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.logLabel}>In:</Text>
          <Text style={styles.logValue}>{item.entryTime}</Text>
        </View>
        <View style={styles.logItem}>
          <Ionicons name="exit-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.logLabel}>Out:</Text>
          <Text style={styles.logValue}>{item.exitTime}</Text>
        </View>
      </View>

      {/* Weight Details */}
      <View style={styles.logDetails}>
        <View style={styles.logItem}>
          <Ionicons name="scale-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.logLabel}>Weight:</Text>
          <Text style={styles.logValue}>{item.catWeight} kg</Text>
        </View>
        <View style={styles.logItem}>
          <Ionicons name="trash-bin-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.logLabel}>Waste:</Text>
          <Text style={[styles.logValue, { color: item.wasteWeight > 0 ? COLORS.primary : COLORS.textSecondary }]}>
            {item.wasteWeight > 0 ? `+${item.wasteWeight} g` : "--"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activity Logs</Text>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activity logs yet.</Text>
          <Text style={styles.emptySubtext}>
            Logs will appear here when your cat uses the litter box.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default Logs;
