// styles/home.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 0.5,
    color: COLORS.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  bookCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  bookImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: COLORS.border,
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  bookDetails: {
    padding: 4,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },

    sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  cardItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  cardSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },

  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 12,
  backgroundColor: COLORS.background,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.border,
  marginBottom: 12,
},

headerTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: COLORS.textPrimary,
},

addButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: COLORS.primary,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",
  alignItems: "center",
},

bottomSheet: {
  position: "absolute",
  bottom: 0,
  width: "100%",
  backgroundColor: COLORS.cardBackground,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: -3 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 10,
  alignItems: "center",
},

sheetTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: COLORS.textPrimary,
  marginBottom: 20,
},

sheetButton: {
  width: "90%",
  backgroundColor: COLORS.primary,
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

sheetButtonText: {
  color: COLORS.white,
  fontWeight: "600",
  marginLeft: 8,
  fontSize: 15,
},

modalContent: {
  width: "85%",
  backgroundColor: COLORS.cardBackground,
  borderRadius: 20,
  padding: 20,
  shadowColor: COLORS.black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 8,
},

modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: COLORS.textPrimary,
  marginBottom: 16,
  textAlign: "center",
},

input: {
  backgroundColor: COLORS.inputBackground,
  borderColor: COLORS.border,
  borderWidth: 1,
  borderRadius: 12,
  padding: 12,
  color: COLORS.textPrimary,
  fontSize: 15,
  marginBottom: 12,
},

modalActions: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
},

cancelButton: {
  flex: 1,
  backgroundColor: COLORS.border,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  marginRight: 8,
},

cancelText: {
  color: COLORS.textPrimary,
  fontWeight: "500",
},

saveButton: {
  flex: 1,
  backgroundColor: COLORS.primary,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  marginLeft: 8,
},

saveText: {
  color: COLORS.white,
  fontWeight: "600",
},

});

export default styles;