import React, { useEffect, useState, useCallback } from "react";
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
import { API_URL } from "../../constants/api";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch logs via API
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/cats/visits`);
      const data = await response.json();

      if (Array.isArray(data)) {
        // Transform backend data to frontend model (if needed)
        // Backend: { _id, entryTime, weightIn, weightOut, wasteWeight, ... }
        // Frontend Expected: { _id, date, entryTime: "HH:MM AM", exitTime, catWeight, ... }

        const formattedLogs = data.map((visit, index) => {
          const entryDate = new Date(visit.entryTime);

          // Format Date: YYYY-MM-DD
          const dateStr = entryDate.toISOString().split('T')[0];

          // Format Time: 08:30 AM
          const timeStr = entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // For now, exit time is same or undefined, let's just make it +5 mins for display if missing
          // or just show "--"
          const exitTimeStr = visit.lastVisit ? "--" : timeStr; // Simplified

          return {
            _id: visit._id,
            date: dateStr,
            entryTime: timeStr,
            exitTime: "--", // We haven't implemented duration tracking yet
            catWeight: visit.weightIn,
            wasteWeight: visit.wasteWeight || 0,
            visitNumber: data.length - index // Simple generic numbering (newest first)
          };
        });
        setLogs(formattedLogs);
      }
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs();
  }, []);

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
        {/* Removed Exit Time for now as it's not tracked */}
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
