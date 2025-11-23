import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/stats.styles";

const screenWidth = Dimensions.get("window").width;
const timeRanges = ["Last 7 Days", "Last 30 Days", "6 Months"];

const Stats = () => {
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const [cats, setCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("https://your-backend-url.onrender.com/api/cats");
        const data = await res.json();

        const catsWithStats = data.map((cat) => ({
          ...cat,
          stats: {
            weight: [4.7, 4.8, 4.75, 4.72, 4.7],
            waste: [70, 75, 80, 72, 78],
            visits: [3, 4, 5, 2, 4],
          },
        }));

        setCats(catsWithStats);
        setSelectedCat(catsWithStats[0]);
      } catch (error) {
        console.error("Failed to fetch cats:", error);
      }
    };

    fetchCats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stats</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <Ionicons name="add" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* CAT SELECTOR */}
      <View style={styles.catSelector}>
        <TouchableOpacity
          style={styles.catSelectorButton}
          onPress={() => setShowCatDropdown((prev) => !prev)}
        >
          <Text style={styles.catSelectorText}>
            {selectedCat ? selectedCat.name : "Select a Cat"}
          </Text>
          <Ionicons
            name={showCatDropdown ? "chevron-up" : "chevron-down"}
            size={18}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        {showCatDropdown && (
          <View style={styles.dropdown}>
            {cats.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.dropdownItem,
                  selectedCat?._id === cat._id && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedCat(cat);
                  setShowCatDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCat?._id === cat._id && styles.dropdownItemTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedCat ? (
          <View style={styles.catSection}>
            <Text style={styles.catName}>{selectedCat.name}</Text>

            {/* Pet Weight */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pet Weight (kg)</Text>
              <LineChart
                data={{
                  labels: ["1", "10", "15", "20", "25"],
                  datasets: [{ data: selectedCat.stats.weight }],
                }}
                width={screenWidth * 0.9}
                height={180}
                yAxisSuffix="kg"
                chartConfig={styles.chartConfig}
                bezier
                style={styles.chart}
              />
              <Text style={styles.avgText}>
                Stable Average:{" "}
                {selectedCat.stats.weight[
                  selectedCat.stats.weight.length - 1
                ]}{" "}
                kg
              </Text>
            </View>

            {/* Waste Output */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Waste Output (grams)</Text>
              <BarChart
                data={{
                  labels: ["1", "10", "15", "20", "25"],
                  datasets: [{ data: selectedCat.stats.waste }],
                }}
                width={screenWidth * 0.9}
                height={180}
                yAxisSuffix="g"
                chartConfig={styles.chartConfig}
                style={styles.chart}
              />
              <Text style={styles.avgText}>Average Waste: 75 g</Text>
            </View>

            {/* Litter Box Visits */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Litter Box Visits</Text>
              <BarChart
                data={{
                  labels: ["1", "10", "15", "20", "25"],
                  datasets: [{ data: selectedCat.stats.visits }],
                }}
                width={screenWidth * 0.9}
                height={180}
                chartConfig={styles.chartConfig}
                style={styles.chart}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Select a cat to view stats</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;
