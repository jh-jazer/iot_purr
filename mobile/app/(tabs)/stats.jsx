import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/stats.styles";
import { API_URL } from "../../constants/api";

const screenWidth = Dimensions.get("window").width;
const timeRanges = ["Today", "This Week", "This Month"];

const Stats = () => {
  const [selectedRange, setSelectedRange] = useState("Today");
  const [cat, setCat] = useState(null);
  const [stats, setStats] = useState(null);
  const [rawLogs, setRawLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (rawLogs.length > 0) {
      processStats(rawLogs, selectedRange);
    } else {
      // Clear stats if no logs
      setStats({ labels: [], visits: [], weight: [], waste: [], visitLength: [] });
    }
  }, [selectedRange, rawLogs]);

  const loadData = async () => {
    try {
      // Load local cat profile
      const savedCat = await AsyncStorage.getItem("myCat");
      const savedOwner = await AsyncStorage.getItem("ownerName");

      if (savedCat) {
        const parsedCat = JSON.parse(savedCat);
        // Ensure we show the owner-assigned name if possible, or fallback
        setCat({ ...parsedCat, name: parsedCat.name });
      }

      // Fetch real logs
      const response = await fetch(`${API_URL}/cats/visits`);
      const logs = await response.json();

      if (response.ok) {
        setRawLogs(logs);
      } else {
        console.error("Failed to fetch logs:", logs.message);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const processStats = (logs, range) => {
    let filteredLogs = [];
    let labels = [];
    let visitsData = [];
    let weightData = [];
    let wasteData = [];
    let visitLengthData = [];

    const now = new Date();

    // Normalize "today" to begin of day for comparison if needed, 
    // but for "Today" filter we just check date string match.
    // However, backend dates are UTC ISO. We need to handle local time.
    // For simplicity, we'll use local date string logic.

    const toLocalDateString = (isoString) => {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    };

    const todayStr = toLocalDateString(now);

    const getDuration = (entry, exit) => {
      if (!exit) return 5; // Default 5 mins if no exit time
      const start = new Date(entry);
      const end = new Date(exit);
      const diffMs = end - start;
      return Math.max(1, Math.round(diffMs / 60000));
    };

    if (range === "Today") {
      filteredLogs = logs.filter(log => toLocalDateString(log.entryTime) === todayStr);

      // Sort ascending by time
      filteredLogs.sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

      if (filteredLogs.length === 0) {
        setStats({ labels: [], visits: [], weight: [], waste: [], visitLength: [] });
        return;
      }

      // Format: "HH:MM"
      labels = filteredLogs.map(log => {
        const d = new Date(log.entryTime);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });

      visitsData = filteredLogs.map(() => 1);
      weightData = filteredLogs.map(log => log.weightIn);
      wasteData = filteredLogs.map(log => log.wasteWeight || 0);
      visitLengthData = filteredLogs.map(log => getDuration(log.entryTime, log.exitTime || log.updatedAt)); // Use updatedAt as fallback exit if strictly needed?
      // Actually, for single point logs (weight only), duration is effectively 0 or small. 
      // Let's assume 2 mins for standard weight in/out if undefined.
      visitLengthData = filteredLogs.map(log => 2);

    } else {
      // Week or Month
      const cutoffDate = new Date(now);
      if (range === "This Week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (range === "This Month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      }

      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.entryTime);
        return logDate >= cutoffDate && logDate <= now;
      });

      // Group by Date (YYYY-MM-DD)
      const grouped = filteredLogs.reduce((acc, log) => {
        const dateKey = toLocalDateString(log.entryTime);
        if (!acc[dateKey]) {
          acc[dateKey] = {
            count: 0,
            totalWeight: 0,
            totalWaste: 0,
            // duration ignored for aggregate for now
          };
        }
        acc[dateKey].count += 1;
        acc[dateKey].totalWeight += log.weightIn;
        acc[dateKey].totalWaste += (log.wasteWeight || 0);
        return acc;
      }, {});

      const sortedDates = Object.keys(grouped).sort();

      // Format labels MM-DD
      labels = sortedDates.map(dateStr => {
        const [, month, day] = dateStr.split('-');
        return `${month}-${day}`;
      });

      visitsData = sortedDates.map(d => grouped[d].count);
      weightData = sortedDates.map(d => parseFloat((grouped[d].totalWeight / grouped[d].count).toFixed(2)));
      wasteData = sortedDates.map(d => grouped[d].totalWaste);
      visitLengthData = sortedDates.map(() => 5); // placeholder avg
    }

    setStats({
      labels,
      visits: visitsData,
      weight: weightData,
      waste: wasteData,
      visitLength: visitLengthData,
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stats</Text>
      </View>

      {/* TIME RANGE TABS */}
      <View style={styles.tabContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.tabButton,
              selectedRange === range && styles.activeTabButton,
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.tabText,
                selectedRange === range && styles.activeTabText,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CHARTS */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {cat && stats && stats.labels && stats.labels.length > 0 ? (
          <View style={styles.catSection}>
            <Text style={styles.catName}>{cat.name}'s Health</Text>

            {/* Visit Frequency - Hidden for Today */}
            {selectedRange !== "Today" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Visit Frequency</Text>
                <BarChart
                  data={{
                    labels: stats.labels,
                    datasets: [{ data: stats.visits }],
                  }}
                  width={screenWidth * 0.85}
                  height={220}
                  chartConfig={{
                    ...styles.chartConfig,
                    decimalPlaces: 0,
                  }}
                  style={styles.chart}
                  fromZero
                />
              </View>
            )}

            {/* Visit Length */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Visit Length (mins)</Text>
              <BarChart
                data={{
                  labels: stats.labels,
                  datasets: [{ data: stats.visitLength }],
                }}
                width={screenWidth * 0.85}
                height={220}
                chartConfig={{
                  ...styles.chartConfig,
                  decimalPlaces: 0,
                }}
                style={styles.chart}
                fromZero
              />
              <Text style={styles.avgText}>
                {selectedRange === "Today"
                  ? "Latest Duration: " + (stats.visitLength[stats.visitLength.length - 1] || 0) + " mins"
                  : "Avg Duration: " + (stats.visitLength[stats.visitLength.length - 1] || 0) + " mins"}
              </Text>
            </View>

            {/* Pet Weight */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cat Weight (kg)</Text>
              <LineChart
                data={{
                  labels: stats.labels,
                  datasets: [{ data: stats.weight }],
                }}
                width={screenWidth * 0.85}
                height={220}
                yAxisSuffix="kg"
                chartConfig={styles.chartConfig}
                bezier
                style={styles.chart}
              />
              <Text style={styles.avgText}>
                Average: {stats.weight[stats.weight.length - 1]} kg
              </Text>
            </View>

            {/* Waste Output */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Waste Weight (grams)</Text>
              <BarChart
                data={{
                  labels: stats.labels,
                  datasets: [{ data: stats.waste }],
                }}
                width={screenWidth * 0.85}
                height={220}
                yAxisSuffix="g"
                chartConfig={styles.chartConfig}
                style={styles.chart}
                fromZero
              />
              <Text style={styles.avgText}>
                Total: {stats.waste[stats.waste.length - 1]} g
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubtext}>
              {cat ? "Stats will appear once logs are recorded." : "Please set up your cat's profile in the Home tab."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;
