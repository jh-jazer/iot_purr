import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/logs.styles";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch logs (replace URL with your backend endpoint)
  const fetchLogs = async () => {
    try {
      const response = await fetch("https://your-backend-url.onrender.com/api/logs");
      const data = await response.json();

      // Example fallback data (for demo)
      const demoData = [
        {
          _id: "1",
          time: "2025-11-03 08:30 AM",
          catName: "Milo",
          catWeight: 4.8,
          wasteWeight: 75,
        },
        {
          _id: "2",
          time: "2025-11-03 09:10 AM",
          catName: "Luna",
          catWeight: 4.5,
          wasteWeight: 68,
        },
        {
          _id: "3",
          time: "2025-11-03 10:00 AM",
          catName: "Oreo",
          catWeight: 5.2,
          wasteWeight: 80,
        },
      ];

      setLogs(data.length ? data : demoData);
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
      <View style={styles.logHeader}>
        <Text style={styles.catName}>{item.catName}</Text>
        <Text style={styles.logTime}>{item.time}</Text>
      </View>
      <View style={styles.logDetails}>
        <View style={styles.logItem}>
          <Text style={styles.logLabel}>Weight:</Text>
          <Text style={styles.logValue}>{item.catWeight} kg</Text>
        </View>
        <View style={styles.logItem}>
          <Text style={styles.logLabel}>Waste:</Text>
          <Text style={styles.logValue}>{item.wasteWeight} g</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cat Activity Logs</Text>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activity logs available.</Text>
          <Text style={styles.emptySubtext}>
            Once your cats start using the litter box, their activity will appear here.
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
