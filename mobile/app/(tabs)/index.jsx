import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/home.styles";

const Home = () => {
  const [showAddOptions, setShowAddOptions] = useState(false); // Kept for "Add Device" if needed
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [cat, setCat] = useState(null);
  const [catName, setCatName] = useState("");
  const [catWeight, setCatWeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCat();
  }, []);

  const loadCat = async () => {
    try {
      const savedCat = await AsyncStorage.getItem("myCat");
      if (savedCat) {
        setCat(JSON.parse(savedCat));
      }
    } catch (error) {
      console.error("Failed to load cat", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCat = async () => {
    if (!catName.trim()) {
      Alert.alert("Error", "Please enter a name for your cat.");
      return;
    }

    if (!catWeight.trim() || isNaN(catWeight)) {
      Alert.alert("Error", "Please enter a valid weight (kg).");
      return;
    }

    const newCat = {
      id: cat?.id || Date.now(),
      name: catName,
      weight: catWeight,
    };

    try {
      await AsyncStorage.setItem("myCat", JSON.stringify(newCat));
      setCat(newCat);
      setShowEditCatModal(false);
      setCatName("");
      setCatWeight("");
      Alert.alert("Success", "Cat profile updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to save cat profile.");
    }
  };

  const openEditModal = () => {
    if (cat) {
      setCatName(cat.name);
      setCatWeight(cat.weight ? cat.weight.toString() : "");
    } else {
      setCatName("");
      setCatWeight("");
    }
    setShowEditCatModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Home</Text>
        {/* Optional: Add Device Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddOptions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {cat ? (
          <View style={styles.petCard}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: COLORS.inputBackground,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.border
            }}>
              <Ionicons name="paw" size={32} color={COLORS.primary} />
            </View>

            <View style={styles.petInfo}>
              <Text style={styles.petName}>{cat.name}</Text>
              <Text style={styles.petRfid}>
                {cat.weight ? `Weight: ${cat.weight} kg` : "Weight not set"}
              </Text>
            </View>

            <TouchableOpacity onPress={openEditModal} style={{ padding: 8 }}>
              <Ionicons name="pencil-outline" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No cat profile set</Text>
            <Text style={styles.emptySubtext}>Set up your cat's profile to start monitoring.</Text>

            <TouchableOpacity
              style={[styles.sheetButton, { marginTop: 20, width: "auto", paddingHorizontal: 32 }]}
              onPress={openEditModal}
            >
              <Text style={styles.sheetButtonText}>Set Up Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ADD OPTIONS MODAL (For Devices) */}
      <Modal
        visible={showAddOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddOptions(false)}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Add New</Text>

            <TouchableOpacity
              style={styles.sheetButton}
              onPress={() => {
                setShowAddOptions(false);
                Alert.alert("Scanning", "Scanning for nearby devices...");
              }}
            >
              <Ionicons name="hardware-chip-outline" size={20} color={COLORS.white} />
              <Text style={styles.sheetButtonText}>Add Device</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* EDIT/ADD CAT MODAL */}
      <Modal
        visible={showEditCatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditCatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {cat ? "Edit Cat Profile" : "Set Cat Profile"}
            </Text>

            <Text style={{ marginBottom: 8, color: COLORS.textPrimary, fontWeight: "600" }}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Luna"
              placeholderTextColor={COLORS.textSecondary}
              value={catName}
              onChangeText={setCatName}
            />

            <Text style={{ marginBottom: 8, color: COLORS.textPrimary, fontWeight: "600" }}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4.5"
              placeholderTextColor={COLORS.textSecondary}
              value={catWeight}
              onChangeText={setCatWeight}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditCatModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCat}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
