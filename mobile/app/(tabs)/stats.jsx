import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/stats.styles";

const screenWidth = Dimensions.get("window").width;
const timeRanges = ["Today", "This Week", "This Month"];

const Stats = () => {
  const [selectedRange, setSelectedRange] = useState("Today");
  const [cat, setCat] = useState(null);
  const [stats, setStats] = useState(null);
  const [rawLogs, setRawLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (rawLogs.length > 0) {
      processStats(rawLogs, selectedRange);
    }
  }, [selectedRange, rawLogs]);

  const loadData = async () => {
    try {
      // Load local cat profile
      const savedCat = await AsyncStorage.getItem("myCat");
      if (savedCat) {
        const parsedCat = JSON.parse(savedCat);
        setCat(parsedCat);

        // Mock fetching logs (In a real app, this would be an API call)
        const demoLogs = [
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
            wasteWeight: 0,
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
          {
            _id: "4",
            date: "2025-11-24",
            entryTime: "07:00 AM",
            exitTime: "07:05 AM",
            catWeight: 4.75,
            wasteWeight: 50,
            visitNumber: 1,
          },
          {
            _id: "5",
            date: "2025-11-24",
            entryTime: "05:00 PM",
            exitTime: "05:05 PM",
            catWeight: 4.8,
            wasteWeight: 80,
            visitNumber: 2,
          },
          {
            _id: "6",
            date: "2025-11-23",
            entryTime: "08:00 AM",
            exitTime: "08:05 AM",
            catWeight: 4.7,
            wasteWeight: 65,
            visitNumber: 1,
          },
        ];

        setRawLogs(demoLogs);
        // processStats will be triggered by useEffect
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
      setIsLoading(false);
    }
  };

  const processStats = (logs, range) => {
    let filteredLogs = [];
    let labels = [];
    let visitsData = [];
    let weightData = [];
    let wasteData = [];
    let visitLengthData = [];

    // Helper to parse date string "YYYY-MM-DD"
    const parseDate = (dateStr) => new Date(dateStr);
    const today = new Date("2025-11-25"); // Hardcoded for demo purposes

    // Helper to calculate duration in minutes
    // Helper to calculate duration in minutes
    const getDuration = (entry, exit) => {
      // Helper to convert "08:30 AM" to 24h format for easier date creation
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours}:${minutes}`;
      };

      const start = new Date(`2000/01/01 ${parseTime(entry)}`);
      const end = new Date(`2000/01/01 ${parseTime(exit)}`);

      let diffMs = end - start;
      // Handle case where exit is next day (e.g. 11:50 PM to 12:10 AM) - though unlikely for litter box
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
      }

      return Math.round(diffMs / 60000); // minutes
    };

    if (range === "Today") {
      // Filter for today
      filteredLogs = logs.filter(log => log.date === "2025-11-25");

      // Sort by entryTime
      filteredLogs.sort((a, b) => {
        const timeA = new Date(`2000/01/01 ${a.entryTime}`);
        const timeB = new Date(`2000/01/01 ${b.entryTime}`);
        return timeA - timeB;
      });

      if (filteredLogs.length === 0) {
        setStats({ labels: [], visits: [], weight: [], waste: [], visitLength: [] });
        return;
      }

      // For Today, x-axis is time, y-axis is individual log values
      labels = filteredLogs.map(log => log.entryTime.split(" ")[0] + log.entryTime.split(" ")[1].toLowerCase()); // "08:30am"
      visitsData = filteredLogs.map(() => 1); // Not used for display in Today
      weightData = filteredLogs.map(log => log.catWeight);
      wasteData = filteredLogs.map(log => log.wasteWeight);
      visitLengthData = filteredLogs.map(log => getDuration(log.entryTime, log.exitTime));

    } else {
      // For Week and Month, group by Date
      const cutoffDate = new Date(today);
      if (range === "This Week") {
        cutoffDate.setDate(today.getDate() - 7);
      } else if (range === "This Month") {
        cutoffDate.setDate(1); // Start of month
      }

      filteredLogs = logs.filter(log => {
        const logDate = parseDate(log.date);
        return logDate >= cutoffDate && logDate <= today;
      });

      const groupedLogs = filteredLogs.reduce((acc, log) => {
        if (!acc[log.date]) {
          acc[log.date] = {
            visits: 0,
            totalWeight: 0,
            countWeight: 0,
            totalWaste: 0,
            totalDuration: 0,
          };
        }
        acc[log.date].visits += 1;
        acc[log.date].totalWeight += log.catWeight;
        acc[log.date].countWeight += 1;
        acc[log.date].totalWaste += log.wasteWeight;
        acc[log.date].totalDuration += getDuration(log.entryTime, log.exitTime);
        return acc;
      }, {});

      const sortedDates = Object.keys(groupedLogs).sort();
      labels = sortedDates.map(date => date.slice(5)); // "11-25"
      visitsData = sortedDates.map(date => groupedLogs[date].visits);
      weightData = sortedDates.map(date =>
        parseFloat((groupedLogs[date].totalWeight / groupedLogs[date].countWeight).toFixed(2))
      );
      wasteData = sortedDates.map(date => groupedLogs[date].totalWaste);
      visitLengthData = sortedDates.map(date =>
        Math.round(groupedLogs[date].totalDuration / groupedLogs[date].visits)
      );
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cat && stats && stats.labels && stats.labels.length > 0 && stats.visitLength ? (
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
