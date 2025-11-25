import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  catSelector: {
    margin: 16,
  },
  catSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catSelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primary + "20",
  },
  dropdownItemText: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.white,
  },

  scrollContent: {
    paddingBottom: 50,
    alignItems: "center",
  },
  catSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  catName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 8,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  avgText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },

  chartConfig: {
    backgroundColor: COLORS.cardBackground,
    backgroundGradientFrom: COLORS.cardBackground,
    backgroundGradientTo: COLORS.cardBackground,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.7})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
  },
});

export default styles;
