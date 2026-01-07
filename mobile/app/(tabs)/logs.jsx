import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/logs.styles";
import { API_URL } from "../../constants/api";

const Logs = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch logs via API
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/cats/visits`);
      const data = await response.json();

      if (Array.isArray(data)) {
        // Group visits by date
        const groupedByDate = {};

        data.forEach((visit, index) => {
          const entryDate = new Date(visit.entryTime);
          const dateStr = entryDate.toISOString().split('T')[0];
          const timeStr = entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const formattedVisit = {
            _id: visit._id,
            date: dateStr,
            entryTime: timeStr,
            catWeight: visit.weightIn,
            visitNumber: data.length - index
          };

          if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = [];
          }
          groupedByDate[dateStr].push(formattedVisit);
        });

        // Convert to sections format for SectionList
        const sectionsArray = Object.keys(groupedByDate)
          .sort((a, b) => new Date(b) - new Date(a)) // Sort dates descending (newest first)
          .map(date => ({
            title: date,
            data: groupedByDate[date]
          }));

        setSections(sectionsArray);
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

  const renderSectionHeader = ({ section: { title } }) => {
    const date = new Date(title);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <View style={{
        backgroundColor: COLORS.inputBackground,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: COLORS.textPrimary,
        }}>
          {formattedDate}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      {/* Header: Time & Visit # */}
      <View style={styles.logHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.catName}>{item.entryTime}</Text>
        </View>
      </View>

      {/* Weight Details */}
      <View style={styles.logDetails}>
        <View style={styles.logItem}>
          <Ionicons name="scale-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.logLabel}>Weight:</Text>
          <Text style={styles.logValue}>{item.catWeight} kg</Text>
        </View>

      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activity Logs</Text>

      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activity logs yet.</Text>
          <Text style={styles.emptySubtext}>
            Logs will appear here when your cat uses the litter box.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

export default Logs;
